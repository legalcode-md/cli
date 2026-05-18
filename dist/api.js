import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const API_URL = process.env.LEGALCODE_API_URL ?? "https://api.legalcode.md/v1";
const AUTH_URL = process.env.LEGALCODE_WEB_URL ?? "https://legalcode.md";
const CRED_PATH = path.join(os.homedir(), ".legalcode", "credentials.json");
const DEFAULT_HTTP_TIMEOUT_MS = parseTimeoutMs(process.env.LEGALCODE_HTTP_TIMEOUT_MS, 15_000);
function parseTimeoutMs(raw, fallbackMs) {
    if (!raw)
        return fallbackMs;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMs;
}
function isAbortError(error) {
    return error instanceof Error && error.name === "AbortError";
}
export async function fetchWithTimeout(input, init = {}, timeoutMs = DEFAULT_HTTP_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const signal = init.signal
        ? AbortSignal.any([init.signal, controller.signal])
        : controller.signal;
    try {
        return await fetch(input, { ...init, signal });
    }
    finally {
        clearTimeout(timeout);
    }
}
export function getCredentials() {
    try {
        return JSON.parse(fs.readFileSync(CRED_PATH, "utf-8"));
    }
    catch {
        return null;
    }
}
export function saveCredentials(credentials) {
    const dir = path.dirname(CRED_PATH);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${CRED_PATH}.tmp`;
    fs.writeFileSync(tmp, `${JSON.stringify(credentials, null, 2)}\n`, "utf-8");
    fs.renameSync(tmp, CRED_PATH);
    fs.chmodSync(CRED_PATH, 0o600);
}
export function clearCredentials() {
    try {
        fs.unlinkSync(CRED_PATH);
    }
    catch {
        // Ignore missing credentials.
    }
}
function isExpired(expiresAt) {
    return Date.parse(expiresAt) - Date.now() < 60_000;
}
async function fetchUserInfo(accessToken) {
    const response = await fetchWithTimeout(`${AUTH_URL}/oauth/userinfo`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "legalcode-cli/0.1",
        },
    });
    if (!response.ok) {
        return {};
    }
    return (await response.json().catch(() => ({})));
}
async function refreshCredentials(credentials) {
    if (!credentials.refreshToken) {
        throw new Error("No refresh token available.");
    }
    const body = new URLSearchParams({
        client_id: credentials.clientId,
        grant_type: "refresh_token",
        refresh_token: credentials.refreshToken,
    });
    const response = await fetchWithTimeout(`${AUTH_URL}/oauth/token`, {
        body,
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "User-Agent": "legalcode-cli/0.1",
        },
        method: "POST",
    });
    if (!response.ok) {
        throw new Error(`Refresh failed (${response.status})`);
    }
    const token = (await response.json());
    const userInfo = await fetchUserInfo(token.access_token);
    const nextCredentials = {
        accessToken: token.access_token,
        clientId: credentials.clientId,
        createdAt: credentials.createdAt,
        email: userInfo.email ?? credentials.email,
        expiresAt: new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(),
        organizationId: userInfo.organization_id ?? credentials.organizationId,
        organizationSlug: userInfo.organization_slug ?? credentials.organizationSlug,
        refreshToken: token.refresh_token ?? credentials.refreshToken,
    };
    saveCredentials(nextCredentials);
    return nextCredentials;
}
export async function ensureCredentials() {
    if (process.env.LEGALCODE_ACCESS_TOKEN) {
        return {
            accessToken: process.env.LEGALCODE_ACCESS_TOKEN,
            clientId: process.env.LEGALCODE_CLIENT_ID ?? "legalcode-cli",
            createdAt: new Date().toISOString(),
            email: process.env.LEGALCODE_EMAIL,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            organizationId: process.env.LEGALCODE_ORGANIZATION_ID,
            organizationSlug: process.env.LEGALCODE_ORGANIZATION_SLUG,
            refreshToken: undefined,
        };
    }
    const credentials = getCredentials();
    if (!credentials) {
        return null;
    }
    if (!isExpired(credentials.expiresAt)) {
        return credentials;
    }
    if (!credentials.refreshToken) {
        clearCredentials();
        return null;
    }
    try {
        return await refreshCredentials(credentials);
    }
    catch {
        clearCredentials();
        return null;
    }
}
// ── HTTP client ──────────────────────────────────────────────────────
async function apiRequest(endpoint, params) {
    const creds = await ensureCredentials();
    if (!creds) {
        return {
            body: "Authentication required. Run: legalcode login",
            ok: false,
            status: 401,
        };
    }
    const headers = { "User-Agent": "legalcode-cli/0.1" };
    headers.Authorization = `Bearer ${creds.accessToken}`;
    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v)
                url.searchParams.set(k, v);
        }
    }
    let res;
    try {
        res = await fetchWithTimeout(url.toString(), { headers });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isAbortError(err)) {
            console.error(`Request to ${API_URL} timed out after ${DEFAULT_HTTP_TIMEOUT_MS} ms.`);
            console.error("Set LEGALCODE_HTTP_TIMEOUT_MS to increase the timeout if needed.");
            process.exit(1);
        }
        if (msg.includes("ENOTFOUND") || msg.includes("fetch failed")) {
            console.error(`Cannot reach API at ${API_URL}`);
            console.error("Check your connection or set LEGALCODE_API_URL.");
            process.exit(1);
        }
        throw err;
    }
    if (res.status === 401 && creds?.refreshToken && !process.env.LEGALCODE_ACCESS_TOKEN) {
        const refreshed = await refreshCredentials(creds).catch(() => null);
        if (refreshed) {
            const retry = await fetchWithTimeout(url.toString(), {
                headers: {
                    ...headers,
                    Authorization: `Bearer ${refreshed.accessToken}`,
                },
            });
            return {
                body: await retry.text(),
                ok: retry.ok,
                status: retry.status,
            };
        }
    }
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
}
function handleApiError(status, body) {
    if (status === 401)
        console.error("Authentication required. Run: legalcode login");
    else if (status === 403)
        console.error("Upgrade required. See: legalcode.md/plans");
    else if (status === 404)
        console.error("Source not found.");
    else if (status === 429)
        console.error("Rate limit exceeded. Wait or upgrade your plan.");
    else if (status >= 500)
        console.error(`Request failed (${status}). Try again later or contact support.`);
    else
        console.error(`Request failed (${status}): ${body}`);
    process.exit(1);
}
function safeDownloadFilename(sourceRef) {
    const parts = sourceRef.split("/");
    const raw = parts.length === 3 ? (parts[2] ?? "") : sourceRef.replace(/\//g, "-");
    const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^\.+$/, "");
    return `${safe || "legalcode-source"}.md`;
}
// Collect all flags into API params, skipping undefined
function buildParams(pairs) {
    const params = {};
    for (const [k, v] of pairs) {
        if (v)
            params[k] = v;
    }
    return params;
}
export function printLawsHelp() {
    console.log(`Search statutes and legislation

Usage: legalcode laws "<query>" [options]

Query syntax:
  Supports quoted phrases and flat AND/OR operators
  Does not support NOT, parentheses, or field:value clauses
  Examples: "privacy AND data protection"
            "GDPR OR 'General Data Protection'"
            "consumer protection act"

Facet filter values:
  Single value:     --status ACTIVE
  Multiple (OR):    --status "ACTIVE OR SUPERSEDED"
  Exclude (NOT):    --status "-REPEALED"               (minus prefix)
  Combined:         --status "ACTIVE OR SUPERSEDED -DRAFT"

Facet filters:
  --jurisdiction <code>    Country code (US, DE, EU, GB, FR, IS, BR, NZ...)
  --status <value>         ACTIVE, REPEALED, SUPERSEDED
  --act-type <value>       LAW, REGULATION, DIRECTIVE
  --document-nature <val>  BASE or AMENDMENT
  --in-force-on-date <d>   Find laws in force on a point-in-time date (YYYY-MM-DD)
  --level <value>          SUPRANATIONAL, NATIONAL, FEDERAL, STATE, REGIONAL, MUNICIPAL
  --language <code>        Language ISO code (en, de, fr, is, pt...)
  --subdivision <code>     State/region code (e.g. CA, NY, BAY)
  --law-key <id>           Specific law identifier for exact lookup
  --date-from <date>       Effective date range start (YYYY-MM-DD)
  --date-to <date>         Effective date range end (YYYY-MM-DD)

Result options:
  --sort <field>           Sort by: relevance (default), date, title
  --limit <n>              Max results (default 10)
  --offset <n>             Skip first n results (for pagination)

Examples:
  legalcode laws "data protection"
  legalcode laws "privacy" --jurisdiction EU --status ACTIVE
  legalcode laws "consumer protection" --jurisdiction US --subdivision CA
  legalcode laws "environmental regulation" --act-type REGULATION --level FEDERAL
  legalcode laws "copyright" --date-from 2020-01-01 --sort date
  legalcode laws "lög um persónuvernd" --jurisdiction IS --language is
`);
}
export async function handleLaws(query, opts) {
    const params = buildParams([
        ["q", query],
        ["type", "law"],
        ["jurisdiction", opts.jurisdiction],
        ["status", opts.status],
        ["act_type", opts.actType],
        ["document_nature", opts.documentNature],
        ["in_force_on_date", opts.inForceOnDate],
        ["jurisdiction_level", opts.level],
        ["language", opts.language],
        ["subdivision", opts.subdivision],
        ["law_key", opts.lawKey],
        ["date_from", opts.dateFrom],
        ["date_to", opts.dateTo],
        ["sort", opts.sort],
        ["limit", opts.limit],
        ["offset", opts.offset],
    ]);
    const { ok, status, body } = await apiRequest("/search", params);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
export function printCasesHelp() {
    console.log(`Search case law and court decisions

Usage: legalcode cases "<query>" [options]

Query syntax:
  Supports quoted phrases and flat AND/OR operators
  Does not support NOT, parentheses, or field:value clauses
  Examples: "wrongful termination AND damages"
            "right to erasure" OR "right to be forgotten"
            "reversed wrongful termination"

Facet filter values:
  Single value:     --case-type CRIMINAL
  Multiple (OR):    --case-type "CRIMINAL OR CIVIL"
  Exclude (NOT):    --case-type "-CRIMINAL"                 (minus prefix)
  Combined:         --offense "DRUG OR VIOLENCE -TRAFFIC"
  Multiple flags across fields = AND (implicit)

Court filters:
  --jurisdiction <code>    Country code (US, DE, EU, GB, FR, IS...)
  --court-level <value>    SUPREME, APPELLATE, TRIAL, TRIBUNAL, OTHER (comma-separated)
  --court-type <value>     GENERAL, ADMINISTRATIVE, CONSTITUTIONAL, SPECIALIZED
  --level <value>          SUPRANATIONAL, NATIONAL, FEDERAL, STATE, REGIONAL

Case classification:
  --case-type <value>      CRIMINAL, CIVIL, ADMINISTRATIVE, FAMILY, LABOR, PROPERTY,
                           COMMERCIAL, INSOLVENCY, TAX, INTELLECTUAL_PROPERTY,
                           ENVIRONMENTAL, CONSTITUTIONAL, ELECTION, INSURANCE,
                           BANKING_FINANCE, DATA_PROTECTION, PUBLIC_PROCUREMENT,
                           COMPETITION, IMMIGRATION, MARITIME, ENERGY, TELECOM,
                           DEFAMATION (comma-separated for OR)
  --offense <value>        Criminal offense categories: DRUG, VIOLENCE, SEXUAL,
                           PROPERTY, TRAFFIC, PUBLIC_ORDER, WEAPON, CYBER,
                           WHITE_COLLAR, OTHER_CRIMINAL (comma-separated)

Outcome filters:
  --verdict <value>        Verdict type filter
  --precedential <value>   BINDING, PERSUASIVE, NON_PRECEDENTIAL
  --appeal-outcome <value> UPHELD, REVERSED, MODIFIED, DISMISSED, WITHDRAWN, PENDING
  --decision-form <value>  DOMUR (judgment), URSKURDUR (order/ruling)

Party and participant search:
  --party <name>           Search plaintiff, defendant, appellant, appellee names
  --judge <name>           Search judge names
  --lawyer <name>          Search counsel/attorney names

Cross-reference filters:
  --law-ref <ref>          Find cases citing a specific law or statute
  --precedent-ref <ref>    Find cases citing a specific precedent

Temporal filters:
  --year <range>           Single year or range: 2024, 2020-2025
  --date-from <date>       Decision date start (YYYY-MM-DD)
  --date-to <date>         Decision date end (YYYY-MM-DD)

Other:
  --language <code>        Language ISO code (en, de, fr, is...)
  --subdivision <code>     State/region code

Result options:
  --sort <field>           Sort by: relevance (default), date, citation_count
  --limit <n>              Max results (default 10)
  --offset <n>             Skip first n results (for pagination)

Combining filters:
  Multiple flags   = AND across fields:  --case-type CRIMINAL --court-level APPELLATE
  OR within field  =                     --case-type "CRIMINAL OR CIVIL"
  NOT (exclude)    =                     --case-type "-CRIMINAL"  (minus prefix)
  Mixed            =                     --offense "DRUG OR VIOLENCE -TRAFFIC"
  Text query       = AND/OR only:        "privacy AND trade secret"
  Text + flags     = AND:                query matches text, flags filter fields

Examples:
  legalcode cases "data breach notification"
  legalcode cases "wrongful termination" --jurisdiction US --court-level APPELLATE
  legalcode cases "GDPR enforcement" --jurisdiction EU --case-type DATA_PROTECTION
  legalcode cases "drug trafficking" --case-type CRIMINAL --offense DRUG --year 2023-2025
  legalcode cases "" --party "Smith" --jurisdiction US --court-level SUPREME
  legalcode cases "" --law-ref "GDPR Article 17" --jurisdiction EU
  legalcode cases "damages" --appeal-outcome REVERSED --precedential BINDING
  legalcode cases "fraud" --case-type "CRIMINAL OR CIVIL" --court-level "SUPREME OR APPELLATE"
  legalcode cases "" --offense "DRUG OR VIOLENCE -TRAFFIC" --jurisdiction US
  legalcode cases "privacy" --jurisdiction IS --language is --sort date
`);
}
export async function handleCases(query, opts) {
    const params = buildParams([
        ["q", query],
        ["type", "case"],
        ["jurisdiction", opts.jurisdiction],
        ["court_level", opts.courtLevel],
        ["court_type", opts.courtType],
        ["case_type", opts.caseType],
        ["verdict", opts.verdict],
        ["precedential_status", opts.precedential],
        ["appeal_outcome", opts.appealOutcome],
        ["decision_form", opts.decisionForm],
        ["offense", opts.offense],
        ["party", opts.party],
        ["judge", opts.judge],
        ["lawyer", opts.lawyer],
        ["law_ref", opts.lawRef],
        ["precedent_ref", opts.precedentRef],
        ["year", opts.year],
        ["date_from", opts.dateFrom],
        ["date_to", opts.dateTo],
        ["language", opts.language],
        ["subdivision", opts.subdivision],
        ["jurisdiction_level", opts.level],
        ["sort", opts.sort],
        ["limit", opts.limit],
        ["offset", opts.offset],
    ]);
    const { ok, status, body } = await apiRequest("/search", params);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
export function printGuidanceHelp() {
    console.log(`Search regulatory guidance and agency publications

Usage: legalcode guidance "<query>" [options]

Query syntax:
  Supports quoted phrases and flat AND/OR operators
  Does not support NOT, parentheses, or field:value clauses

Facet filter values:
  OR: --doc-status "PUBLISHED OR DRAFT"    Exclude: --doc-status "-ARCHIVED"

Agency and type filters:
  --jurisdiction <code>    Country code (US, DE, EU, GB...)
  --agency <name>          Issuing agency code or name
  --doc-type <code>        Document type (e.g. REGULATORY, SUPERVISORY, INFORMATIONAL)
  --doc-status <value>     DRAFT, PUBLISHED, ARCHIVED
  --is-binding <bool>      true or false — legally binding documents only
  --level <value>          SUPRANATIONAL, NATIONAL, FEDERAL, STATE

Temporal filters:
  --date-from <date>       Publication date start (YYYY-MM-DD)
  --date-to <date>         Publication date end (YYYY-MM-DD)
  --effective-from <date>  Effective date start (YYYY-MM-DD)
  --effective-to <date>    Effective date end (YYYY-MM-DD)

Cross-reference:
  --law-ref <ref>          Find guidance citing a specific law

Other:
  --language <code>        Language ISO code
  --subdivision <code>     State/region code
  --sort <field>           Sort by: relevance (default), date
  --limit <n>              Max results (default 10)
  --offset <n>             Skip first n results

Note: Guidance sources require a Pro account.

Examples:
  legalcode guidance "AI regulation"
  legalcode guidance "data breach notification" --jurisdiction EU
  legalcode guidance "HIPAA" --jurisdiction US --agency HHS
  legalcode guidance "AML compliance" --is-binding true --doc-status PUBLISHED
  legalcode guidance "climate disclosure" --date-from 2024-01-01 --sort date
`);
}
export async function handleGuidance(query, opts) {
    const params = buildParams([
        ["q", query],
        ["type", "guidance"],
        ["jurisdiction", opts.jurisdiction],
        ["agency", opts.agency],
        ["doc_type", opts.docType],
        ["doc_status", opts.docStatus],
        ["is_binding", opts.isBinding],
        ["date_from", opts.dateFrom],
        ["date_to", opts.dateTo],
        ["effective_from", opts.effectiveFrom],
        ["effective_to", opts.effectiveTo],
        ["language", opts.language],
        ["subdivision", opts.subdivision],
        ["jurisdiction_level", opts.level],
        ["law_ref", opts.lawRef],
        ["sort", opts.sort],
        ["limit", opts.limit],
        ["offset", opts.offset],
    ]);
    const { ok, status, body } = await apiRequest("/search", params);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
export function printAgreementsHelp() {
    console.log(`Search trade and tax agreements between countries

Usage: legalcode agreements "<query>" [options]

Filters:
  --jurisdiction <code>   Country code (US, DE, EU...)
  --kind <type>           Agreement family: trade, tax, any (default: any)
  --trade-type <value>    Trade agreement subtype (FTA, CU, PSA, EIA...)
  --trade-scope <value>   Trade scope (BILATERAL, PLURILATERAL, MULTILATERAL...)
  --trade-coverage <val>  Trade coverage (GOODS, SERVICES, DIGITAL, PROCUREMENT...)
  --trade-status <value>  Trade status (IN_FORCE, SUPERSEDED, TERMINATED...)
  --tax-kind <value>      Tax agreement kind
  --tax-scope <value>     Tax agreement scope
  --tax-status <value>    Tax agreement instrument status
  --instrument-type <v>   Tax agreement instrument type
  --date-from <date>      Date range start (YYYY-MM-DD)
  --date-to <date>        Date range end (YYYY-MM-DD)
  --language <code>       Language ISO code
  --sort <field>          Sort by: relevance (default), date
  --limit <n>             Max results (default 10)
  --offset <n>            Skip first n results

Note: Agreement sources require a Pro account.

Examples:
  legalcode agreements "double taxation"
  legalcode agreements "free trade" --jurisdiction US
  legalcode agreements "double taxation" --jurisdiction EU --kind tax --tax-kind INCOME_TAX
  legalcode agreements "investment protection" --jurisdiction DE --kind trade --trade-type FTA
`);
}
export async function handleAgreements(query, opts) {
    const params = buildParams([
        ["q", query],
        ["type", "agreement"],
        ["jurisdiction", opts.jurisdiction],
        ["kind", opts.kind],
        ["trade_type", opts.tradeType],
        ["trade_scope", opts.tradeScope],
        ["trade_coverage", opts.tradeCoverage],
        ["trade_status", opts.tradeStatus],
        ["tax_kind", opts.taxKind],
        ["tax_scope", opts.taxScope],
        ["tax_status", opts.taxStatus],
        ["instrument_type", opts.instrumentType],
        ["date_from", opts.dateFrom],
        ["date_to", opts.dateTo],
        ["language", opts.language],
        ["sort", opts.sort],
        ["limit", opts.limit],
        ["offset", opts.offset],
    ]);
    const { ok, status, body } = await apiRequest("/search", params);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
export function printPatentsHelp() {
    console.log(`Search Google Patents for patent documents worldwide

Usage: legalcode patents "<query>" [options]

Options:
  --country <code>      Patent office code (US, EP, JP, WO, CN, KR)
  --inventor <name>     Filter by inventor name
  --assignee <name>     Filter by assignee/company
  --status <status>     GRANT or APPLICATION
  --type <type>         PATENT or DESIGN
  --before <YYYYMMDD>   Date upper bound
  --after <YYYYMMDD>    Date lower bound
  --language <lang>     Language filter (ENGLISH, GERMAN, etc.)
  --litigation <bool>   Filter to patents in litigation
  --sort <order>        relevance (default), new, old
  --limit <n>           Max results (default 10)
  --offset <n>          Skip first n results

Note: Patent search requires a Pro account.
`);
}
export async function handlePatents(query, opts) {
    const params = buildParams([
        ["q", query],
        ["country", opts.country],
        ["inventor", opts.inventor],
        ["assignee", opts.assignee],
        ["status", opts.status],
        ["type", opts.type],
        ["before", opts.before],
        ["after", opts.after],
        ["language", opts.language],
        ["litigation", opts.litigation],
        ["sort", opts.sort],
        ["limit", opts.limit],
        ["offset", opts.offset],
    ]);
    const { ok, status, body } = await apiRequest("/patents", params);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
export function printPatentHelp() {
    console.log(`Look up a specific patent by ID or publication number

Usage: legalcode patent <patent-id>

Examples:
  legalcode patent US-11234567-B2
  legalcode patent EP3654321A1
`);
}
export async function handlePatent(patentId) {
    const { ok, status, body } = await apiRequest(`/patents/${encodeURIComponent(patentId)}`);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
export function printSearchHelp() {
    console.log(`Search a specific legal source type via the generic typed route

Usage: legalcode search "<query>" [options]

Query syntax:
  Supports quoted phrases and flat AND/OR operators
  Does not support NOT, parentheses, or field:value clauses

Facet filter values:
  OR: --case-type "CRIMINAL OR CIVIL"    Exclude: --case-type "-FAMILY"

Source type selector:
  --type <type>            Required. One of: law, case, guidance, agreement, patent

Common facet filters (apply to relevant source types):
  --jurisdiction <code>    Country code (US, DE, EU, GB, FR, IS...)
  --act-type <value>       LAW, REGULATION, DIRECTIVE (for laws)
  --status <value>         ACTIVE, REPEALED, SUPERSEDED (for laws)
  --document-nature <val>  BASE or AMENDMENT (for laws)
  --in-force-on-date <d>   Point-in-time law lookup date (for laws)
  --law-key <id>           Exact law identifier (for laws)
  --court-level <value>    SUPREME, APPELLATE, TRIAL, TRIBUNAL (for cases)
  --court-type <value>     GENERAL, ADMINISTRATIVE, CONSTITUTIONAL (for cases)
  --case-type <value>      CRIMINAL, CIVIL, ADMINISTRATIVE, etc. (for cases)
  --verdict <value>        Verdict type (for cases)
  --precedential <value>   BINDING, PERSUASIVE, etc. (for cases)
  --appeal-outcome <value> Appeal outcome (for cases)
  --decision-form <value>  Decision form (for cases)
  --offense <value>        Offense category (for cases)
  --party <name>           Party name search (for cases)
  --judge <name>           Judge name search (for cases)
  --lawyer <name>          Lawyer/counsel search (for cases)
  --law-ref <ref>          Find sources citing a specific law
  --precedent-ref <ref>    Find cases citing a precedent
  --agency <code>          Guidance issuing agency
  --doc-type <value>       Guidance document type
  --doc-status <value>     Guidance document status
  --is-binding <bool>      true or false for guidance binding status
  --kind <value>           Agreement family: trade or tax
  --trade-type <value>     Trade agreement subtype
  --trade-scope <value>    Trade agreement scope
  --trade-coverage <val>   Trade agreement coverage
  --trade-status <value>   Trade agreement status
  --tax-kind <value>       Tax agreement kind
  --tax-scope <value>      Tax agreement scope
  --tax-status <value>     Tax agreement status
  --instrument-type <val>  Tax agreement instrument type

Temporal filters:
  --year <range>           Single year or range: 2024 or 2020-2025
  --date-from <date>       Date range start (YYYY-MM-DD)
  --date-to <date>         Date range end (YYYY-MM-DD)
  --effective-from <date>  Guidance effective date start
  --effective-to <date>    Guidance effective date end

Other:
  --language <code>        Language ISO code
  --subdivision <code>     State/region code
  --jurisdiction-level <value> SUPRANATIONAL, NATIONAL, FEDERAL, STATE, etc.
  --sort <field>           Sort by: relevance (default), date
  --limit <n>              Max results (default 10)
  --offset <n>             Skip first n results

This command does not perform cross-source search.
Use --type to choose the source explicitly, or use the source-specific commands.

Examples:
  legalcode search "GDPR compliance" --type law --jurisdiction EU
  legalcode search "privacy" --type guidance --jurisdiction US
  legalcode search "wrongful termination" --type case --court-level SUPREME
  legalcode search "double taxation" --type agreement --kind tax --tax-status IN_FORCE
`);
}
export async function handleSearch(query, opts) {
    const normalizedType = opts.type?.trim().toLowerCase();
    if (!normalizedType ||
        !["law", "case", "guidance", "agreement", "patent"].includes(normalizedType)) {
        console.error("legalcode search requires --type with one of: law, case, guidance, agreement, patent");
        process.exit(1);
    }
    const params = buildParams([
        ["q", query],
        ["type", normalizedType],
        ["jurisdiction", opts.jurisdiction],
        ["act_type", opts.actType],
        ["status", opts.status],
        ["document_nature", opts.documentNature],
        ["in_force_on_date", opts.inForceOnDate],
        ["law_key", opts.lawKey],
        ["court_level", opts.courtLevel],
        ["court_type", opts.courtType],
        ["case_type", opts.caseType],
        ["verdict", opts.verdict],
        ["precedential_status", opts.precedential],
        ["appeal_outcome", opts.appealOutcome],
        ["decision_form", opts.decisionForm],
        ["offense", opts.offense],
        ["party", opts.party],
        ["judge", opts.judge],
        ["lawyer", opts.lawyer],
        ["law_ref", opts.lawRef],
        ["precedent_ref", opts.precedentRef],
        ["agency", opts.agency],
        ["doc_type", opts.docType],
        ["doc_status", opts.docStatus],
        ["is_binding", opts.isBinding],
        ["kind", opts.kind],
        ["trade_type", opts.tradeType],
        ["trade_scope", opts.tradeScope],
        ["trade_coverage", opts.tradeCoverage],
        ["trade_status", opts.tradeStatus],
        ["tax_kind", opts.taxKind],
        ["tax_scope", opts.taxScope],
        ["tax_status", opts.taxStatus],
        ["instrument_type", opts.instrumentType],
        ["year", opts.year],
        ["date_from", opts.dateFrom],
        ["date_to", opts.dateTo],
        ["effective_from", opts.effectiveFrom],
        ["effective_to", opts.effectiveTo],
        ["language", opts.language],
        ["subdivision", opts.subdivision],
        ["jurisdiction_level", opts.jurisdictionLevel],
        ["sort", opts.sort],
        ["limit", opts.limit],
        ["offset", opts.offset],
    ]);
    const { ok, status, body } = await apiRequest("/search", params);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
// ── Fetch full text ──────────────────────────────────────────────────
export function printFetchHelp() {
    console.log(`Fetch full text of a legal source to stdout

Usage: legalcode fetch <source-id>

The source ID is returned by search commands. Format: <type>/<jurisdiction>/<id>

Examples:
  legalcode fetch law/EU/eu-gdpr-2016-679
  legalcode fetch case/US/heppner-sdny-2026
  legalcode fetch guidance/US/sec-2024-ai-advisory

The full text is printed to stdout as plain text.
Use 'legalcode download' instead to save as a local Markdown file.
`);
}
export async function handleFetch(sourceRef) {
    const parts = sourceRef.split("/");
    let endpoint;
    if (parts.length === 3) {
        const [type, jurisdiction, id] = parts;
        if (!type || !jurisdiction || !id) {
            endpoint = `/sources/${encodeURIComponent(sourceRef)}`;
        }
        else if (type === "patent") {
            endpoint = `/patents/${encodeURIComponent(id)}`;
        }
        else {
            const typeMap = {
                law: "laws",
                case: "cases",
                guidance: "guidance",
                agreement: "agreements",
                patent: "patents",
            };
            const plural = typeMap[type] ?? type;
            endpoint = `/jurisdictions/${encodeURIComponent(jurisdiction)}/${plural}/${encodeURIComponent(id)}`;
        }
    }
    else {
        endpoint = `/sources/${encodeURIComponent(sourceRef)}`;
    }
    const { ok, status, body } = await apiRequest(endpoint);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
// ── Download to file ─────────────────────────────────────────────────
export function printDownloadHelp() {
    console.log(`Download a legal source as a local Markdown file

Usage: legalcode download <source-id> [options]

Options:
  --out <directory>      Output directory (default: ./legalcode-downloads/)

The source ID is returned by search commands. Format: <type>/<jurisdiction>/<id>

Examples:
  legalcode download law/EU/eu-gdpr-2016-679
  legalcode download case/US/heppner-sdny-2026 --out ./research/
  legalcode download guidance/GB/ico-2024-ai-guidance

Downloads save the full text as a Markdown file instead of loading it
into your agent's context window. Use for large documents or when
the user needs a local copy.

Note: Downloads require a Pro account.
`);
}
export async function handleDownload(sourceRef, outDir) {
    const dir = outDir ?? path.join(process.cwd(), "legalcode-downloads");
    fs.mkdirSync(dir, { recursive: true });
    const { ok, status, body } = await apiRequest(`/downloads/${encodeURIComponent(sourceRef)}`);
    if (!ok)
        handleApiError(status, body);
    const filename = safeDownloadFilename(sourceRef);
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
        console.error(`Refusing to overwrite existing file: ${filePath}`);
        console.error("Remove the file or choose another output directory.");
        process.exit(1);
    }
    fs.writeFileSync(filePath, body, "utf-8");
    const size = Buffer.byteLength(body);
    const sizeStr = size > 1024 ? `${(size / 1024).toFixed(0)} KB` : `${size} B`;
    console.log(`Downloaded: ${filePath} (${sizeStr})`);
}
// ── Facets (jurisdiction-specific) ───────────────────────────────────
export function printFacetsHelp() {
    console.log(`Discover available search facets for a jurisdiction

Usage: legalcode facets --jurisdiction <code> [--type <source-type>]

Returns which filters, enum values, courts, case types, agencies, and other
facets are available for a specific jurisdiction. Not all facets apply in all
countries — use this before searching to discover what filters are relevant.

Options:
  --jurisdiction <code>  Required. Country code (US, DE, EU, GB, FR, IS, BR, NZ...)
  --type <source-type>   Optional. Narrow to: law, case, guidance, agreement (default: all)

The response includes:
  - Available source types (law, case, guidance, agreement)
  - Court levels and court types (for cases)
  - Case type categories (CRIMINAL, CIVIL, etc.)
  - Offense categories (for criminal cases)
  - Appeal outcomes, decision forms, precedential statuses
  - Law statuses and act types (for laws)
  - Agencies and document types (for guidance)
  - Languages and subdivisions
  - Date ranges of available data
  - Total document counts per source type

Examples:
  legalcode facets --jurisdiction US
  legalcode facets --jurisdiction IS --type case
  legalcode facets --jurisdiction EU --type guidance
  legalcode facets --jurisdiction DE --type law
`);
}
export async function handleFacets(opts) {
    if (!opts.jurisdiction) {
        console.error("--jurisdiction is required for facets.");
        console.error("Usage: legalcode facets --jurisdiction <code>");
        process.exit(1);
    }
    const params = buildParams([
        ["jurisdiction", opts.jurisdiction],
        ["type", opts.type],
    ]);
    const { ok, status, body } = await apiRequest("/facets", params);
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
// ── Jurisdictions ────────────────────────────────────────────────────
export async function handleJurisdictions() {
    const { ok, status, body } = await apiRequest("/jurisdictions");
    if (!ok)
        handleApiError(status, body);
    console.log(body);
}
