# Chronos Status

Check your Chronos configuration and connection status.

## Instructions

1. Read the Chronos configuration file at `~/.chronos/config.json`
2. Check if the configuration exists and is valid
3. If configured, test the connection to the API server by making a request to `/health`
4. Report the status to the user

## Output Format

Report the following information:
- Configuration status (configured/not configured)
- API URL (if configured)
- API Key (first 8 characters only, masked)
- Connection status (connected/failed)
- Any errors encountered
