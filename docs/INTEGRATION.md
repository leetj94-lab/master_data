# Master-data ownership and integration

## Authoritative scope

This service concept owns equipment identity, classification, specifications,
approved location, lifecycle, governing standard and controlled change history.
It does not own quality measurements, live alarms, ETL run status or rendering geometry.

Initial equipment IDs are copied from the Digital Twin seed at GitHub commit
`502ebb94d3ae2d466793db56eeff466579168f7c`. Only canonical ID, name, model and sample
capacity text are reused. The standard-specific attributes are synthetic additions.

## Navigation

Accept `?assetId=<canonical ID>` and open that equipment. Existing mapped equipment
links to the deployed twin using `assetId` and `tab=Platform`. No user-supplied redirect
URL is followed. Future apps should use the same site ID `DEMO-PLANT-01` and retain
canonical IDs through renaming and retirement. Never use names as join keys.

## Snapshot contract v1

The Export action creates:

- `schemaVersion: "1.0.0"`, `source: "master_data"`, `siteId`, `synthetic: true`;
- `exportedAt` in UTC, published `standard` and `assets`;
- each asset has `id`, `assetClass`, `name`, `siteId`, `area`, specifications,
  `status`, `registeredStandard`, acceptance/retirement context and `conformance`.

This is a master snapshot, **not** the twin's asset-scoped bundle format.
The current twin supports context navigation, not importing this snapshot.
A future integration adapter must map master fields into the twin's asset projection,
keep geometry mapping outside the master, and prevent retired/review-required records
from silently appearing as valid new operating equipment. Existing historical model
references may remain visible with lifecycle/conformance labels.

## Future backend

Move the pure domain rules to server-side equivalents. Enforce unique canonical IDs
and normalized manufacturer/serial pairs with database constraints (including retired
rows), version standard revisions, and validate commands against the currently
published standard inside a transaction. Client validation stays for immediate feedback.
Use role-based authorization, record versions and durable audit events.

Publish asset/standard revision events only after successful persistence. Event fields
should include eventId, schemaVersion, assetId/siteId, recordVersion, occurredAt and
correlationId. Consumers deduplicate events and reject stale versions. Document-delivery
will own approved document releases; replace the local specification catalog through
an adapter. ETL consumes standardized identities and reports its own operational status
in the separate ETL application. None of those backend/event services are implemented here.
