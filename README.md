# legalcode CLI

Pro-only setup assistant for connecting authenticated Legalcode into supported
MCP clients and agent workflows.

The CLI requires a Legalcode Pro account. Run `legalcode login` before using
search, fetch, download, local indexing, or Pro MCP workflows.

## Install

Install from the public GitHub package tarball:

```bash
npm install -g https://github.com/legalcode-md/cli/archive/refs/heads/main.tar.gz
legalcode login
```

After the npm package is published, the same CLI can be installed from npm:

```bash
npm install -g legalcode
legalcode login
```

## Commands

- `npx legalcode`
- `npx legalcode init --client chatgpt`
- `npx legalcode init --client claude-code`
- `npx legalcode init --client codex`
- `legalcode login` for CLI and Pro-host OAuth flows
- API-backed commands such as search, fetch, and download require Pro authentication

## Codex setup

- `legalcode init --client codex` writes the MCP config to `~/.codex/config.toml`
- it adds or updates the `[mcp_servers.legalcode]` block
- it preserves the rest of the existing Codex global config
- it still installs the project skill file at `.codex/skills/legalcode.md`

## Environment overrides

- `LEGALCODE_WEB_URL` (default `https://legalcode.md`)
- `LEGALCODE_MCP_URL` (default `https://mcp.legalcode.md/mcp`)
- `LEGALCODE_MCP_PRO_URL` (default `https://mcppro.legalcode.md/mcp`)

## MCP hosts

- `mcp.legalcode.md` is the public MCP endpoint used by the free plugin
- `mcppro.legalcode.md` is the OAuth-enabled MCP endpoint used by the CLI
- CLI users should authenticate against the Pro host with `legalcode login`

## Client-specific setup

- ChatGPT:
  - run `npx legalcode init --client chatgpt`
  - open ChatGPT and add a custom MCP connector
  - paste `https://mcp.legalcode.md/mcp` for public access or `https://mcppro.legalcode.md/mcp` for full access

- Claude Desktop / Claude:
  - run `npx legalcode init --client claude-desktop`
  - open `Customize -> Connectors`
  - add a custom connector with the public or pro MCP URL
  - remote MCP servers are not activated through `claude_desktop_config.json`

- Claude Code:
  - run `npx legalcode init --client claude-code`
  - open Claude Code's MCP settings and add the remote MCP URL shown by the CLI

- Codex:
  - run `npx legalcode init --client codex`
  - the CLI writes the MCP server entry to `~/.codex/config.toml`
