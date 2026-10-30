# Main-branch release verification

Domain tests cover the four lifecycle states, registration management-spec interlocks,
expired identity duplication, admin management/maintenance revision and impact,
revalidation, activation acceptance prerequisites, terminal expiry, open-work blocking,
field-level audit and snapshot v2 persistence. Syntax checks apply to the frontend.

Root files are generated from dist/ with npm run build. .nojekyll and a root index
are included for main / (root) GitHub Pages. No separate Pages deployment job is used.

Frontend role selection and local storage are simulation features. Real server-side
permission enforcement, shared storage and automatic cross-app synchronization are
outside this release. Hosted and browser checks are recorded after publication.
