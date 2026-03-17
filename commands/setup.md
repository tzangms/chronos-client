# Chronos Setup

Configure Chronos to track your Claude Code usage.

## Instructions

Run the setup script:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/chronos-setup.js
```

The script will interactively ask for:
1. **API URL** - The Chronos server URL (default: http://localhost:3000)
2. **API Key** - Your API key from the Chronos server administrator

It will test the connection and save the configuration to `~/.chronos/config.json`.

For non-interactive setup (e.g., scripting), pass arguments directly:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/chronos-setup.js --api-url https://chronos.example.com --api-key chr_xxx
```

Show the output to the user.
