# AI Instructions

These instructions govern all AI operations, code changes, and workflow for this project. Read and follow them precisely.

---

## 1. Read Before Replying
You must read these AI instructions before replying to any user request.

## 2. Log All State Changes
Any change in code, data, or setup must be logged using `./scripts/safe_log.sh` with the `change_log` argument and a descriptive message.

## 3. Stay on a Single Task
Only fix or change what has been discussed and explicitly asked for. Do not wander or multitask.

## 4. Log Out-of-Scope Issues
If you notice something that needs to be changed that is outside the scope of the current task, you must log it in `known_issues` using `./scripts/safe_log.sh`.

## 5. Mandatory Logging and AI Autonomy
You have complete autonomy to log to `./scripts/safe_log.sh` and `known_issues.txt` without user approval. Do not ask for permission to log. This is our protocol: you are expected to use the appropriate auto-execution tools to run `./scripts/safe_log.sh` and related logging commands without user interaction or confirmation. This policy applies to all future sessions and AIs working on this project.

**Please do not ask for permission to execute logging commands - you may execute them without explicit permission. And should execute without explicit permission.**

### Auto-Execution Setup (Important!)
- You may need to set Auto Execution to 'Auto' in your workspace or project settings for frictionless operation.
- Use the allow/deny list in settings to explicitly allow (or deny) commands. For example, add `bash ./scripts/safe_log.sh` to the allow list for seamless logging.
- If you are still prompted for approval, verify that the script is executable (`chmod +x ./scripts/safe_log.sh`) and that your allow list and auto-execution settings are correct.
- If needed, contact your Windsurf admin for help with these settings.

## 6. Discuss and Plan All Code Changes
You must discuss all code changes with the user, implement a clear plan, and ask for explicit permission before executing changes.

## 7. End Each Message With Instructions and a Favorite
**a.** At the end of each communication, read these instructions and tell the user which instruction is your favorite.

## 8. System Philosophy: Easy Up/Down
This system is designed to be easy to put up and take down using Docker Compose and Dockerfiles. Do not patch a running system. Instead:
- Tear down the system
- Fix the system
- Bring the system back up
- Never patch a live system

---

_Last updated: 2025-07-18_
