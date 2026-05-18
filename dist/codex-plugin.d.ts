export interface CodexInstallResult {
    marketplaceRoot: string;
    installedPlugins: string[];
    detectedVersion: string;
}
export declare class CodexCliMissingError extends Error {
}
export declare class CodexCliTooOldError extends Error {
}
export declare class CodexPluginCommandError extends Error {
    readonly command: string;
    readonly stderr: string;
    readonly exitCode: number | null;
    constructor(command: string, stderr: string, exitCode: number | null);
}
export declare function getPluginAssetsDir(): string;
/**
 * Materialize the bundled codex-plugin/ tree to a stable absolute path
 * (~/.legalcode/codex-plugin/) so Codex can re-resolve the local marketplace
 * source on every load.
 */
export declare function materializeCodexPlugin(): string;
/**
 * Confirm the codex CLI is on PATH and new enough to support
 * `codex plugin marketplace add`. Throws on missing/too-old.
 */
export declare function assertCodexCompatible(): string;
/**
 * Add the local marketplace and install the requested plugins.
 *
 * Tries the modern `codex plugin marketplace add` first; falls back to the
 * pre-0.122 `codex marketplace add` form if the umbrella subcommand is absent.
 */
export declare function runCodexPluginInstall(marketplaceRoot: string, pluginNames: string[]): void;
/**
 * Full Codex install pipeline: version-check, materialize, register, install.
 */
export declare function installCodexPlugin(pluginNames: string[]): CodexInstallResult;
//# sourceMappingURL=codex-plugin.d.ts.map