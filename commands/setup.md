# Chronos Setup

Configure Chronos to track your Claude Code usage.

## Instructions

Help the user set up Chronos by:

1. Ask the user for their Chronos server URL (default: http://localhost:3000)
2. Ask the user for their API key (required)
3. Create the configuration directory at `~/.chronos/` if it doesn't exist
4. Save the configuration to `~/.chronos/config.json` with this format:

```json
{
  "api_url": "http://localhost:3000",
  "api_key": "ut_xxx..."
}
```

5. Confirm the setup is complete

## Notes

- The API key is obtained from the Chronos server administrator
- The API URL should include the protocol (http:// or https://)
- Do not include a trailing slash in the API URL
