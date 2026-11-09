# System CA Trust Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task by task.

**Goal:** Default MQTT TLS to maintained operating system certificates.
**Architecture:** Resolve explicit CA list in MQTT backend; custom CA wins, native system CAs otherwise. Return visible connection error when native trust cannot load. No process-wide TLS mutation.
**Tech Stack:** TypeScript, MQTT.js, Node TLS, Electron 39, Mocha.
**Spec:** docs/superpowers/specs/2026-11-09-system-ca-trust-design.md

## Global Constraints

System trust only on Windows/macOS/Linux; preserve custom override, certificate validation and hostname checking. No silent bundled fallback. No live browser/UI tests. Keep backup app checkout untouched.

## Review Focus

- Empty or unsupported system trust must fail closed with visible error.
- Explicit custom CA must not gain additional authorities.
- Plain MQTT must work without native CA access.
- TLS hostname failures and untrusted roots must remain rejected.
- Electron packaging/runtime must expose native system CA API across OSes.

### Task 1: Trust selection and connection integration

Files: backend/src/DataSource/CertificateAuthority.ts (new), backend/src/DataSource/MqttSource.ts, backend/src/DataSource/spec/CertificateAuthority.spec.ts and MqttSource.spec.ts (new).
Interfaces: getCertificateAuthority(custom?: string): string[] | Buffer; native TLS API reads system authorities; MQTT connection consumes explicit ca.
- [x] Write targeted tests for native trust, empty/missing/throwing API, custom override and connection-state failures; run RED.
- [x] Implement minimal selection helper and MqttSource integration for mqtts/wss only. Preserve existing TLS options and return reported failure without connection attempt.
- [x] Run focused tests GREEN and local TLS integration covering accepted CA, untrusted CA and hostname rejection.

### Task 2: Native runtime verification and documentation

Files: scripts/testSystemCertificates.cjs (new), .github/workflows/system-ca-trust.yml (new), Readme.md, root/backend package.json engine requirements if needed.
Interfaces: cross-platform script executes pinned Electron as Node and validates system trust selection using compiled backend.
- [x] Verify pinned Electron native certificate API on macOS locally without windows/browser.
- [x] Add scoped CI matrix for Windows/macOS/Linux native Electron smoke checks and targeted trust tests, no release publishing.
- [x] Document OS trust sources, restart behavior, custom override and Linux CA package requirement.
- [x] Run relevant type checks, formatting, focused tests, review diff and commit; push feature branch to personal fork.

## Execution rulings

User approved design and requested implementation; execute inline without another approval checkpoint. Fresh dedicated clone provides isolation. npm requires legacy peer resolution for existing upstream peer conflict; install with ignored lifecycle scripts and explicitly fetch pinned Electron only. Do not change upstream dependency versions to resolve unrelated conflicts.

## Verification record

- Targeted MQTT/WSS trust tests: 13 passing under pinned Electron (loopback only).
- macOS trust policy tests: 12 passing; restricted key-usage case observed failing before correction.
- Native Electron smoke: 158 system certificates loaded; public ISRG root present.
- Backend TypeScript check passed; formatting and diff whitespace checks passed.
- Existing MqttSource ESLint baseline has six errors; unchanged error count after implementation. No unrelated fixes.
- Fresh reviewer identified scoped-grant widening; fixed and re-reviewed successfully.
- Windows/Linux native results require CI; packaged app signing and user UI validation remain distinct from backend verification.

Ruling: native macOS helper added after runtime probe proved Node's system enumeration incomplete. Build creates arm64/x86_64 universal helper targeting macOS12 (Electron39 floor); no compiler needed on user laptops. Use compatible Swift runtime features and omit legacy compatibility archives to support universal cross-compilation with current Apple toolchain.
