# Chronos Setup

Configure Chronos to track your Claude Code usage.

## Instructions

1. First, check if there is an existing configuration:

```bash
cat ~/.chronos/config.json 2>/dev/null
```

2. Use `AskUserQuestion` to ask the user for their **API URL** (default: `http://localhost:3000`). If an existing config was found, show the current value and ask if they want to keep it or change it.

3. Use `AskUserQuestion` to ask the user for their **API Key**. If an existing config was found, show a masked version (first 8 chars) and ask if they want to keep it or change it.

4. Run the setup script in non-interactive mode with the collected values:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/chronos-setup.js --api-url <API_URL> --api-key <API_KEY>
```

5. Show the output to the user.
