# revcat

RevenueCat CLI for AI agents — subscription analytics, MRR tracking, and configuration management.

Built on the [RevenueCat API v2](https://www.revenuecat.com/docs/api-v2). Outputs JSON for easy consumption by AI agents and scripts.

## Installation

```bash
# Install globally
bun install -g @metehankurucu/revcat

# Or run directly
bunx @metehankurucu/revcat --help
```

## AI Agent Skill

Install the revcat skill to teach your AI agent how to use the CLI:

```bash
npx skills add metehankurucu/revcat
```

Once installed, your AI agent will know all revcat commands, workflows, and best practices for RevenueCat analytics and management.

## Getting Your API Key

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project
3. Navigate to **Project Settings** (gear icon) → **API Keys**
4. Under **Secret API keys (v2)**, click **Generate new secret key**
5. Copy the key (starts with `sk_`)

> **Note**: API keys are **project-scoped**. Each key only accesses one project. To work with multiple projects, create a key for each.

## Configuration

API key (required) — in order of priority:

```bash
# 1. CLI flag
revcat projects list --api-key sk_your_key

# 2. Environment variable (recommended)
export REVENUECAT_API_KEY=sk_your_key
revcat projects list

# 3. Config file (~/.config/revcat/config.json)
echo '{"apiKey": "sk_your_key"}' > ~/.config/revcat/config.json
```

Project ID (required for most commands):

```bash
# CLI flag
revcat charts overview --project proj96d8f365

# Or environment variable
export REVENUECAT_PROJECT_ID=proj96d8f365
revcat charts overview
```

## Quick Start

```bash
# Set your API key
export REVENUECAT_API_KEY=sk_your_key

# List your projects (find your project ID)
revcat projects list

# Get overview metrics (MRR, revenue, active subs)
revcat charts overview --project proj96d8f365

# List customers
revcat customers list --project proj96d8f365 --limit 10

# Fetch every page in one call (auto-follows next_page, merged into one items array)
revcat customers list --project proj96d8f365 --all | jq '.items | length'

# Single-line JSON for compact logs/pipelines
revcat offerings list --project proj96d8f365 --compact

# List products
revcat products list --project proj96d8f365
```

## Command Reference

Command pattern: `revcat <resource> <action> [options]`

**Global options** (any command): `--api-key <key>`, `--compact` (single-line JSON; default is pretty-printed).

**Pagination:** every command below that accepts `--limit` also accepts `--starting-after <cursor>` and `--all`. `--all` auto-follows the API's `next_page` cursor (hard-capped at 20 pages, with a stderr warning when the cap truncates) and prints one merged `items` array plus `pages_fetched` and `truncated` metadata. The rows list `--limit` only, to keep them readable.

### projects

| Command | Description |
|---------|-------------|
| `projects list` | List all projects |

### apps

| Command | Options | Description |
|---------|---------|-------------|
| `apps list` | `--limit <n>` | List all apps |
| `apps get` | `--app <id>` (required) | Get an app |
| `apps keys` | `--app <id>` (required) | List public API keys |

### charts

Rate limit: **5 req/min**

| Command | Options | Description |
|---------|---------|-------------|
| `charts overview` | `--currency <code>` | Get overview metrics (MRR, revenue, active subs, trials) |
| `charts data` | `--chart <name>` (required), `--start <date>`, `--end <date>`, `--resolution <r>`, `--currency <code>`, `--segment <s>`, `--filters <json>`, `--selectors <json>`, `--unsafe-chart` | Get chart data |
| `charts options` | `--chart <name>` (required), `--unsafe-chart` | Get available options for a chart |

Available chart names (validated against the RevenueCat v2 spec): `actives`, `actives_movement`, `actives_new`, `arr`, `churn`, `cohort_explorer`, `conversion_to_paying`, `customers_new`, `initial_conversion`, `ltv_per_customer`, `ltv_per_paying_customer`, `mrr`, `mrr_movement`, `prediction_explorer`, `refund_rate`, `revenue`, `subscription_retention`, `subscription_status`, `trials`, `trials_movement`, `trials_new`, `customers_active`, `trial_conversion_rate`, `non-subscription_purchases`

An unknown `--chart` is rejected before any request with a JSON `did_you_mean` suggestion (e.g. `mmr` suggests `mrr`). Pass `--unsafe-chart` to skip validation and send the value as-is (useful for a newly released chart).

### customers

| Command | Options | Description |
|---------|---------|-------------|
| `customers list` | `--limit <n>`, `--starting-after <id>`, `--all` | List customers |
| `customers get` | `--customer <id>` (required) | Get a customer |
| `customers entitlements` | `--customer <id>` (required) | List active entitlements |
| `customers aliases` | `--customer <id>` (required) | List aliases |
| `customers attributes` | `--customer <id>` (required) | List attributes |
| `customers set-attributes` | `--customer <id>` (required), `--data <json>` (required) | Set attributes |
| `customers purchases` | `--customer <id>` (required), `--limit <n>` | List purchases |
| `customers subscriptions` | `--customer <id>` (required), `--limit <n>` | List subscriptions |
| `customers vc-balances` | `--customer <id>` (required) | List virtual currency balances |
| `customers assign-offering` | `--customer <id>` (required), `--offering <id>` | Assign/clear offering override |

### entitlements

| Command | Options | Description |
|---------|---------|-------------|
| `entitlements list` | `--limit <n>` | List entitlements |
| `entitlements get` | `--entitlement <id>` (required) | Get an entitlement |
| `entitlements products` | `--entitlement <id>` (required) | List attached products |
| `entitlements create` | `--lookup-key <key>` (required), `--display-name <name>` (required) | Create entitlement |
| `entitlements update` | `--entitlement <id>` (required), `--display-name <name>` | Update entitlement |
| `entitlements attach-products` | `--entitlement <id>` (required), `--product-ids <ids>` (required) | Attach products |
| `entitlements detach-products` | `--entitlement <id>` (required), `--product-ids <ids>` (required) | Detach products |

### offerings

| Command | Options | Description |
|---------|---------|-------------|
| `offerings list` | `--limit <n>`, `--expand <fields>` | List offerings |
| `offerings get` | `--offering <id>` (required) | Get an offering |
| `offerings create` | `--lookup-key <key>` (required), `--display-name <name>` (required), `--is-current`, `--metadata <json>` | Create offering |
| `offerings update` | `--offering <id>` (required), `--display-name <name>`, `--is-current`, `--metadata <json>` | Update offering |

### packages

| Command | Options | Description |
|---------|---------|-------------|
| `packages list` | `--offering <id>` (required), `--limit <n>` | List packages in offering |
| `packages get` | `--package <id>` (required) | Get a package |
| `packages products` | `--package <id>` (required) | List products in package |
| `packages create` | `--offering <id>` (required), `--lookup-key <key>` (required), `--display-name <name>` (required), `--position <n>` | Create package |
| `packages update` | `--package <id>` (required), `--display-name <name>`, `--position <n>` | Update package |
| `packages attach-products` | `--package <id>` (required), `--products <json>` (required) | Attach products |
| `packages detach-products` | `--package <id>` (required), `--product-ids <ids>` (required) | Detach products |

### products (read-only)

| Command | Options | Description |
|---------|---------|-------------|
| `products list` | `--limit <n>`, `--app-id <id>` | List products |
| `products get` | `--product <id>` (required) | Get a product |

### subscriptions (read-only)

| Command | Options | Description |
|---------|---------|-------------|
| `subscriptions search` | `--store-identifier <id>`, `--limit <n>` | Search subscriptions |
| `subscriptions get` | `--subscription <id>` (required) | Get a subscription |
| `subscriptions entitlements` | `--subscription <id>` (required) | List entitlements |
| `subscriptions transactions` | `--subscription <id>` (required), `--limit <n>` | List transactions |
| `subscriptions management-url` | `--subscription <id>` (required) | Get management URL |

### purchases (read-only)

| Command | Options | Description |
|---------|---------|-------------|
| `purchases search` | `--store-identifier <id>`, `--limit <n>` | Search purchases |
| `purchases get` | `--purchase <id>` (required) | Get a purchase |
| `purchases entitlements` | `--purchase <id>` (required) | List entitlements |

### invoices (read-only)

| Command | Options | Description |
|---------|---------|-------------|
| `invoices list` | `--customer <id>` (required), `--limit <n>` | List invoices |
| `invoices get` | `--customer <id>` (required), `--invoice <id>` (required) | Get invoice file |

### audit-logs (read-only)

| Command | Options | Description |
|---------|---------|-------------|
| `audit-logs list` | `--limit <n>`, `--starting-after <id>`, `--all` | List audit logs |

### collaborators (read-only)

| Command | Options | Description |
|---------|---------|-------------|
| `collaborators list` | `--limit <n>` | List collaborators |

### virtual-currencies (read-only)

| Command | Options | Description |
|---------|---------|-------------|
| `virtual-currencies list` | `--limit <n>` | List virtual currencies |
| `virtual-currencies get` | `--code <code>` (required) | Get a virtual currency |

### webhooks

| Command | Options | Description |
|---------|---------|-------------|
| `webhooks list` | `--limit <n>` | List webhook integrations |
| `webhooks get` | `--webhook <id>` (required) | Get a webhook |
| `webhooks create` | `--url <url>` (required), `--name <name>`, `--auth-header <header>`, `--environment <env>` | Create webhook |
| `webhooks update` | `--webhook <id>` (required), `--url <url>`, `--name <name>`, `--auth-header <header>`, `--environment <env>` | Update webhook |

### paywalls

| Command | Options | Description |
|---------|---------|-------------|
| `paywalls list` | `--limit <n>`, `--expand <fields>` | List paywalls |
| `paywalls get` | `--paywall <id>` (required) | Get a paywall |
| `paywalls create` | `--offering <id>` (required), `--name <name>` | Create paywall |

## Example Scenarios

### Revenue Analysis

```bash
# Get MRR, revenue, active subscribers at a glance
revcat charts overview --project proj96d8f365

# Get MRR trend over the last quarter
revcat charts data --project proj96d8f365 --chart mrr \
  --start 2025-11-01 --end 2026-02-01 --resolution month

# Analyze churn rate weekly
revcat charts data --project proj96d8f365 --chart churn \
  --start 2026-01-01 --end 2026-02-21 --resolution week

# Check what chart options are available
revcat charts options --project proj96d8f365 --chart revenue
```

### Customer Investigation

```bash
# Find a customer
revcat customers get --project proj96d8f365 --customer user_abc123

# Check their active entitlements
revcat customers entitlements --project proj96d8f365 --customer user_abc123

# View their subscription history
revcat customers subscriptions --project proj96d8f365 --customer user_abc123

# View their purchase history
revcat customers purchases --project proj96d8f365 --customer user_abc123

# Tag a customer for segmentation
revcat customers set-attributes --project proj96d8f365 --customer user_abc123 \
  --data '{"segment": {"value": "power_user"}, "cohort": {"value": "2025-Q4"}}'
```

### Offering & Package Management

```bash
# List current offerings
revcat offerings list --project proj96d8f365

# Create a new offering for A/B testing
revcat offerings create --project proj96d8f365 \
  --lookup-key "premium-v2" --display-name "Premium V2"

# Create a package inside the offering
revcat packages create --project proj96d8f365 \
  --offering ofrng42fb632ca5 --lookup-key monthly --display-name "Monthly"

# Attach products to the package
revcat packages attach-products --project proj96d8f365 \
  --package pkg_abc --products '[{"product_id": "prod992f65f907"}]'

# Assign a specific offering to a customer (for testing)
revcat customers assign-offering --project proj96d8f365 \
  --customer user_abc123 --offering ofrng42fb632ca5
```

### Webhook Setup

```bash
# List existing webhooks
revcat webhooks list --project proj96d8f365

# Create a new webhook
revcat webhooks create --project proj96d8f365 \
  --url "https://api.myapp.com/revenuecat-webhook" \
  --name "Production Webhook" \
  --environment production

# Update webhook URL
revcat webhooks update --project proj96d8f365 \
  --webhook wh_abc --url "https://api.myapp.com/v2/webhook"
```

### Subscription Lookup

```bash
# Search by store transaction ID
revcat subscriptions search --project proj96d8f365 \
  --store-identifier "450001234567890"

# Get subscription details
revcat subscriptions get --project proj96d8f365 --subscription sub_abc

# Check subscription's entitlements
revcat subscriptions entitlements --project proj96d8f365 --subscription sub_abc

# View transaction history
revcat subscriptions transactions --project proj96d8f365 --subscription sub_abc
```

## Security

revcat uses a **strict allowlist** — only explicitly permitted operations can execute. Any operation not in the allowlist is rejected with a `BlockedOperationError`.

**Blocked operations** (cannot be executed):
- All DELETE operations (apps, customers, entitlements, offerings, packages, products, webhooks, paywalls)
- Refunds (purchases, subscriptions, Play Store transactions)
- Grant/revoke entitlements
- Customer transfer & deletion
- Subscription cancellation
- App/project creation & deletion
- Product creation in stores (pushing to Apple/Google)
- Virtual currency transactions & balance updates

## Rate Limiting

Built-in token-bucket rate limiter per API domain:

| Domain | Limit | Used By |
|--------|-------|---------|
| `charts_metrics` | 5 req/min | `charts` commands |
| `customer_information` | 480 req/min | `customers`, `subscriptions`, `purchases` commands |
| `project_configuration` | 60 req/min | `projects`, `apps`, `offerings`, `packages`, `entitlements`, `products`, `webhooks`, `paywalls` commands |

Two layers keep you under the limits:

1. **Proactive:** a per-domain token bucket paces outgoing requests and self-corrects its
   remaining budget from the `RevenueCat-Rate-Limit-*` response headers.
2. **Reactive:** if the API still returns `429` (or a retryable `5xx`), the client retries
   automatically up to 2 times, waiting for the body's `backoff_ms`, then the `Retry-After`
   header, then a capped exponential backoff. Each wait is announced on **stderr** as a JSON
   line, e.g. `{"retry":{"attempt":1,"max_retries":2,"delay_ms":1000,"status":429,...}}`.

If the retries are exhausted, the final error is emitted as the standard JSON envelope with
`"retryable": true` so a caller can decide whether to try again later.

## Development

```bash
# Install dependencies
bun install

# Run tests (299 tests, 1106 assertions)
bun test

# Type check
bunx tsc --noEmit

# Run CLI locally
bun run bin/revcat.ts --help
```

## Disclaimer

This project is **not affiliated with, endorsed by, or associated with RevenueCat, Inc.** in any way. It is an independent, unofficial open-source tool that interacts with the publicly available [RevenueCat API v2](https://www.revenuecat.com/docs/api-v2). "RevenueCat" is a trademark of RevenueCat, Inc. Use of this tool requires your own RevenueCat API key and is subject to RevenueCat's [Terms of Service](https://www.revenuecat.com/terms).

## License

MIT
