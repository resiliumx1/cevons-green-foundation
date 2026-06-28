Remove the "Other Services" section from the /services page by deleting the `<OtherServicesSection />` invocation and its related dead code.

Technical details:
- Remove the `{/* OTHER SERVICES */} <OtherServicesSection />` call at line 650 of `src/routes/services.tsx`.
- Remove the `OtherServicesSection` function (lines 268-336) and the `otherServiceKeys` array (lines 260-266) since they will no longer be used.
- Remove unused imports that become obsolete after removing the section: `PaintRoller`, `AlertTriangle`, and `Wrench` (confirm `Wrench` is not used elsewhere in the file).
- Run the typecheck (`bunx tsgo --noEmit`) to verify no regressions.

This change only affects the presentation of the `/services` page and does not touch backend, data, or other routes.