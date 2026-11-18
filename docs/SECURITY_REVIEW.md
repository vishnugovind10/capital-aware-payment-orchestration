# Dependency security review

Reviewed 18 November 2026 using the committed package manifest/lockfile and installed dependency tree.

## Findings

- `npm audit --omit=dev`: **0 vulnerabilities** in production dependencies.
- Full `npm audit`: **5 high findings**, all the same transitive advisory for `picomatch` and its dependency paths through `fdir`, `tinyglobby`, `vite` and `vitest`.
- The installed tree contains `picomatch@4.0.7`. The advisory [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) affects versions through `4.0.7` and currently lists no patched version. `npm view picomatch version` also returns `4.0.7`.
- The dependency paths are development tooling; `picomatch` is not in the production dependency set or emitted client bundle. The affected parser code is used by glob matching in the installed developer tools. This project does not accept glob patterns from its application UI or run a production Node payment service, so no attacker-controlled runtime path was identified in the deployed browser artifact. A locally exposed development server still increases exposure to the broader dev toolchain; keep it on a trusted interface and do not treat this assessment as proof of exploitability absence.
- `npm audit fix --force` proposes a breaking downgrade of the test runner. No compatible patched version is available, so no forced version override or major dependency change was applied.

## Verification

`npm ls picomatch fdir tinyglobby vite vitest --all` confirmed the installed paths. Unit tests and production build pass; full development audit remains unresolved pending an upstream patch or a compatible dependency release. The existing CI workflow runs install, tests and build; it does not run `npm audit`.

This is a dependency review, not a security certification.
