# local_loginas_participants

Adds a **"Log in as this user"** row action to the course Participants
report, right next to the existing "Edit enrolment" (pencil) icon.

## Overview

Logging in as a student normally takes several clicks: open the course,
open a block or settings menu, search for the user, confirm. This plugin
removes that detour — from the Participants table you already use to
manage enrolments, one click (plus a confirmation) logs you in as that
user and drops you back into the course.

## Why not just use the "Login as" block or the built-in settings link?

Both still work and this plugin doesn't replace them — it adds a shortcut
where you're most likely to already be looking: the Participants table
you use for enrolments, roles, and groups. No extra block to add to the
course, no separate search dialog.

## How it works

- The icon only appears on a course's Participants report
  (`/user/index.php`), never on the site-wide participant list.
- It's shown per-row, next to the enrolment edit icon, for every user
  Moodle already lets you manage enrolment for.
- Clicking it opens a confirmation dialog, then logs you in as that user
  and returns you to the course — the same behaviour as Moodle's built-in
  "Login as" feature (`/course/loginas.php`), just reachable in one click.
- No core files are modified. The icon is injected via Moodle's
  `core\hook\output\before_footer_html_generation` hook
  (see `classes/hook_callbacks.php` and `db/hooks.php`).
- The login-as URL is built **server-side** with `moodle_url()`, using the
  same call core itself uses in `course/loginas.php`. The JavaScript
  (`amd/src/rowaction.js`) never constructs URLs — it only substitutes the
  target user's id into the server-built template and reuses
  `core/notification`'s confirm dialog.

## Permissions

This plugin defines **no capability of its own**. It reuses Moodle's
existing `moodle/user:loginas` capability:

- The icon is only added to the page for users who already hold
  `moodle/user:loginas` in that course context — checked server-side
  before any JavaScript is even loaded.
- The link it builds points at core's own `course/loginas.php`, which
  re-validates the same capability, the session key, and Moodle's
  "you can never log in as another site administrator" rule
  independently of anything this plugin does.

In short: whoever can already log in as a user through any other route in
Moodle can use this shortcut. Whoever can't, never sees the icon and
can't use it by guessing the URL either.

## Where the data lives

This plugin stores no data of its own — no new database tables, no user
preferences, no settings. It only reads Moodle's existing capability and
enrolment state at render time.

## Installation

1. Copy this folder to `local/loginas_participants` in your Moodle install.
2. Visit *Site administration → Notifications* to complete the install.

## Requirements

- Moodle 4.0 or later.

## Changelog

### 1.0.0

- Initial release: row-level login-as action on the Participants report.

## License

GNU GPL v3 or later. See [LICENSE](LICENSE).
