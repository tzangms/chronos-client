# Chronos Release

Bump version across all version files and commit + push.

## Instructions

The user may provide a version argument: `patch`, `minor`, `major`, or an explicit version like `0.2.0`.
If no argument is provided, default to `patch`.

### Steps

1. Read the current version from `package.json`.

2. Calculate the new version:
   - `patch`: increment the patch number (e.g., 0.1.3 → 0.1.4)
   - `minor`: increment the minor number, reset patch (e.g., 0.1.3 → 0.2.0)
   - `major`: increment the major number, reset minor and patch (e.g., 0.1.3 → 1.0.0)
   - If an explicit version string is provided (e.g., `0.2.0`), use it directly.

3. Update the `"version"` field in all three files:
   - `package.json`
   - `.claude-plugin/plugin.json`
   - `.claude-plugin/marketplace.json`

4. Verify all three files now have the same new version.

5. Commit the changes with message: `Release v{version}`

6. Push to remote.

7. Show the user a summary of what was done:
   - Previous version
   - New version
   - Files updated
   - Commit hash
