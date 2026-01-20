# uTrack Setup

Configure uTrack to track your Claude Code usage.

## Instructions

Help the user set up uTrack by:

1. Ask the user for their uTrack server URL (default: http://localhost:3000)
2. Ask the user for their API key (required)
3. Create the configuration directory at `~/.utrack/` if it doesn't exist
4. Save the configuration to `~/.utrack/config.json` with this format:

```json
{
  "api_url": "http://localhost:3000",
  "api_key": "ut_xxx..."
}
```

5. Confirm the setup is complete

## Notes

- The API key is obtained from the uTrack server administrator
- The API URL should include the protocol (http:// or https://)
- Do not include a trailing slash in the API URL
