# revcat Command Reference

Complete reference for all 16 resources and their subcommands.

Global options: `--api-key <key>`, `--project <id>` (or `-p <id>`), `--compact` (single-line JSON; default pretty).

Pagination: every command shown below with `[--limit <n>]` also accepts `[--starting-after <cursor>]` and `[--all]`. `--all` auto-follows the API's `next_page` cursor (capped at 20 pages, stderr warning when truncated) and returns one merged `items` array with `pages_fetched` and `truncated`.

---

## projects

```bash
revcat projects list
```

No project ID required.

---

## apps

```bash
revcat apps list --project <id> [--limit <n>]
revcat apps get --project <id> --app <app_id>
revcat apps keys --project <id> --app <app_id>
```

---

## charts

Rate limit: **5 req/min**

```bash
revcat charts overview --project <id> [--currency <code>]
revcat charts data --project <id> --chart <name> [--start <date>] [--end <date>] [--resolution <r>] [--currency <code>] [--segment <s>] [--filters <json>] [--selectors <json>] [--unsafe-chart]
revcat charts options --project <id> --chart <name> [--unsafe-chart]
```

Chart names (validated against the RevenueCat v2 spec; an unknown `--chart` is rejected before any request with a JSON `did_you_mean` suggestion, e.g. `mmr` suggests `mrr`): `actives`, `actives_movement`, `actives_new`, `arr`, `churn`, `cohort_explorer`, `conversion_to_paying`, `customers_new`, `initial_conversion`, `ltv_per_customer`, `ltv_per_paying_customer`, `mrr`, `mrr_movement`, `prediction_explorer`, `refund_rate`, `revenue`, `subscription_retention`, `subscription_status`, `trials`, `trials_movement`, `trials_new`, `customers_active`, `trial_conversion_rate`, `non-subscription_purchases`

Pass `--unsafe-chart` to skip validation and send the value as-is.

Resolutions: `day`, `week`, `month`, `quarter`, `year`

Dates: ISO 8601 format (e.g., `2025-01-01`)

---

## customers

```bash
revcat customers list --project <id> [--limit <n>] [--starting-after <cursor>]
revcat customers get --project <id> --customer <customer_id>
revcat customers entitlements --project <id> --customer <customer_id>
revcat customers aliases --project <id> --customer <customer_id>
revcat customers attributes --project <id> --customer <customer_id>
revcat customers set-attributes --project <id> --customer <customer_id> --data '<json>'
revcat customers purchases --project <id> --customer <customer_id> [--limit <n>]
revcat customers subscriptions --project <id> --customer <customer_id> [--limit <n>]
revcat customers vc-balances --project <id> --customer <customer_id>
revcat customers assign-offering --project <id> --customer <customer_id> [--offering <offering_id>]
```

`set-attributes` data format: `'{"key": {"value": "val"}, "key2": {"value": "val2"}}'`

`assign-offering` without `--offering` clears the override.

---

## entitlements

```bash
revcat entitlements list --project <id> [--limit <n>]
revcat entitlements get --project <id> --entitlement <entitlement_id>
revcat entitlements products --project <id> --entitlement <entitlement_id>
revcat entitlements create --project <id> --lookup-key <key> --display-name <name>
revcat entitlements update --project <id> --entitlement <entitlement_id> [--display-name <name>]
revcat entitlements attach-products --project <id> --entitlement <entitlement_id> --product-ids <id1,id2,...>
revcat entitlements detach-products --project <id> --entitlement <entitlement_id> --product-ids <id1,id2,...>
```

---

## offerings

```bash
revcat offerings list --project <id> [--limit <n>] [--expand <fields>]
revcat offerings get --project <id> --offering <offering_id>
revcat offerings create --project <id> --lookup-key <key> --display-name <name> [--is-current] [--metadata <json>]
revcat offerings update --project <id> --offering <offering_id> [--display-name <name>] [--is-current] [--metadata <json>]
```

---

## packages

```bash
revcat packages list --project <id> --offering <offering_id> [--limit <n>]
revcat packages get --project <id> --package <package_id>
revcat packages products --project <id> --package <package_id>
revcat packages create --project <id> --offering <offering_id> --lookup-key <key> --display-name <name> [--position <n>]
revcat packages update --project <id> --package <package_id> [--display-name <name>] [--position <n>]
revcat packages attach-products --project <id> --package <package_id> --products '<json_array>'
revcat packages detach-products --project <id> --package <package_id> --product-ids <id1,id2,...>
```

`attach-products` format: `'[{"product_id": "prod_abc"}, {"product_id": "prod_xyz"}]'`

---

## products (read-only)

```bash
revcat products list --project <id> [--limit <n>] [--app-id <app_id>]
revcat products get --project <id> --product <product_id>
```

---

## subscriptions (read-only)

```bash
revcat subscriptions search --project <id> [--store-identifier <id>] [--limit <n>]
revcat subscriptions get --project <id> --subscription <subscription_id>
revcat subscriptions entitlements --project <id> --subscription <subscription_id>
revcat subscriptions transactions --project <id> --subscription <subscription_id> [--limit <n>]
revcat subscriptions management-url --project <id> --subscription <subscription_id>
```

---

## purchases (read-only)

```bash
revcat purchases search --project <id> [--store-identifier <id>] [--limit <n>]
revcat purchases get --project <id> --purchase <purchase_id>
revcat purchases entitlements --project <id> --purchase <purchase_id>
```

---

## invoices (read-only)

```bash
revcat invoices list --project <id> --customer <customer_id> [--limit <n>]
revcat invoices get --project <id> --customer <customer_id> --invoice <invoice_id>
```

---

## audit-logs (read-only)

```bash
revcat audit-logs list --project <id> [--limit <n>] [--starting-after <cursor>]
```

---

## collaborators (read-only)

```bash
revcat collaborators list --project <id> [--limit <n>]
```

---

## virtual-currencies (read-only)

```bash
revcat virtual-currencies list --project <id> [--limit <n>]
revcat virtual-currencies get --project <id> --code <currency_code>
```

---

## webhooks

```bash
revcat webhooks list --project <id> [--limit <n>]
revcat webhooks get --project <id> --webhook <webhook_id>
revcat webhooks create --project <id> --url <url> [--name <name>] [--auth-header <header>] [--environment <env>]
revcat webhooks update --project <id> --webhook <webhook_id> [--url <url>] [--name <name>] [--auth-header <header>] [--environment <env>]
```

Environment options: `production`, `sandbox`, `all`

---

## paywalls

```bash
revcat paywalls list --project <id> [--limit <n>] [--expand <fields>]
revcat paywalls get --project <id> --paywall <paywall_id>
revcat paywalls create --project <id> --offering <offering_id> [--name <name>]
```
