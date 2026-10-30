# Verification — 30 October 2026

- Eight domain tests pass: baseline conformance, registration interlocks, retired
  identity duplication, admin standard publication/impact, lifecycle prerequisites,
  immutable-ID revisions/audit, export and persistence recovery.
- JavaScript syntax checks pass for both application and domain modules.
- Browser verified: empty registration blocked; loaded example passes; capacity 900
  blocks registration; correcting to 100 creates EQ-UT-00145 at Registered.
- Operator lifecycle controls disabled. Admin standard editor tested with pump ceiling
  reduced from 500 to 80: preview identifies the four affected records after adding
  pump D; publishing v2 retains records and flags them for review in the registry.
- Final browser: removing the approved specification blocks registration; selecting
  SPEC-CWP160-D restores readiness. Admin commissioning with date, acceptance reference
  and reason moves the newly registered pump from Registered to Commissioned.
- Browser-local demo roles/state are not server authentication or shared persistence.
- Responsive rules are present; physical-device testing has not been performed.
