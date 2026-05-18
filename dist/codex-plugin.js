import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Codex CLI versions older than this lack `codex plugin marketplace add`.
const MIN_CODEX_VERSION = "0.121.0";
const UPGRADE_HINT = "Upgrade Codex CLI: https://developers.openai.com/codex/cli (need >= 0.121.0)";
export class CodexCliMissingError extends Error {
}
export class CodexCliTooOldError extends Error {
}
export class CodexPluginCommandError extends Error {
    command;
    stderr;
    exitCode;
    constructor(command, stderr, exitCode) {
        super(`Command failed (exit ${exitCode ?? "?"}): ${command}\n${stderr.trim()}`);
        this.command = command;
        this.stderr = stderr;
        this.exitCode = exitCode;
    }
}
export function getPluginAssetsDir() {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    return path.join(moduleDir, "codex-plugin");
}
function copyDirectoryRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
        }
        else if (entry.isFile()) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
/**
 * Materialize the bundled codex-plugin/ tree to a stable absolute path
 * (~/.legalcode/codex-plugin/) so Codex can re-resolve the local marketplace
 * source on every load.
 */
export function materializeCodexPlugin() {
    const src = getPluginAssetsDir();
    if (!fs.existsSync(src)) {
        throw new Error(`Codex plugin assets not found at ${src}. Did the build copy codex-plugin/ into dist/?`);
    }
    const dest = path.join(os.homedir(), ".legalcode", "codex-plugin");
    // Wipe and recopy so an upgrade is a clean overwrite.
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
    }
    copyDirectoryRecursive(src, dest);
    return dest;
}
function parseVersion(s) {
    const match = s.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!match)
        return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}
function compareVersions(a, b) {
    for (const index of [0, 1, 2]) {
        if (a[index] !== b[index])
            return a[index] - b[index];
    }
    return 0;
}
/**
 * Confirm the codex CLI is on PATH and new enough to support
 * `codex plugin marketplace add`. Throws on missing/too-old.
 */
export function assertCodexCompatible() {
    const result = spawnSync("codex", ["--version"], { encoding: "utf-8" });
    if (result.status !== 0 || (result.error && result.status === null)) {
        throw new CodexCliMissingError(`\`codex\` CLI not found on PATH. Install it first: https://developers.openai.com/codex/cli`);
    }
    const detected = parseVersion(result.stdout) ?? parseVersion(result.stderr);
    if (!detected) {
        throw new CodexCliTooOldError(`Could not parse codex --version output: ${result.stdout || result.stderr}\n${UPGRADE_HINT}`);
    }
    const min = parseVersion(MIN_CODEX_VERSION);
    if (!min) {
        throw new CodexCliTooOldError(`Could not parse minimum codex version: ${MIN_CODEX_VERSION}`);
    }
    if (compareVersions(detected, min) < 0) {
        throw new CodexCliTooOldError(`Codex CLI ${detected.join(".")} is too old (need >= ${MIN_CODEX_VERSION}).\n${UPGRADE_HINT}`);
    }
    return detected.join(".");
}
function runCodex(args) {
    const result = spawnSync("codex", args, { encoding: "utf-8" });
    if (result.status !== 0 || (result.error && result.status === null)) {
        throw new CodexPluginCommandError(`codex ${args.join(" ")}`, result.stderr || result.error?.message || "", result.status);
    }
    return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}
/**
 * Add the local marketplace and install the requested plugins.
 *
 * Tries the modern `codex plugin marketplace add` first; falls back to the
 * pre-0.122 `codex marketplace add` form if the umbrella subcommand is absent.
 */
export function runCodexPluginInstall(marketplaceRoot, pluginNames) {
    const addAttempts = [
        ["plugin", "marketplace", "add", marketplaceRoot],
        ["marketplace", "add", marketplaceRoot],
    ];
    let lastErr = null;
    let added = false;
    for (const args of addAttempts) {
        try {
            runCodex(args);
            added = true;
            break;
        }
        catch (err) {
            if (err instanceof CodexPluginCommandError) {
                lastErr = err;
                continue;
            }
            throw err;
        }
    }
    if (!added) {
        throw lastErr ?? new Error("codex marketplace add failed for unknown reason");
    }
    for (const name of pluginNames) {
        const installAttempts = [
            ["plugin", "install", name],
            ["plugin", "enable", name],
        ];
        let installed = false;
        let installErr = null;
        for (const args of installAttempts) {
            try {
                runCodex(args);
                installed = true;
                break;
            }
            catch (err) {
                if (err instanceof CodexPluginCommandError) {
                    installErr = err;
                    continue;
                }
                throw err;
            }
        }
        if (!installed) {
            throw installErr ?? new Error(`codex plugin install ${name} failed`);
        }
    }
}
/**
 * Full Codex install pipeline: version-check, materialize, register, install.
 */
export function installCodexPlugin(pluginNames) {
    const detectedVersion = assertCodexCompatible();
    const marketplaceRoot = materializeCodexPlugin();
    runCodexPluginInstall(marketplaceRoot, pluginNames);
    return { marketplaceRoot, installedPlugins: pluginNames, detectedVersion };
}
