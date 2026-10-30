# Asset Standard

A functional equipment lifecycle and standards-governance concept. It demonstrates
how governed definitions prevent nonconforming equipment records from entering a
registry, and how those identities remain traceable throughout their lifecycle.

**Interactive concept · Synthetic data · Browser-local state.** No employer data,
source code, layouts or engineering documents are included.

## Try the workflows

1. **Register equipment:** the empty form is blocked. Load a conforming example,
   change capacity to 900 m³/h and see the range interlock. Restore 100 to register.
2. The generated identity is `EQ-UT-00145`; the lifecycle starts at Registered.
3. Close the drawer, select **Demo role → Admin**, reopen the equipment, provide
   a commissioning date, acceptance reference and approval reason. Approve
   commissioning, operation, suspension and retirement in the permitted order.
4. **Standards library:** Operator has read-only access. Admin can change the pump
   capacity limit and specification-reference requirement, preview affected records,
   provide a publication reason and publish a new effective revision.
5. Existing equipment is retained. Records outside the new standard become
   **Review required**; commissioning/operation is blocked until corrected.
6. **Revise master data:** make permitted attribute changes with a reason. The
   canonical identity stays fixed and field changes are recorded in history.
7. **Change history:** inspect registration, standard changes and lifecycle approvals.
8. **About → Reset synthetic data** restores the original fixture.

## Interlocks

- Approved equipment classification, site/location combinations and standard units.
- Mandatory equipment name, manufacturer, model, serial, capacity and criticality.
- Approved specification reference when required; unknown references are blocked.
- Classification-specific numeric capacity ranges; pump ceiling is version controlled.
- Manufacturer + serial uniqueness, case-insensitive, including retired records.
- Generated immutable canonical IDs; a retired ID is never reassigned.
- Admin-only standard publication and lifecycle approval within the demo domain.
- No lifecycle skipping. Commissioning requires a valid date and acceptance reference.
- Retirement requires suspension, a reason and zero open linked work requests.
- Retired records cannot be edited. Suspending an asset remains possible when its
  master data needs review; commissioning and operation require current conformance.

The approved specification catalog is a synthetic fixture, not live delivery-system
approval. Class/unit/location dictionaries are fixed in this sample. The admin editor
versions two representative rules; it does not claim a generic no-code rules engine.

## Run and test

No build step or dependencies are required. Node.js 22+ is recommended for tests.

```sh
npm test
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 . Serve `dist/` through HTTP; ES modules do not work normally
from `file://`. Authored frontend source is intentionally tracked inside `dist/`.
The Pages workflow tests the domain and deploys this directory. Set repository
**Settings → Pages → Source: GitHub Actions** before using Pages deployment.

## Architecture and limits

- `dist/domain.js`: pure validation and state-transition functions; both disabled UI
  controls and action-time domain checks apply. Tests invoke these functions directly.
- `dist/app.js`: registry, forms, administrator controls, details and history.
- `dist/seed.js`: minimal shared equipment identities from the Digital Twin fixture.
- Browser localStorage: persisted records, standards, revision and event history.
- No telemetry monitoring, ETL execution or data-pipeline dashboard.

Roles are a deliberate demo switch, **not authentication or a security boundary**.
Domain checks execute in the client; users can modify browser state. A production
service must repeat validation and authorization server-side, enforce database
constraints, use transactions/optimistic concurrency, and store audit history durably.

## Integration

The original eight asset IDs match `leetj94-lab/digital_twin`. Deep links accept
`?assetId=EQ-UT-00142`; a mapped asset links to the twin's same asset context. New
registrations explicitly have no 3D node until mapped. Export produces a versioned
master snapshot with conformance and lifecycle. See [integration](docs/INTEGRATION.md).
No cross-site automatic synchronization or twin import is claimed in this release.

MIT for original application code.
