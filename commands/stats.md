# Chronos Stats

View your Claude Code usage statistics.

## Instructions

1. Read the Chronos configuration from `~/.chronos/config.json`
2. If not configured, inform the user to run `/chronos:setup` first
3. Make a GET request to the Chronos API:
   - For today's stats: `GET /api/v1/stats/today`
   - For weekly stats: `GET /api/v1/stats/week`
   - Include the Authorization header: `Bearer <api_key>`
4. Display the statistics in a formatted way

## Output Format

Show the following metrics:
- Total time tracked
- Number of sessions
- Number of prompts/interactions
- Token usage (input, output, cache)
- Breakdown by project (if available)

## Parameters

- `period`: Optional. Can be "today" (default) or "week"

## Example Usage

```
/chronos:stats
/chronos:stats week
```
