# System CA trust

Approved scope: fork current upstream under hiddemoens/MQTT-Explorer; use operating system CAs by default for MQTT TLS on Windows, macOS and Linux. Keep per-broker custom CA override and existing certificate/hostname validation. Report unavailable or empty system trust without silently using bundled roots. Restart app after operating system CA updates.

## Approaches

Chosen: load native system certificates through Node TLS API and pass explicitly to MQTT. This avoids external bundle downloads, Homebrew requirements and certificate importer size limits. Rejected: system plus bundled roots, which may retain roots excluded from system trust; manual bundle import, which stays a snapshot.

## Implementation boundaries

Apply trust selection to MQTT backend (MQTTS and secure WebSockets), leaving unrelated HTTP clients alone. A custom CA replaces system roots for that connection. Plain MQTT does not require system certificates. On macOS, package a universal Security.framework helper because Node 22 omits built-in public roots. Filter scoped grants and explicit denials without expanding usage/client/hostname restrictions. Use the native Node API on Windows/Linux. Read system certificates using the pinned Electron runtime; reject unsupported runtimes clearly. Node may cache certificates until process restart. Linux needs distribution ca-certificates installed and packaging must expose host trust files. OS trust membership does not guarantee all native certificate verification policies (for example revocation) are reproduced by Node TLS.

Verify targeted trust selection and local TLS behavior, then native Electron certificate availability on each OS through CI. Leave live UI testing to user. No changes to installed app.
