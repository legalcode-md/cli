#!/usr/bin/env node
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { clearCredentials, ensureCredentials, fetchWithTimeout, getCredentials, handleAgreements, handleCases, handleDownload, handleFacets, handleFetch, handleGuidance, handleJurisdictions, handleLaws, handlePatent, handlePatents, handleSearch, printAgreementsHelp, printCasesHelp, printDownloadHelp, printFacetsHelp, printFetchHelp, printGuidanceHelp, printLawsHelp, printPatentHelp, printPatentsHelp, printSearchHelp, saveCredentials, } from "./api.js";
import { CodexCliMissingError, CodexCliTooOldError, CodexPluginCommandError, installCodexPlugin, } from "./codex-plugin.js";
import { CLI_CLIENTS, installCounsel, installSkill, MCP_ONLY_CLIENTS, } from "./skill.js";
const BASE_URL = process.env.LEGALCODE_WEB_URL ?? "https://legalcode.md";
const MCP_URL = process.env.LEGALCODE_MCP_URL ?? "https://mcp.legalcode.md/mcp";
const MCP_PRO_URL = process.env.LEGALCODE_MCP_PRO_URL ?? "https://mcppro.legalcode.md/mcp";
const CLI_CLIENT_ID = process.env.LEGALCODE_CLI_CLIENT_ID ?? "legalcode-cli";
const CLI_REDIRECT_URL = process.env.LEGALCODE_CLI_REDIRECT_URL ?? "http://localhost:38965/callback";
const CLI_SCOPE = [
    "openid",
    "profile",
    "email",
    "legalcode.public.read",
    "legalcode.laws.read",
    "legalcode.cases.read",
    "legalcode.pro",
].join(" ");
const LOCAL_CONFIG_PATH = path.join(os.homedir(), ".legalcode", "local-search", "config.json");
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_BLOCKED_SEGMENTS = new Set([
    ".aws",
    ".azure",
    ".docker",
    ".gnupg",
    ".kube",
    ".legalcode",
    ".ssh",
]);
const LOCAL_BLOCKED_FILES = new Set([
    ".bash_history",
    ".env",
    ".env.local",
    ".npmrc",
    ".zsh_history",
    "credentials.json",
    "id_dsa",
    "id_ecdsa",
    "id_ed25519",
    "id_rsa",
]);
function remoteMcpEntry() {
    return { url: MCP_URL };
}
function scanForRepoRoot(startDir) {
    let currentDir = path.resolve(startDir);
    while (true) {
        if (fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
            return currentDir;
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            return null;
        }
        currentDir = parentDir;
    }
}
function findRepoRoot() {
    return scanForRepoRoot(process.cwd()) ?? scanForRepoRoot(MODULE_DIR);
}
function formatCommand(command, args) {
    return [command, ...args]
        .map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
        .join(" ");
}
function getLocalMcpCommandArgs(extraArgs = []) {
    const repoRoot = findRepoRoot();
    if (!repoRoot) {
        throw new Error("Could not find the Legalcode repo root. Run this command from inside the repo.");
    }
    return [
        "-C",
        repoRoot,
        "--filter",
        "@legalcode/local-mcp",
        "exec",
        "node",
        "--import",
        "tsx",
        "src/index.ts",
        ...extraArgs,
    ];
}
function localMcpEntry() {
    return { command: "pnpm", args: getLocalMcpCommandArgs() };
}
const CLIENTS = [
    {
        id: "claude-desktop",
        name: "Claude Desktop",
        configPath: () => null,
        serverKey: "mcpServers",
        mcpEntry: remoteMcpEntry,
        postSetup: [
            "Claude Desktop uses connector-based remote MCP setup.",
            "Open Claude or Claude Desktop -> Customize -> Connectors.",
            `Add a custom connector with ${MCP_URL} for public access, or ${MCP_PRO_URL} for OAuth-backed full access.`,
            "Remote MCP servers are not activated through claude_desktop_config.json.",
        ],
    },
    {
        id: "claude-code",
        name: "Claude Code",
        configPath: () => path.join(process.cwd(), ".claude", "settings.local.json"),
        serverKey: "mcpServers",
        mcpEntry: remoteMcpEntry,
        postSetup: [],
    },
    {
        id: "chatgpt",
        name: "ChatGPT",
        configPath: () => null,
        serverKey: "mcpServers",
        mcpEntry: remoteMcpEntry,
        postSetup: [
            "ChatGPT uses web-based MCP configuration:",
            "",
            "1. Open ChatGPT \u2192 Settings \u2192 Connected Apps",
            "2. Add a custom MCP server with this endpoint:",
            `   ${MCP_URL}`,
            "3. For full authenticated access, use this endpoint instead:",
            `   ${MCP_PRO_URL}`,
            "4. Complete OAuth sign-in when prompted on the pro endpoint.",
        ],
    },
    {
        id: "codex",
        name: "Codex",
        // Codex install is handled separately via the plugin pipeline
        // (see configureClient → installCodexPlugin). The fields below are unused
        // for codex but kept to satisfy the ClientDef shape.
        configPath: () => null,
        serverKey: "mcpServers",
        mcpEntry: remoteMcpEntry,
        postSetup: [],
    },
    {
        id: "cursor",
        name: "Cursor",
        configPath: () => path.join(process.cwd(), ".cursor", "mcp.json"),
        serverKey: "mcpServers",
        mcpEntry: remoteMcpEntry,
        postSetup: [],
    },
    {
        id: "vscode",
        name: "VS Code",
        configPath: () => path.join(process.cwd(), ".vscode", "mcp.json"),
        serverKey: "servers",
        mcpEntry: remoteMcpEntry,
        postSetup: [],
    },
    {
        id: "windsurf",
        name: "Windsurf",
        configPath: () => {
            if (process.platform === "win32") {
                return path.join(process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"), ".codeium", "windsurf", "mcp_config.json");
            }
            return path.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json");
        },
        serverKey: "mcpServers",
        mcpEntry: remoteMcpEntry,
        postSetup: [],
    },
];
const LOCAL_CLIENTS = CLIENTS.filter((client) => client.configPath() !== null && client.id !== "chatgpt");
// ── Utilities ────────────────────────────────────────────────────────
function openUrl(url) {
    const platform = process.platform;
    if (platform === "darwin") {
        spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    }
    else if (platform === "win32") {
        spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
    }
    else {
        spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
    }
}
function readJsonFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    catch {
        return {};
    }
}
function writeJsonFile(filePath, data) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
    fs.renameSync(tmp, filePath);
}
function isRootOrHome(value) {
    const resolved = path.resolve(value);
    return resolved === path.parse(resolved).root || resolved === os.homedir();
}
function hasBlockedLocalPathSegment(value) {
    return path
        .resolve(value)
        .split(path.sep)
        .filter(Boolean)
        .some((part) => LOCAL_BLOCKED_SEGMENTS.has(part) || LOCAL_BLOCKED_FILES.has(part));
}
function askQuestion(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
function parseArgs(args, allowedFlags) {
    const flags = new Map();
    const positionals = [];
    const allowed = new Set(allowedFlags);
    for (let index = 0; index < args.length; index += 1) {
        const token = args[index];
        if (!token)
            continue;
        if (token === "-h" || token === "--help") {
            flags.set("--help", "true");
            continue;
        }
        if (token.startsWith("--")) {
            const equalsIndex = token.indexOf("=");
            const flag = equalsIndex === -1 ? token : token.slice(0, equalsIndex);
            if (!allowed.has(flag)) {
                throw new Error(`Unknown flag: ${flag}`);
            }
            if (equalsIndex !== -1) {
                flags.set(flag, token.slice(equalsIndex + 1));
                continue;
            }
            const next = args[index + 1];
            if (next === undefined ||
                (next.startsWith("--") &&
                    allowed.has(next.includes("=") ? next.slice(0, next.indexOf("=")) : next))) {
                throw new Error(`Missing value for ${flag}`);
            }
            flags.set(flag, next);
            index += 1;
            continue;
        }
        positionals.push(token);
    }
    return { flags, positionals };
}
function getFlag(parsed, flag) {
    return parsed.flags.get(flag);
}
function hasParsedHelp(parsed) {
    return parsed.flags.has("--help");
}
function parseCommandArgs(args, allowedFlags, helpFn) {
    try {
        const parsed = parseArgs(args, allowedFlags);
        if (hasParsedHelp(parsed) && helpFn) {
            helpFn();
            process.exit(0);
        }
        return parsed;
    }
    catch (error) {
        if (helpFn) {
            helpFn();
        }
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
function resolveQuery(parsed, helpFn, { allowFilterOnly = false } = {}) {
    if (parsed.positionals.length === 0) {
        if (allowFilterOnly && parsed.flags.size > 0) {
            return "";
        }
        helpFn();
        process.exit(1);
    }
    const query = parsed.positionals.join(" ");
    if (query.length > 0) {
        return query;
    }
    if (allowFilterOnly && parsed.flags.size > 0) {
        return "";
    }
    helpFn();
    process.exit(1);
}
async function runCommand(command, args) {
    await new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: "inherit" });
        child.on("error", reject);
        child.on("exit", (code, signal) => {
            if (signal) {
                reject(new Error(`${command} exited from signal ${signal}`));
                return;
            }
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
        });
    });
}
// ── Init command ─────────────────────────────────────────────────────
function writeMcpConfigEntry(client, serverName, entry) {
    const filePath = client.configPath();
    if (!filePath)
        return { wrote: false, filePath: null };
    const existing = readJsonFile(filePath);
    const servers = existing[client.serverKey] ?? {};
    servers[serverName] = entry;
    existing[client.serverKey] = servers;
    writeJsonFile(filePath, existing);
    return { wrote: true, filePath };
}
function writeMcpConfig(client) {
    return writeMcpConfigEntry(client, "legalcode", client.mcpEntry());
}
function reportCodexInstallError(err) {
    if (err instanceof CodexCliMissingError || err instanceof CodexCliTooOldError) {
        console.error(`  x ${err.message}`);
    }
    else if (err instanceof CodexPluginCommandError) {
        console.error(`  x codex plugin install failed (exit ${err.exitCode ?? "?"})`);
        console.error(`     command: ${err.command}`);
        if (err.stderr.trim().length > 0) {
            console.error(`     stderr:  ${err.stderr.trim()}`);
        }
    }
    else if (err instanceof Error) {
        console.error(`  x ${err.message}`);
    }
    else {
        console.error(`  x Codex install failed: ${String(err)}`);
    }
}
function configureCodex(pluginNames) {
    console.log(`  Installing Codex plugin(s): ${pluginNames.join(", ")}`);
    try {
        const result = installCodexPlugin(pluginNames);
        console.log();
        console.log(`  ✓ Codex CLI ${result.detectedVersion} — plugins registered`);
        console.log(`  Marketplace: ${result.marketplaceRoot}/.agents/plugins/marketplace.json`);
        for (const name of result.installedPlugins) {
            console.log(`  Installed:   ${name}`);
        }
        console.log();
        console.log("  Next steps:");
        console.log("    1. Run `codex` and use `/plugins` to confirm Legalcode is enabled.");
        console.log("    2. Type `$legalcode` to invoke the skill, or describe a legal");
        console.log("       research task and Codex will load it implicitly.");
        console.log("    3. Run `legalcode login` to authenticate for Pro endpoints.");
        console.log();
        return true;
    }
    catch (err) {
        reportCodexInstallError(err);
        console.log();
        return false;
    }
}
function configureClient(client) {
    const isCli = CLI_CLIENTS.has(client.id);
    const isMcpOnly = MCP_ONLY_CLIENTS.has(client.id);
    console.log();
    // Codex uses the new plugin pipeline (codex-plugin.ts), not the
    // skill-file + MCP-config flow that other CLI clients use.
    if (client.id === "codex") {
        configureCodex(["legalcode"]);
        return;
    }
    // CLI clients: install skill file + MCP config as fallback
    if (isCli) {
        const skillTarget = client.id;
        const result = installSkill(skillTarget);
        console.log(`  \u2713 Skill installed for ${client.name}`);
        console.log();
        console.log(`  Skill:     ${result.filePath}`);
        for (const extra of result.extraFiles) {
            console.log(`  Agent:     ${extra}`);
        }
        console.log(`  ${result.note}`);
        // Also write MCP config (search agent needs it for Claude Code; secondary for others)
        const { wrote, filePath } = writeMcpConfig(client);
        if (wrote) {
            console.log();
            console.log(`  \u2713 MCP config written`);
            console.log(`  Config:    ${filePath}`);
        }
        console.log();
        console.log("  Next steps:");
        if (client.id === "claude-code") {
            console.log("  Legal research is handled by the legalcode-search-agent subagent.");
            console.log("  Run `legalcode login` to authenticate.");
        }
        else {
            console.log(`  Your agent can now run \`legalcode search\`, \`legalcode fetch\`, etc.`);
            console.log("  The skill file teaches it how. Run `legalcode login` to authenticate.");
        }
        console.log();
        return;
    }
    // MCP-only clients: write MCP config or show instructions
    if (isMcpOnly) {
        const { wrote, filePath } = writeMcpConfig(client);
        if (wrote) {
            console.log(`  \u2713 ${client.name} configured`);
            console.log();
            console.log(`  Config:    ${filePath}`);
            console.log(`  Server:    legalcode \u2192 ${MCP_URL}`);
        }
        else {
            console.log(`  ${client.name}`);
        }
    }
    if (client.postSetup.length > 0) {
        console.log();
        console.log("  Next steps:");
        for (const line of client.postSetup) {
            console.log(`  ${line}`);
        }
    }
    console.log();
}
function printManualConfig() {
    console.log();
    console.log("  MCP endpoints:");
    console.log();
    console.log(`    Public: ${MCP_URL}`);
    console.log(`    Pro:    ${MCP_PRO_URL}`);
    console.log();
    console.log("  UI-based setup (ChatGPT, Claude Desktop):");
    console.log("    Paste one of the URLs above into the client's custom connector flow.");
    console.log("    Use the public URL for no-login access.");
    console.log("    Use the pro URL when you want OAuth-backed full access.");
    console.log();
    console.log("  CLI usage (for Claude Code, Codex, Cursor, VS Code, Windsurf):");
    console.log();
    console.log('    legalcode search "<query>"     Search legal sources');
    console.log("    legalcode fetch <source-id>     Get full text");
    console.log("    legalcode download <source-id>  Save to local Markdown");
    console.log("    legalcode login                 Authenticate for CLI or pro MCP access");
    console.log();
    console.log("  Install the skill file for your agent:");
    console.log("    npx legalcode init --client claude-code");
    console.log();
    console.log(`  Setup guide: ${BASE_URL}/onboarding/mcp`);
    console.log();
}
async function interactivePicker() {
    console.log();
    console.log("  legalcode \u2014 connect your AI agent to legal data");
    console.log();
    console.log("  Select your client:");
    console.log();
    for (const [i, c] of CLIENTS.entries()) {
        const mode = CLI_CLIENTS.has(c.id) ? "CLI + skill" : "MCP";
        console.log(`    ${i + 1}) ${c.name}  (${mode})`);
    }
    console.log("    m) Manual setup");
    console.log();
    const answer = await askQuestion(`  Choice [1-${CLIENTS.length}, m]: `);
    if (answer.toLowerCase() === "m")
        return "manual";
    const idx = parseInt(answer, 10) - 1;
    const selectedClient = CLIENTS[idx];
    if (selectedClient)
        return selectedClient;
    console.error(`\n  Invalid choice: "${answer}"`);
    return null;
}
async function interactiveLocalPicker() {
    console.log();
    console.log("  legalcode local search");
    console.log();
    console.log("  Select your MCP client:");
    console.log();
    for (const [index, client] of LOCAL_CLIENTS.entries()) {
        console.log(`    ${index + 1}) ${client.name}`);
    }
    console.log("    m) Manual setup");
    console.log();
    const answer = await askQuestion(`  Choice [1-${LOCAL_CLIENTS.length}, m]: `);
    if (answer.toLowerCase() === "m")
        return "manual";
    const index = Number.parseInt(answer, 10) - 1;
    const selectedClient = LOCAL_CLIENTS[index];
    if (selectedClient) {
        return selectedClient;
    }
    console.error(`\n  Invalid choice: "${answer}"`);
    return null;
}
async function handleInit(args) {
    const parsed = parseCommandArgs(args, INIT_FLAGS);
    if (parsed.positionals.length > 0) {
        console.error("Unexpected positional arguments for init.");
        process.exit(1);
    }
    const clientArg = getFlag(parsed, "--client");
    if (clientArg) {
        const client = CLIENTS.find((c) => c.id === clientArg);
        if (!client) {
            console.error(`Unknown client: "${clientArg}"`);
            console.error(`Available: ${CLIENTS.map((c) => c.id).join(", ")}`);
            process.exit(1);
        }
        configureClient(client);
        return;
    }
    if (!process.stdin.isTTY) {
        console.error("No --client specified and stdin is not a TTY.");
        console.error(`Usage: npx legalcode init --client <${CLIENTS.map((c) => c.id).join("|")}>`);
        process.exit(1);
    }
    const choice = await interactivePicker();
    if (choice === null)
        process.exit(1);
    if (choice === "manual") {
        printManualConfig();
        return;
    }
    configureClient(choice);
}
// ── Login command ────────────────────────────────────────────────────
function base64UrlEncode(input) {
    return input.toString("base64url");
}
function createPkceChallenge(verifier) {
    return base64UrlEncode(crypto.createHash("sha256").update(verifier).digest());
}
async function waitForOAuthCallback(expectedState) {
    const redirectUrl = new URL(CLI_REDIRECT_URL);
    const hostname = redirectUrl.hostname;
    const port = Number(redirectUrl.port || "80");
    const pathname = redirectUrl.pathname;
    return new Promise((resolve, reject) => {
        const server = http.createServer((request, response) => {
            const requestUrl = new URL(request.url ?? "/", CLI_REDIRECT_URL);
            if (requestUrl.pathname !== pathname) {
                response.statusCode = 404;
                response.end("Not found");
                return;
            }
            const error = requestUrl.searchParams.get("error");
            const state = requestUrl.searchParams.get("state");
            const code = requestUrl.searchParams.get("code");
            response.statusCode = 200;
            response.setHeader("content-type", "text/html; charset=utf-8");
            if (error) {
                response.end("<html><body><h1>Legalcode login failed</h1><p>You can close this window.</p></body></html>");
                server.close();
                reject(new Error(error));
                return;
            }
            if (!code || state !== expectedState) {
                response.end("<html><body><h1>Legalcode login failed</h1><p>Invalid callback.</p></body></html>");
                server.close();
                reject(new Error("Invalid OAuth callback."));
                return;
            }
            response.end("<html><body><h1>Legalcode connected</h1><p>You can return to the terminal.</p></body></html>");
            server.close();
            resolve(code);
        });
        server.on("error", reject);
        server.listen(port, hostname);
        setTimeout(() => {
            server.close();
            reject(new Error("Timed out waiting for OAuth callback."));
        }, 180_000).unref();
    });
}
async function handleLogin() {
    const existing = await ensureCredentials();
    if (existing) {
        console.log(`  Already logged in${existing.email ? ` as ${existing.email}` : ""}.`);
        console.log("  Run `legalcode logout` first to re-authenticate.");
        return;
    }
    const state = crypto.randomUUID();
    const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
    const codeChallenge = createPkceChallenge(codeVerifier);
    const authorizeUrl = new URL("/oauth/authorize", BASE_URL);
    authorizeUrl.searchParams.set("client_id", CLI_CLIENT_ID);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("redirect_uri", CLI_REDIRECT_URL);
    authorizeUrl.searchParams.set("scope", CLI_SCOPE);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("code_challenge", codeChallenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    console.log();
    console.log("  legalcode login");
    console.log();
    console.log("  1. Opening your browser for OAuth sign-in...");
    try {
        openUrl(authorizeUrl.toString());
    }
    catch {
        console.log(`     Could not open browser. Visit: ${authorizeUrl}`);
    }
    console.log(`     ${authorizeUrl}`);
    console.log();
    const authorizationCode = await waitForOAuthCallback(state).catch((error) => {
        console.error(`  ${error.message}`);
        process.exit(1);
    });
    const tokenResponse = await fetchWithTimeout(`${BASE_URL}/oauth/token`, {
        body: new URLSearchParams({
            client_id: CLI_CLIENT_ID,
            code: authorizationCode,
            code_verifier: codeVerifier,
            grant_type: "authorization_code",
            redirect_uri: CLI_REDIRECT_URL,
        }),
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "User-Agent": "legalcode-cli/0.1",
        },
        method: "POST",
    });
    const tokenPayload = (await tokenResponse.json().catch(() => null));
    if (!tokenResponse.ok ||
        !tokenPayload ||
        !("access_token" in tokenPayload) ||
        !tokenPayload.access_token) {
        const message = tokenPayload && "error_description" in tokenPayload
            ? tokenPayload.error_description
            : "OAuth token exchange failed.";
        console.error(`  ${message}`);
        process.exit(1);
    }
    const userInfoResponse = await fetchWithTimeout(`${BASE_URL}/oauth/userinfo`, {
        headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
            "User-Agent": "legalcode-cli/0.1",
        },
    });
    const userInfo = (await userInfoResponse.json().catch(() => ({})));
    saveCredentials({
        accessToken: tokenPayload.access_token,
        clientId: CLI_CLIENT_ID,
        createdAt: new Date().toISOString(),
        email: userInfo.email,
        expiresAt: new Date(Date.now() + (tokenPayload.expires_in ?? 3600) * 1000).toISOString(),
        organizationId: userInfo.organization_id,
        organizationSlug: userInfo.organization_slug,
        refreshToken: tokenPayload.refresh_token,
    });
    console.log();
    console.log("  \u2713 Credentials saved to ~/.legalcode/credentials.json");
    console.log("  OAuth tokens are stored with refresh support.");
    if (userInfo.organization_slug) {
        console.log(`  Active organization: ${userInfo.organization_slug}`);
    }
    console.log();
}
async function handleLogout() {
    const credentials = getCredentials();
    if (!credentials) {
        console.log("  No credentials found.");
        return;
    }
    const tokenToRevoke = credentials.refreshToken ?? credentials.accessToken;
    await fetchWithTimeout(`${BASE_URL}/oauth/revoke`, {
        body: new URLSearchParams({
            token: tokenToRevoke,
        }),
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "User-Agent": "legalcode-cli/0.1",
        },
        method: "POST",
    }).catch(() => undefined);
    clearCredentials();
    console.log("  Logged out. OAuth credentials removed.");
}
function readLocalConfig() {
    try {
        return JSON.parse(fs.readFileSync(LOCAL_CONFIG_PATH, "utf-8"));
    }
    catch {
        return { version: 1, workspaces: [] };
    }
}
function writeLocalConfig(config) {
    const dir = path.dirname(LOCAL_CONFIG_PATH);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    try {
        fs.chmodSync(dir, 0o700);
    }
    catch { }
    const tmp = `${LOCAL_CONFIG_PATH}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(config, null, 2), { encoding: "utf-8", mode: 0o600 });
    fs.renameSync(tmp, LOCAL_CONFIG_PATH);
    try {
        fs.chmodSync(LOCAL_CONFIG_PATH, 0o600);
    }
    catch { }
}
async function handleLocalInit(args) {
    const parsed = parseCommandArgs(args, INIT_FLAGS);
    if (parsed.positionals.length > 0) {
        console.error("Unexpected positional arguments for local init.");
        process.exit(1);
    }
    const clientArg = getFlag(parsed, "--client");
    const configureLocalClient = (client) => {
        const { wrote, filePath } = writeMcpConfigEntry(client, "legalcode-local", localMcpEntry());
        if (!wrote || !filePath) {
            console.error(`Local setup is not supported for ${client.name}.`);
            process.exit(1);
        }
        console.log(`  \u2713 ${client.name} configured for local search`);
        console.log(`  Config:    ${filePath}`);
        console.log(`  Command:   ${formatCommand("pnpm", getLocalMcpCommandArgs())}`);
        console.log("  Warning:   legalcode-local is local-only and can read indexed local files.");
        console.log();
        console.log("  Next steps:");
        console.log("  1. Run `legalcode local workspace add <path>`");
        console.log("  2. Run `legalcode local reindex`");
        console.log("  3. Restart your MCP client if it was already open");
    };
    if (clientArg) {
        const client = LOCAL_CLIENTS.find((entry) => entry.id === clientArg);
        if (!client) {
            console.error(`Unknown or unsupported local client: "${clientArg}"`);
            console.error(`Available: ${LOCAL_CLIENTS.map((entry) => entry.id).join(", ")}`);
            process.exit(1);
        }
        configureLocalClient(client);
        return;
    }
    if (!process.stdin.isTTY) {
        console.error("No --client specified and stdin is not a TTY.");
        console.error(`Usage: legalcode local init --client <${LOCAL_CLIENTS.map((entry) => entry.id).join("|")}>`);
        process.exit(1);
    }
    const choice = await interactiveLocalPicker();
    if (choice === null)
        process.exit(1);
    if (choice === "manual") {
        console.log();
        console.log("  Manual MCP configuration:");
        console.log();
        console.log(JSON.stringify({
            mcpServers: {
                "legalcode-local": localMcpEntry(),
            },
        }, null, 2));
        console.log();
        return;
    }
    configureLocalClient(choice);
}
function handleLocalWorkspaceAdd(dirPath) {
    if (!dirPath) {
        console.error("Error: path argument is required.");
        console.error("Usage: legalcode local workspace add <path>");
        process.exit(1);
    }
    const resolved = path.resolve(dirPath);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
        console.error(`Error: "${resolved}" is not a valid directory.`);
        process.exit(1);
    }
    const realPath = fs.realpathSync(resolved);
    if (isRootOrHome(realPath) || hasBlockedLocalPathSegment(realPath)) {
        console.error("Error: refusing to register root, home, Legalcode config, credential, or other sensitive directories.");
        process.exit(1);
    }
    const config = readLocalConfig();
    if (config.workspaces.some((w) => w.path === realPath)) {
        console.error(`Workspace already registered: "${realPath}"`);
        process.exit(1);
    }
    const id = crypto.randomUUID();
    config.workspaces.push({
        id,
        name: path.basename(realPath),
        path: realPath,
        createdAt: new Date().toISOString(),
    });
    writeLocalConfig(config);
    console.log(`Workspace added: "${path.basename(realPath)}" (${id})`);
    console.log(`Path: ${realPath}`);
}
function handleLocalWorkspaceList() {
    const config = readLocalConfig();
    if (config.workspaces.length === 0) {
        console.log("No workspaces registered.");
        console.log("Use: legalcode local workspace add <path>");
        return;
    }
    console.log("Registered workspaces:\n");
    for (const ws of config.workspaces) {
        console.log(`  ${ws.name}`);
        console.log(`    ID:   ${ws.id}`);
        console.log(`    Path: ${ws.path}`);
        console.log(`    Added: ${ws.createdAt}\n`);
    }
}
async function handleLocalReindex(workspaceId) {
    const args = getLocalMcpCommandArgs(workspaceId ? ["reindex", workspaceId] : ["reindex"]);
    try {
        await runCommand("pnpm", args);
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
async function handleLocal(args) {
    const [subCmd, ...rest] = args;
    if (subCmd === "init") {
        await handleLocalInit(rest);
        return;
    }
    if (subCmd === "workspace") {
        const [action, ...actionArgs] = rest;
        if (action === "add") {
            handleLocalWorkspaceAdd(actionArgs[0]);
            return;
        }
        if (action === "list") {
            handleLocalWorkspaceList();
            return;
        }
    }
    if (subCmd === "reindex") {
        if (rest.length > 1) {
            console.error("Usage: legalcode local reindex [workspaceId]");
            process.exit(1);
        }
        await handleLocalReindex(rest[0]);
        return;
    }
    console.error("Unknown local subcommand.");
    printUsage();
    process.exit(1);
}
// ── Legacy connect command ───────────────────────────────────────────
function handleConnect(args) {
    const target = args[0];
    const noOpen = args.includes("--no-open");
    const clientMap = {
        claude: "claude-desktop",
        chatgpt: "chatgpt",
    };
    const clientId = target ? clientMap[target] : undefined;
    if (!clientId) {
        console.error("Usage: npx legalcode connect <claude|chatgpt>");
        console.error("\nPrefer: npx legalcode init --client <client>");
        process.exit(1);
    }
    const client = CLIENTS.find((c) => c.id === clientId);
    if (!client) {
        console.error(`Unknown client: ${clientId}`);
        process.exit(1);
    }
    configureClient(client);
    if (!noOpen) {
        const url = `${BASE_URL}/onboarding/mcp?client=${target}`;
        try {
            openUrl(url);
            console.log("  Opened onboarding in your browser.");
        }
        catch {
            // ignore
        }
    }
}
// ── COUNSEL ─────────────────────────────────────────────────────────
function handleCounsel(args) {
    const sub = args[0];
    if (!sub || sub === "help" || sub === "--help") {
        console.log(`
COUNSEL — legal workflow framework for AI-assisted legal work

Commands:
  npx legalcode counsel init                          Install for Claude Code (default)
  npx legalcode counsel init --client codex           Install for OpenAI Codex CLI
  npx legalcode counsel init --force                  Reinstall (overwrites existing files)
`);
        return;
    }
    if (sub === "init") {
        const force = args.includes("--force");
        const clientIdx = args.indexOf("--client");
        const clientArg = clientIdx !== -1 ? args[clientIdx + 1] : undefined;
        const cwd = process.cwd();
        // Codex: install via the new plugin pipeline. Skill files are bundled
        // inside the counsel plugin and registered via `codex plugin install`.
        if (clientArg === "codex") {
            configureCodex(["legalcode", "counsel"]);
            return;
        }
        const target = "claude-code";
        const configDir = ".claude";
        // Check if already installed
        const existing = path.join(cwd, configDir, "skills", "counsel", "SKILL.md");
        if (fs.existsSync(existing) && !force) {
            console.log(`
  COUNSEL is already installed in this project (${target}).
  Skill: ${existing}

  To reinstall, run: npx legalcode counsel init --force
`);
            return;
        }
        // Ensure base legalcode skill is installed (search agent required)
        const baseSkillPath = path.join(cwd, ".claude", "skills", "legalcode.md");
        if (!fs.existsSync(baseSkillPath)) {
            console.log("  Installing base Legalcode skill first...");
            installSkill("claude-code");
        }
        const result = installCounsel(cwd, target);
        const invokeExamples = [
            `    /counsel:new-matter    Create a new matter workspace`,
            `    /counsel:intake        New matter intake`,
            `    /counsel:strategize    Develop legal strategy`,
            `    /counsel:research      Legal research with IRAC methodology`,
            `    /counsel:analyze       Apply law to facts (IRAC/CREAC)`,
            `    /counsel:draft         Document drafting`,
            `    /counsel:verify        Three-tier verification`,
            `    /counsel:review        Peer review`,
            `    /counsel:deliver       Pre-delivery checklist`,
            `    /counsel:monitor       Deadline and authority monitoring`,
            `    /counsel:close         Matter closure`,
            `    /counsel:status        Show all active matters`,
            `    /counsel:pause         Save work for later resumption`,
            `    /counsel:resume        Resume a paused matter`,
        ];
        console.log(`
  COUNSEL legal workflow framework installed (${target}).

  Skills:     ${result.skillFiles.length} files in ${configDir}/skills/counsel/
  Agents:     ${result.agentFiles.length} files in ${configDir}/agents/
  Framework:  ${result.frameworkSpec}
  Workspace:  ${result.workspaceDir}/

  Available commands:

${invokeExamples.join("\n")}

  Start with: /counsel:new-matter
`);
        return;
    }
    console.error(`  Unknown counsel subcommand: ${sub}`);
    console.error("  Run: npx legalcode counsel --help");
    process.exit(1);
}
// ── Usage ────────────────────────────────────────────────────────────
function printUsage() {
    console.log(`legalcode \u2014 legal data for AI agents

The Legalcode CLI is a Pro-authenticated surface. Run \`legalcode login\`
before search, fetch, download, local indexing, or Pro MCP workflows.

Setup:
  npx legalcode                       Interactive setup
  npx legalcode init --client <id>    Configure a specific client
  npx legalcode info                  Show commands, discovery flow, and help entrypoints

Search by source type:
  legalcode laws "<query>"            Search statutes and legislation
  legalcode cases "<query>"           Search case law and court decisions
  legalcode guidance "<query>"        Search regulatory guidance (Pro)
  legalcode agreements "<query>"      Search trade/tax agreements (Pro)
  legalcode patents "<query>"         Search patents (Pro)
  legalcode patent <patent-id>        Look up a specific patent (Pro)
  legalcode search "<query>"          Search a chosen source type via --type

Retrieve and download:
  legalcode fetch <source-id>         Full text to stdout
  legalcode download <source-id>      Save as local Markdown file (Pro)

Discovery:
  legalcode facets --jurisdiction <c>  Show available filters for a jurisdiction
  legalcode jurisdictions             List available jurisdiction codes

Account:
  legalcode login                     Authenticate with browser OAuth for CLI or pro MCP access
  legalcode logout                    Remove stored credentials

Local search:
  legalcode local init --client <id>  Write local MCP config for a supported client
  legalcode local workspace add <p>   Register a local directory for indexing
  legalcode local workspace list      List registered local workspaces
  legalcode local reindex [id]        Rebuild one or all local workspace indexes

COUNSEL (legal workflow framework):
  legalcode counsel init                        Install for Claude Code (default)
  legalcode counsel init --client codex         Install for OpenAI Codex CLI
  legalcode counsel init --force                Reinstall (overwrites existing files)

Run legalcode <command> --help for full options on any command.

Clients:
  claude-desktop, claude-code, chatgpt, codex, cursor, vscode, windsurf

  MCP clients (ChatGPT, Claude Desktop):
    Writes MCP server config. Agent connects via protocol.

  CLI clients (Claude Code, Codex, Cursor, VS Code, Windsurf):
    Installs a skill file that teaches your agent to use the CLI.
    Faster, cheaper, no context flooding from MCP tool definitions.
`);
}
// ── Main entry ───────────────────────────────────────────────────────
function hasHelp(args) {
    return args.includes("--help") || args.includes("-h");
}
const INIT_FLAGS = ["--client"];
const LAWS_FLAGS = [
    "--jurisdiction",
    "--status",
    "--act-type",
    "--document-nature",
    "--in-force-on-date",
    "--level",
    "--language",
    "--subdivision",
    "--law-key",
    "--date-from",
    "--date-to",
    "--sort",
    "--limit",
    "--offset",
];
const CASES_FLAGS = [
    "--jurisdiction",
    "--court-level",
    "--court-type",
    "--case-type",
    "--verdict",
    "--precedential",
    "--appeal-outcome",
    "--decision-form",
    "--offense",
    "--party",
    "--judge",
    "--lawyer",
    "--law-ref",
    "--precedent-ref",
    "--year",
    "--date-from",
    "--date-to",
    "--language",
    "--subdivision",
    "--level",
    "--sort",
    "--limit",
    "--offset",
];
const GUIDANCE_FLAGS = [
    "--jurisdiction",
    "--agency",
    "--doc-type",
    "--doc-status",
    "--is-binding",
    "--date-from",
    "--date-to",
    "--effective-from",
    "--effective-to",
    "--language",
    "--subdivision",
    "--level",
    "--law-ref",
    "--sort",
    "--limit",
    "--offset",
];
const AGREEMENTS_FLAGS = [
    "--jurisdiction",
    "--kind",
    "--trade-type",
    "--trade-scope",
    "--trade-coverage",
    "--trade-status",
    "--tax-kind",
    "--tax-scope",
    "--tax-status",
    "--instrument-type",
    "--date-from",
    "--date-to",
    "--language",
    "--sort",
    "--limit",
    "--offset",
];
const PATENTS_FLAGS = [
    "--country",
    "--inventor",
    "--assignee",
    "--status",
    "--type",
    "--before",
    "--after",
    "--language",
    "--litigation",
    "--sort",
    "--limit",
    "--offset",
];
const SEARCH_FLAGS = [
    "--jurisdiction",
    "--type",
    "--act-type",
    "--status",
    "--document-nature",
    "--in-force-on-date",
    "--law-key",
    "--court-level",
    "--court-type",
    "--case-type",
    "--verdict",
    "--precedential",
    "--appeal-outcome",
    "--decision-form",
    "--offense",
    "--party",
    "--judge",
    "--lawyer",
    "--law-ref",
    "--precedent-ref",
    "--agency",
    "--doc-type",
    "--doc-status",
    "--is-binding",
    "--kind",
    "--trade-type",
    "--trade-scope",
    "--trade-coverage",
    "--trade-status",
    "--tax-kind",
    "--tax-scope",
    "--tax-status",
    "--instrument-type",
    "--year",
    "--date-from",
    "--date-to",
    "--effective-from",
    "--effective-to",
    "--language",
    "--subdivision",
    "--jurisdiction-level",
    "--sort",
    "--limit",
    "--offset",
];
const FACETS_FLAGS = ["--jurisdiction", "--type"];
const DOWNLOAD_FLAGS = ["--out"];
async function main() {
    const argv = process.argv.slice(2);
    const cmd = argv[0];
    // Global help
    if (!cmd || cmd === "help" || (argv.length === 1 && hasHelp(argv))) {
        if (!cmd) {
            // No args → interactive init
            await handleInit([]);
            return;
        }
        printUsage();
        return;
    }
    if (cmd === "info") {
        printUsage();
        return;
    }
    // Setup commands
    if (cmd === "init") {
        await handleInit(argv.slice(1));
        return;
    }
    if (cmd === "local") {
        await handleLocal(argv.slice(1));
        return;
    }
    if (cmd === "counsel") {
        handleCounsel(argv.slice(1));
        return;
    }
    if (cmd === "connect") {
        handleConnect(argv.slice(1));
        return;
    }
    // Auth commands
    if (cmd === "login") {
        await handleLogin();
        return;
    }
    if (cmd === "logout") {
        await handleLogout();
        return;
    }
    // ── Source-type search commands ──
    if (cmd === "laws") {
        const parsed = parseCommandArgs(argv.slice(1), LAWS_FLAGS, printLawsHelp);
        const query = resolveQuery(parsed, printLawsHelp, { allowFilterOnly: true });
        await handleLaws(query, {
            jurisdiction: getFlag(parsed, "--jurisdiction"),
            status: getFlag(parsed, "--status"),
            actType: getFlag(parsed, "--act-type"),
            documentNature: getFlag(parsed, "--document-nature"),
            inForceOnDate: getFlag(parsed, "--in-force-on-date"),
            level: getFlag(parsed, "--level"),
            language: getFlag(parsed, "--language"),
            subdivision: getFlag(parsed, "--subdivision"),
            lawKey: getFlag(parsed, "--law-key"),
            dateFrom: getFlag(parsed, "--date-from"),
            dateTo: getFlag(parsed, "--date-to"),
            sort: getFlag(parsed, "--sort"),
            limit: getFlag(parsed, "--limit"),
            offset: getFlag(parsed, "--offset"),
        });
        return;
    }
    if (cmd === "cases") {
        const parsed = parseCommandArgs(argv.slice(1), CASES_FLAGS, printCasesHelp);
        const query = resolveQuery(parsed, printCasesHelp, { allowFilterOnly: true });
        await handleCases(query, {
            jurisdiction: getFlag(parsed, "--jurisdiction"),
            courtLevel: getFlag(parsed, "--court-level"),
            courtType: getFlag(parsed, "--court-type"),
            caseType: getFlag(parsed, "--case-type"),
            verdict: getFlag(parsed, "--verdict"),
            precedential: getFlag(parsed, "--precedential"),
            appealOutcome: getFlag(parsed, "--appeal-outcome"),
            decisionForm: getFlag(parsed, "--decision-form"),
            offense: getFlag(parsed, "--offense"),
            party: getFlag(parsed, "--party"),
            judge: getFlag(parsed, "--judge"),
            lawyer: getFlag(parsed, "--lawyer"),
            lawRef: getFlag(parsed, "--law-ref"),
            precedentRef: getFlag(parsed, "--precedent-ref"),
            year: getFlag(parsed, "--year"),
            dateFrom: getFlag(parsed, "--date-from"),
            dateTo: getFlag(parsed, "--date-to"),
            language: getFlag(parsed, "--language"),
            subdivision: getFlag(parsed, "--subdivision"),
            level: getFlag(parsed, "--level"),
            sort: getFlag(parsed, "--sort"),
            limit: getFlag(parsed, "--limit"),
            offset: getFlag(parsed, "--offset"),
        });
        return;
    }
    if (cmd === "guidance") {
        const parsed = parseCommandArgs(argv.slice(1), GUIDANCE_FLAGS, printGuidanceHelp);
        const query = resolveQuery(parsed, printGuidanceHelp, { allowFilterOnly: true });
        await handleGuidance(query, {
            jurisdiction: getFlag(parsed, "--jurisdiction"),
            agency: getFlag(parsed, "--agency"),
            docType: getFlag(parsed, "--doc-type"),
            docStatus: getFlag(parsed, "--doc-status"),
            isBinding: getFlag(parsed, "--is-binding"),
            dateFrom: getFlag(parsed, "--date-from"),
            dateTo: getFlag(parsed, "--date-to"),
            effectiveFrom: getFlag(parsed, "--effective-from"),
            effectiveTo: getFlag(parsed, "--effective-to"),
            language: getFlag(parsed, "--language"),
            subdivision: getFlag(parsed, "--subdivision"),
            level: getFlag(parsed, "--level"),
            lawRef: getFlag(parsed, "--law-ref"),
            sort: getFlag(parsed, "--sort"),
            limit: getFlag(parsed, "--limit"),
            offset: getFlag(parsed, "--offset"),
        });
        return;
    }
    if (cmd === "agreements") {
        const parsed = parseCommandArgs(argv.slice(1), AGREEMENTS_FLAGS, printAgreementsHelp);
        const query = resolveQuery(parsed, printAgreementsHelp, { allowFilterOnly: true });
        await handleAgreements(query, {
            jurisdiction: getFlag(parsed, "--jurisdiction"),
            kind: getFlag(parsed, "--kind"),
            tradeType: getFlag(parsed, "--trade-type"),
            tradeScope: getFlag(parsed, "--trade-scope"),
            tradeCoverage: getFlag(parsed, "--trade-coverage"),
            tradeStatus: getFlag(parsed, "--trade-status"),
            taxKind: getFlag(parsed, "--tax-kind"),
            taxScope: getFlag(parsed, "--tax-scope"),
            taxStatus: getFlag(parsed, "--tax-status"),
            instrumentType: getFlag(parsed, "--instrument-type"),
            dateFrom: getFlag(parsed, "--date-from"),
            dateTo: getFlag(parsed, "--date-to"),
            language: getFlag(parsed, "--language"),
            sort: getFlag(parsed, "--sort"),
            limit: getFlag(parsed, "--limit"),
            offset: getFlag(parsed, "--offset"),
        });
        return;
    }
    if (cmd === "patents") {
        const parsed = parseCommandArgs(argv.slice(1), PATENTS_FLAGS, printPatentsHelp);
        const query = resolveQuery(parsed, printPatentsHelp, { allowFilterOnly: true });
        await handlePatents(query, {
            after: getFlag(parsed, "--after"),
            assignee: getFlag(parsed, "--assignee"),
            before: getFlag(parsed, "--before"),
            country: getFlag(parsed, "--country"),
            inventor: getFlag(parsed, "--inventor"),
            language: getFlag(parsed, "--language"),
            litigation: getFlag(parsed, "--litigation"),
            limit: getFlag(parsed, "--limit"),
            offset: getFlag(parsed, "--offset"),
            sort: getFlag(parsed, "--sort"),
            status: getFlag(parsed, "--status"),
            type: getFlag(parsed, "--type"),
        });
        return;
    }
    if (cmd === "patent") {
        const parsed = parseCommandArgs(argv.slice(1), [], printPatentHelp);
        if (parsed.positionals.length === 0) {
            printPatentHelp();
            process.exit(1);
        }
        const query = parsed.positionals[0];
        if (!query) {
            printPatentHelp();
            process.exit(1);
        }
        await handlePatent(query);
        return;
    }
    if (cmd === "search") {
        const parsed = parseCommandArgs(argv.slice(1), SEARCH_FLAGS, printSearchHelp);
        const query = resolveQuery(parsed, printSearchHelp, { allowFilterOnly: true });
        await handleSearch(query, {
            actType: getFlag(parsed, "--act-type"),
            agency: getFlag(parsed, "--agency"),
            appealOutcome: getFlag(parsed, "--appeal-outcome"),
            documentNature: getFlag(parsed, "--document-nature"),
            jurisdiction: getFlag(parsed, "--jurisdiction"),
            type: getFlag(parsed, "--type"),
            courtLevel: getFlag(parsed, "--court-level"),
            courtType: getFlag(parsed, "--court-type"),
            caseType: getFlag(parsed, "--case-type"),
            decisionForm: getFlag(parsed, "--decision-form"),
            docStatus: getFlag(parsed, "--doc-status"),
            docType: getFlag(parsed, "--doc-type"),
            effectiveFrom: getFlag(parsed, "--effective-from"),
            effectiveTo: getFlag(parsed, "--effective-to"),
            inForceOnDate: getFlag(parsed, "--in-force-on-date"),
            instrumentType: getFlag(parsed, "--instrument-type"),
            isBinding: getFlag(parsed, "--is-binding"),
            kind: getFlag(parsed, "--kind"),
            party: getFlag(parsed, "--party"),
            judge: getFlag(parsed, "--judge"),
            jurisdictionLevel: getFlag(parsed, "--jurisdiction-level"),
            lawKey: getFlag(parsed, "--law-key"),
            lawRef: getFlag(parsed, "--law-ref"),
            lawyer: getFlag(parsed, "--lawyer"),
            offense: getFlag(parsed, "--offense"),
            precedential: getFlag(parsed, "--precedential"),
            precedentRef: getFlag(parsed, "--precedent-ref"),
            status: getFlag(parsed, "--status"),
            taxKind: getFlag(parsed, "--tax-kind"),
            taxScope: getFlag(parsed, "--tax-scope"),
            taxStatus: getFlag(parsed, "--tax-status"),
            tradeCoverage: getFlag(parsed, "--trade-coverage"),
            tradeScope: getFlag(parsed, "--trade-scope"),
            tradeStatus: getFlag(parsed, "--trade-status"),
            tradeType: getFlag(parsed, "--trade-type"),
            verdict: getFlag(parsed, "--verdict"),
            year: getFlag(parsed, "--year"),
            dateFrom: getFlag(parsed, "--date-from"),
            dateTo: getFlag(parsed, "--date-to"),
            language: getFlag(parsed, "--language"),
            subdivision: getFlag(parsed, "--subdivision"),
            sort: getFlag(parsed, "--sort"),
            limit: getFlag(parsed, "--limit"),
            offset: getFlag(parsed, "--offset"),
        });
        return;
    }
    if (cmd === "facets") {
        const parsed = parseCommandArgs(argv.slice(1), FACETS_FLAGS, printFacetsHelp);
        await handleFacets({
            jurisdiction: getFlag(parsed, "--jurisdiction"),
            type: getFlag(parsed, "--type"),
        });
        return;
    }
    // ── Retrieve and download ──
    if (cmd === "fetch") {
        if (hasHelp(argv.slice(1))) {
            printFetchHelp();
            return;
        }
        const sourceId = argv[1];
        if (!sourceId) {
            printFetchHelp();
            process.exit(1);
        }
        await handleFetch(sourceId);
        return;
    }
    if (cmd === "download") {
        const parsed = parseCommandArgs(argv.slice(1), DOWNLOAD_FLAGS, printDownloadHelp);
        const sourceId = parsed.positionals[0];
        if (!sourceId || parsed.positionals.length > 1) {
            printDownloadHelp();
            process.exit(1);
        }
        await handleDownload(sourceId, getFlag(parsed, "--out"));
        return;
    }
    if (cmd === "jurisdictions") {
        await handleJurisdictions();
        return;
    }
    console.error(`Unknown command: "${cmd}"`);
    printUsage();
    process.exit(1);
}
main().catch((err) => {
    if (err instanceof Error) {
        if (err.name === "AbortError") {
            console.error("Network request timed out. Set LEGALCODE_HTTP_TIMEOUT_MS to increase the timeout.");
        }
        else {
            console.error(err.message);
        }
    }
    else {
        console.error(String(err));
    }
    process.exit(1);
});
