# Chronos Client - Claude Code Plugin

A Claude Code plugin for tracking AI usage time and token consumption.

## Installation

### Method 1: Via Plugin Marketplace (Recommended)

In Claude Code, register the marketplace first:

```
/plugin marketplace add tzangms/chronos-client
```

Then install the plugin:

```
/plugin install chronos@tzangms/chronos-client
```

### Method 2: Clone and Load (Development)

```bash
# Clone the repository
git clone https://github.com/tzangms/chronos-client.git ~/.chronos-plugin

# Run Claude Code with the plugin
claude --plugin-dir ~/.chronos-plugin
```

### Method 3: Add to Shell Config (Permanent)

After cloning, add this alias to your `~/.zshrc` or `~/.bashrc`:

```bash
alias claude='claude --plugin-dir ~/.chronos-plugin'
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

## Configuration

After installing the plugin, you need to configure it with your API key:

### Option 1: Run the setup command

```bash
node /path/to/chronos/client/scripts/chronos-setup.js
```

### Option 2: Use the slash command

```
/chronos:setup
```

### Option 3: Manually create config

Create `~/.chronos/config.json`:

```json
{
  "api_url": "http://localhost:3001",
  "api_key": "chr_your_api_key_here"
}
```

## Slash Commands

Once installed, these commands are available in Claude Code:

| Command | Description |
|---------|-------------|
| `/chronos:setup` | Configure API key and server URL |
| `/chronos:status` | Check configuration and connection status |
| `/chronos:stats` | View your usage statistics |
| `/chronos:stats week` | View weekly statistics |

## What Gets Tracked

The plugin automatically tracks:

- **Session Start/End** - When you start and end Claude Code sessions
- **Token Usage** - Input, output, and cache tokens
- **Project Information** - Which project you're working on
- **Machine ID** - Anonymous identifier for your machine

## How It Works

The plugin uses Claude Code hooks to capture events:

1. **SessionStart** - Records when a session begins
2. **Stop** - Parses the transcript to get token usage after each response
3. **SessionEnd** - Records when a session ends

Data is sent to your Chronos server via HTTP API.

## Offline Support

If the server is unavailable, heartbeats are stored locally in `~/.chronos/offline_heartbeats.json` and synced when the connection is restored.

## Plugin Structure

```
client/
├── .claude-plugin/
│   └── plugin.json       # Plugin manifest
├── hooks/
│   └── hooks.json        # Hook definitions
├── commands/
│   ├── setup.md          # /chronos:setup command
│   ├── status.md         # /chronos:status command
│   └── stats.md          # /chronos:stats command
├── scripts/
│   └── chronos-hook.js   # Main hook handler
└── README.md
```

## Troubleshooting

### Plugin not loading

Make sure the plugin directory contains `.claude-plugin/plugin.json`.

### Hooks not firing

Check that hooks are properly configured:

```bash
cat ~/.claude/settings.json | grep -A 20 hooks
```

### Connection errors

1. Check your API URL in `~/.chronos/config.json`
2. Make sure the server is running
3. Verify your API key is correct

### Debug mode

Set the environment variable for verbose output:

```bash
export CHRONOS_DEBUG=1
claude
```

## Privacy

- Only usage metadata is sent (tokens, timestamps, project names)
- No code content is transmitted
- Machine ID is a hash, not a real identifier
- All data stays on your configured server
