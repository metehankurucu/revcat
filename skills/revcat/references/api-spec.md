# RevenueCat API v2 OpenAPI spec — pointer

The full ~500 KB OpenAPI spec is **not duplicated here**. The single canonical
copy lives at the repository root:

    api-spec.yaml

Refresh it from RevenueCat's published spec:

    https://www.revenuecat.com/docs/redocusaurus/openapi-v2.yaml

The canonical `--chart` name list used by `revcat charts data`/`charts options`
is derived from this spec's `chart_name` enum and pinned by
`tests/charts/chart-names.test.ts`, so a refresh that changes the chart set will
fail that test until `src/types/charts.ts` (`CHART_NAMES`) is updated to match.
