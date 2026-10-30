# Asset Standard — equipment lifecycle & standards

**Live GitHub Pages:** https://leetj94-lab.github.io/master_data/

Functional frontend concept with synthetic data and browser-local persistence.
No employer data or live telemetry is included. Demo roles are not authentication.

## Lifecycle

| State | Meaning | Allowed next state |
| --- | --- | --- |
| `set-up` | Registration, installation and acceptance preparation | `active`, or `expired` if cancelled |
| `active` | Equipment approved for use | `inactive` |
| `inactive` | Temporarily stopped, under maintenance or held in reserve | `active`, `expired` |
| `expired` | Permanently withdrawn / life ended; identity retained | None |

Activation requires current-standard conformance, a valid commissioning date,
an acceptance reference and Admin approval. Expiry requires a reason and no open
linked work. IDs and history are never reused or deleted by the demo workflow.

## Governed equipment information

- Identity: shared equipment ID, classification, model, manufacturer and serial.
- Ownership: responsible organization, cost center and functional location.
- Management specifications: rated capacity/unit, rated power, supply voltage,
  design pressure, connection DN, construction material and design life.
- Lifecycle dates: installation, commissioning and warranty; acceptance evidence.
- Maintenance: strategy, inspection interval, planned service cycle, management
  criterion / unit, prescribed checklist and activation acceptance criteria.

The applicable `STD-UT/CH/AH/TK-001` standard and its revision appear in the equipment
directory and details. Limits shown are **prescribed management criteria**, not live
measurements. ETL execution and quality monitoring belong in separate applications.

## Standards management

Standards library has class-specific approved profiles. Operator can read them;
the demo Admin can revise a management limit, inspection interval, planned-service
cycle, checklist, pump capacity ceiling and specification-reference requirement.
Publication records a revision and reason, previews affected equipment, and requires
revalidation of affected existing records. Revalidating preserves their canonical IDs.
The base identity/unit/location dictionaries are fixed for this sample.

Registration checks required attributes, approved classification/location/material/
voltage/unit codes, numeric design ranges, approved specification references and
manufacturer + serial uniqueness, including expired records. Checks run in both
UI feedback and the registration action.

## Main-branch Pages publishing

Pages settings: **Deploy from a branch → main → /(root)**.
Root `index.html`, `app.js`, `domain.js`, `seed.js`, `style.css` and `.nojekyll` are
committed ready to serve. No ChatGPT hosting is required. Source lives in `dist/`.

```sh
npm test
npm run build
```

Run `npm run build` after editing `dist/`; commit the updated source **and** root
publication files to main. The repository workflow validates tests and checks that
root output matches the source; GitHub's branch Pages workflow handles deployment.
It deliberately does not perform a second competing Actions-based deployment.

Local preview: `python3 -m http.server 8000` then http://localhost:8000 .

## Try it

1. Register equipment → Load conforming example. An invalid capacity, missing
   approved specification or invalid management field blocks registration.
2. Correct the fields and register: the generated identity starts at `set-up`.
3. Select Demo role → Admin, reopen the equipment, and approve activation with evidence.
4. Standards library → choose equipment class → revise inspection/service/limit values
   → provide publication reason → review impact → publish.
5. Inspect flagged equipment, revise/revalidate with a reason, then review change history.
6. About → Reset restores initial synthetic data.

Snapshot contract is now **v2** because lifecycle semantics changed. The v2 storage
namespace intentionally starts a fresh synthetic demo, leaving old local v1 data alone.
Cross-site links preserve the same IDs between this app and Digital Twin. Local edits
are not synchronized across apps; no shared backend or twin import is claimed.

For production, enforce validation, authorization, uniqueness, concurrency and audit
on the server/database. This demo stores all changes in the visitor's browser.

MIT for original code.
