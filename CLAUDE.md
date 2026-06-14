# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

WME Validator is a Tampermonkey/GreasyFork userscript for the [Waze Map Editor](https://waze.com). It validates map data (segments, nodes, venues) against 150+ rules across 26+ countries, highlights issues in the editor, and generates detailed reports with wiki references and solutions.

## Build Commands

The project uses shell scripts wrapping the Google Closure Compiler (Java). No `npm` or `package.json`.

```bash
./10.release.sh   # Release build → build/WME_Validator.user.js (ADVANCED_OPTIMIZATIONS)
./20.debug.sh     # Debug build → build/WME_Validator.debug.js (BUNDLE, DEF_DEBUG=true)
./30.gf.sh        # GreasyFork build → build/WME_Validator.gf.js (WHITESPACE_ONLY)
./98.format.sh    # Format the compiled output with clang-format (Google style, tab width 4)
./99.build.sh     # Orchestrator — runs all three build variants
```

> **Windows / Git Bash note:** If scripts produce `: not found` errors, strip CRLF line endings with:
> ```bash
> sed -i 's/\r//' *.sh
> ```

Configuration (compiler path, output dirs) is in `./00.config.sh`. The Closure Compiler JAR is **auto-downloaded** from Maven Central on first run — no manual installation needed. The script detects any existing `closure-compiler-*.jar` in the repo root, verifies its MD5 against Maven Central, and re-downloads if missing or corrupt. Always fetches the latest published release.

There are **no automated tests**. Validation is done manually per `doc/RELENG.md`.

## Architecture

### Build Pipeline

Source files are concatenated in a specific order and fed to Closure Compiler:

1. `meta/meta-begin.js` — UserScript `@userscript` header
2. `meta/i18n-begin.js` — opens the translations object
3. `i18n/default.js` + `i18n/<CC>.js` (26 countries) — localization rules, auto-concatenated
4. `meta/i18n-end.js` — closes the translations object
5. `src/*.js` — core application code
6. `meta/meta-end.js` — closing wrapper
7. `meta/wme-externs.js` + `meta/jquery-1.9.js` — Closure Compiler extern definitions (not bundled, only used for type-checking)

The post-build steps prepend the UserScript metadata header and run `clang-format`.

### Global Namespaces

All runtime state lives in four top-level objects defined in `src/data.js`:

| Namespace | Purpose |
|-----------|---------|
| `_WV`     | Private validator state and configuration |
| `_UI`     | User interface state |
| `_RT`     | Runtime data (current scan results, active segment info) |
| `_REP`    | Report accumulator |

The `_THUI` namespace (from `src/lib/thui.js`) is a small embedded HTML UI toolkit.

### Core Execution Flow

```
WME login event
  └─ F_LOGIN (src/login.js)        — access control, UI initialization

User triggers scan
  └─ F_VALIDATE (src/validate.js)  — runs all rules against segments/nodes/venues

Map change events (segments/nodes/venues)
  └─ F_ONSEGMENTSCHANGED / F_ONNODESCHANGED / F_ONVENUESCHANGED (src/other.js)
       └─ re-validates affected objects

User requests report
  └─ F_SHOWREPORT (src/report.js)  — generates HTML/text/CSV output
```

### Source File Roles

- `src/release.js` — version string, release/expiry dates, CDN URLs, global access lists
- `src/data.js` — namespace definitions, constants, `DEF_DEBUG` flag
- `src/helpers.js` — pure utilities: `classOf`, `deepCopy`, `deepCompare`, `getDirection`
- `src/basic.js` — logging, HTML escaping, Trusted Types policy, error handling
- `src/validate.js` — validation engine; each rule is a function called per object
- `src/report.js` — report rendering (HTML table, plain text, CSV)
- `src/login.js` — login handler, access list parsing, country/user/level gates
- `src/other.js` — WME event listeners and layer change handler
- `src/lib/i18n.js` — i18n lookup helpers
- `src/lib/audio.js` — audio notification system
- `src/lib/thui.js` — tiny UI library for building form controls

### Localization and Country Rules

`i18n/` is a **git submodule** (`https://github.com/WMEValidator/i18n.git`). Each country file (`i18n/AR.js`, `i18n/DE.js`, etc.) overrides or extends the default English rules in `i18n/default.js`. When editing country-specific rules, changes go in the submodule, not in the main repo.

### Access Control

Rules can be gated by user level, username, country, or city using constants from `src/release.js`:
- `GA_FORLEVEL` — minimum WME user level
- `GA_FORUSER` / `GA_FORCOUNTRY` / `GA_FORCITY` — allowlists with negation (`"!Dekis,*"`)

These are evaluated in `F_LOGIN` against `WLM.user` attributes.

### Conventions

- Main handler functions are named `F_ACTION()` (e.g., `F_VALIDATE`, `F_LOGIN`, `F_SHOWREPORT`)
- Constants are `ALL_CAPS`
- JSDoc annotations (`@const`, `@type`, `@suppress`, `@struct`, `@define`) are used throughout — they matter for Closure Compiler's type checker and dead code elimination
- Debug-only code is guarded by `DEF_DEBUG` (a `@define` constant, stripped in release builds)
- All HTML written to the DOM must go through the Trusted Types policy defined in `src/basic.js`

## Release Checklist

See `doc/RELENG.md` for the full checklist. Key steps before releasing:
- Ensure all `window.console` calls are commented out
- Resolve all `TEST:`, `TODO:`, `BETA:` markers
- Verify header fields: country locks, user levels, release date, expiration date
- Run release build and test both in Tampermonkey and Firefox
- Check Unicode characters in the output file
