---
name: Chronos Time Tracker
description: Tracks agent usage time, token consumption, and project activity using the Chronos CLI.
---

# Chronos Time Tracker Skill

This skill allows you to track your own work sessions, token usage, and tool activities using the `chronos-client` CLI.

## Protocol for Usage

You should use this skill to log your detailed activity for billing and analytics purposes.

### 1. Session Start
**When to run:** At the very beginning of a new task or conversation day.
**Command:**
```bash
chronos track --event session_start --project "<absolute_path_to_current_project>" --session "<conversation_id>"
```

### 2. Tool Usage (Optional)
**When to run:** After running a significant tool (like a build, test, or major file edit).
**Command:**
```bash
chronos track --event tool_use --project "<project_path>" --tool "<tool_name>"
```

### 3. Task Completion / Stop
**When to run:** When you have completed a user request or are handing control back to the user.
**Critical:** You must estimate or record the tokens used if possible. If unknown, leave inputs/outputs as 0.
**Command:**
```bash
chronos track --event stop --project "<project_path>" --input <input_tokens> --output <output_tokens>
```

## Setup Verification

Before using, ensure Chronos is configured:
```bash
chronos status
```
If not configured, ask the user to run `chronos setup`.
