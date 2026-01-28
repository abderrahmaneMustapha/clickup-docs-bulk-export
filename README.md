# ClickUp Docs Exporter

A CLI tool to export your ClickUp Docs and Wikis to local markdown files, preserving the full page hierarchy.

## Features

- 📁 **Preserves hierarchy** - Nested pages become nested folders
- 📝 **Clean markdown** - Exports content in standard markdown format
- ⚡ **Fast & reliable** - Handles rate limiting and retries automatically
- 🔒 **Secure** - Your token stays local, never stored
- 🎯 **Flexible** - Export all docs or a single doc

## Installation

### Clone and run locally

```bash
git clone https://github.com/abderrahmaneMustapha/clickup-docs-bulk-export.git
cd clickup-docs-bulk-export
npm install
npm run build
```

Then run the CLI:

```bash
node dist/cli.js --token YOUR_TOKEN --workspace YOUR_WORKSPACE_ID
```

### Global installation (from npm)

```bash
npm install -g clickup-docs-exporter
clickup-docs-exporter --token YOUR_TOKEN --workspace YOUR_WORKSPACE_ID
```

## Usage

### Export all docs from a workspace

```bash
clickup-docs-exporter \
  --token pk_12345678_ABCDEFGHIJKLMNOP \
  --workspace 1234567 \
  --output ./my-docs
```

### Export a single doc

```bash
clickup-docs-exporter \
  --token pk_12345678_ABCDEFGHIJKLMNOP \
  --workspace 1234567 \
  --doc abc123 \
  --output ./my-docs
```

### Options

| Option | Alias | Required | Description |
|--------|-------|----------|-------------|
| `--token` | `-t` | Yes | Your ClickUp API token |
| `--workspace` | `-w` | Yes | ClickUp Workspace ID |
| `--output` | `-o` | No | Output directory (default: `./clickup-docs`) |
| `--doc` | `-d` | No | Export single doc by ID |
| `--verbose` | `-v` | No | Show detailed progress |

## Getting Your ClickUp API Token

1. Log in to ClickUp
2. Click your avatar in the upper-right corner and select **Settings**
3. In the sidebar, click **Apps**
4. Under **API Token**, click **Generate** (or **Regenerate** if you already have one)
5. Click **Copy** to copy your token

Your token will look like: `pk_12345678_ABCDEFGHIJKLMNOP`

> 📖 For more details, see the [official ClickUp Authentication documentation](https://developer.clickup.com/docs/authentication).

## Finding Your Workspace ID

1. Open ClickUp in your browser
2. Go to any space in your workspace
3. Look at the URL: `https://app.clickup.com/1234567/...`
4. The number after `app.clickup.com/` is your Workspace ID

## Output Structure

The exporter creates a folder structure that mirrors your ClickUp docs:

```
my-docs/
├── getting-started/
│   ├── index.md           # Main page content
│   ├── installation.md    # Child page (no sub-pages)
│   └── configuration/
│       ├── index.md       # Page with children
│       ├── basic.md
│       └── advanced.md
├── api-reference/
│   └── index.md
└── changelog.md
```

Each markdown file includes frontmatter:

```markdown
---
title: "Getting Started"
exported_at: "2026-01-28T12:00:00.000Z"
---

Your content here...
```

## Use Cases

- **Backup** - Keep local copies of your documentation
- **Migration** - Move docs to another platform
- **Offline access** - Read docs without internet
- **Version control** - Track changes with git
- **AI training** - Use your docs as context for AI tools

## Need a Hosted Solution?

If you want to publish your ClickUp docs as a beautiful, SEO-optimized website without managing infrastructure, check out [WikiBeem](https://wikibeem.com).

WikiBeem automatically syncs your ClickUp docs and publishes them with:
- Custom domains
- SEO optimization
- Beautiful themes
- Search functionality
- Analytics

## Requirements

- Node.js 18 or higher
- ClickUp API token with read access

## License

MIT © [Toumi Abderrahmane](https://github.com/abderrahmaneMustapha)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Links

- [GitHub Repository](https://github.com/abderrahmaneMustapha/clickup-docs-bulk-export)
- [Report Issues](https://github.com/abderrahmaneMustapha/clickup-docs-bulk-export/issues)
- [WikiBeem - Hosted Solution](https://wikibeem.com)
