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

## Snapshot contract v2

The Export action creates:

- `schemaVersion: "2.0.0"`, `source: "master_data"`, `siteId`, `synthetic: true`;
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

## Current Pages deployment and lifecycle

Master: https://leetj94-lab.github.io/master_data/
Twin: https://leetj94-lab.github.io/digital_twin/

Lifecycle vocabulary is set-up, active, inactive and expired. It is a breaking
semantic change from the earlier v1 sample, so master snapshots use version 2.0.0.
Preserve canonical asset IDs. Prescribed management and maintenance profiles are
part of master governance, not a source of measured quality/ETL telemetry.
An adapter must map lifecycle explicitly; expired must never be inferred as active.

## Drawing navigation

Initial mapped equipment can open https://leetj94-lab.github.io/engineering_drawing/
with the same assetId. The drawing demo contains released P&ID, arrangement and
single-line relationships for the original eight equipment identities. New local
registrations do not automatically create drawing relationships or synchronize apps.

## Document handover available

The document_delivery demo at https://leetj94-lab.github.io/document_delivery/
accepts the same canonical assetId. It owns dossier submissions, structured document
checks, review/acceptance and release manifests. Links preserve equipment context;
browser-local decisions are not automatically synchronized across applications.
For equipment without a seeded dossier, create a package from the shared master list.

## ETL operations available

The etl_monitoring demo at https://leetj94-lab.github.io/etl_monitoring/
preserves assetId context and supports pipelineId/runId deep links. It processes
pinned synthetic master, observation, drawing and accepted-handover inputs, with
quarantine/retry/checkpoint evidence. It does not redefine equipment standards,
release drawings, accept handovers or synchronize browser-local edits across sites.
