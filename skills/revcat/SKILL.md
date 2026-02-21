---
name: revcat
description: RevenueCat CLI tool for subscription analytics, MRR tracking, customer management, and offering configuration. Use when analyzing app revenue, checking subscriber status, managing offerings/packages/entitlements, querying chart data, setting up webhooks, or any RevenueCat API interaction via CLI. Triggers on "revcat", "RevenueCat", "MRR", "subscription analytics", "revenue metrics", "offerings", "entitlements", "paywalls", or when the user wants to interact with RevenueCat data.
---

# revcat CLI

CLI wrapping RevenueCat API v2. All output is JSON. Requires `REVENUECAT_API_KEY` env var (v2 secret key from RevenueCat Dashboard > Project Settings > API Keys).

Install: `bun install -g @metehankurucu/revcat`

## Setup

```bash
export REVENUECAT_API_KEY=sk_your_key
export REVENUECAT_PROJECT_ID=proj_your_id  # optional default
```

Find project ID: `revcat projects list`

## Command Pattern

```
revcat <resource> <action> --project <id> [options]
```

All commands require `--project` (or `REVENUECAT_PROJECT_ID` env var) except `projects list`.

## Core Workflows

### Revenue Analysis

```bash
# Overview: MRR, revenue, active subs, trials, new customers
revcat charts overview --project proj123

# MRR trend (monthly)
revcat charts data --project proj123 --chart mrr --start 2025-01-01 --end 2025-12-31 --resolution month

# Churn rate (weekly)
revcat charts data --project proj123 --chart churn --start 2026-01-01 --end 2026-02-21 --resolution week

# Available chart names: actives, arr, churn, mrr, mrr_movement, revenue, trials,
# subscription_retention, initial_conversion, trial_conversion, realized_ltv_per_customer,
# realized_ltv_per_paying_customer, refund_rate, new, store_top_products, store_top_countries,
# non_subscription_revenue, non_subscription_transactions

# Discover chart options (resolutions, segments, filters)
revcat charts options --project proj123 --chart revenue
```

### Customer Investigation

```bash
revcat customers get --project proj123 --customer cust_abc
revcat customers entitlements --project proj123 --customer cust_abc
revcat customers subscriptions --project proj123 --customer cust_abc
revcat customers purchases --project proj123 --customer cust_abc
revcat customers attributes --project proj123 --customer cust_abc

# Tag for segmentation
revcat customers set-attributes --project proj123 --customer cust_abc \
  --data '{"segment": {"value": "power_user"}}'

# A/B test: assign specific offering
revcat customers assign-offering --project proj123 --customer cust_abc --offering ofrng_xyz
```

### Offering Management

```bash
revcat offerings list --project proj123
revcat offerings create --project proj123 --lookup-key premium-v2 --display-name "Premium V2"
revcat offerings update --project proj123 --offering ofrng_abc --display-name "Updated Name" --is-current

# Packages within offerings
revcat packages create --project proj123 --offering ofrng_abc --lookup-key monthly --display-name "Monthly"
revcat packages attach-products --project proj123 --package pkg_abc --products '[{"product_id":"prod_xyz"}]'
revcat packages detach-products --project proj123 --package pkg_abc --product-ids prod_xyz
```

### Entitlement Management

```bash
revcat entitlements list --project proj123
revcat entitlements create --project proj123 --lookup-key premium --display-name "Premium Access"
revcat entitlements attach-products --project proj123 --entitlement entl_abc --product-ids prod_1,prod_2
```

### Subscription Lookup

```bash
revcat subscriptions search --project proj123 --store-identifier "450001234567890"
revcat subscriptions get --project proj123 --subscription sub_abc
revcat subscriptions entitlements --project proj123 --subscription sub_abc
revcat subscriptions transactions --project proj123 --subscription sub_abc
```

### Webhook Setup

```bash
revcat webhooks create --project proj123 --url "https://api.myapp.com/webhook" --name "Prod" --environment production
revcat webhooks update --project proj123 --webhook wh_abc --url "https://new-url.com/hook"
```

## Available Resources

| Resource | Actions | Notes |
|----------|---------|-------|
| `projects` | list | |
| `apps` | list, get, keys | |
| `charts` | overview, data, options | 5 req/min rate limit |
| `customers` | list, get, entitlements, aliases, attributes, set-attributes, purchases, subscriptions, vc-balances, assign-offering | |
| `entitlements` | list, get, products, create, update, attach-products, detach-products | |
| `offerings` | list, get, create, update | |
| `packages` | list, get, products, create, update, attach-products, detach-products | |
| `products` | list, get | read-only |
| `subscriptions` | search, get, entitlements, transactions, management-url | read-only |
| `purchases` | search, get, entitlements | read-only |
| `invoices` | list, get | read-only |
| `audit-logs` | list | read-only |
| `collaborators` | list | read-only |
| `virtual-currencies` | list, get | read-only |
| `webhooks` | list, get, create, update | |
| `paywalls` | list, get, create | |

For full command details with all options, see [references/commands.md](references/commands.md).

## Rate Limits

| Domain | Limit | Commands |
|--------|-------|----------|
| `charts_metrics` | 5/min | charts |
| `customer_information` | 480/min | customers, subscriptions, purchases |
| `project_configuration` | 60/min | everything else |

Requests auto-wait when rate limited.

## Safety

Strict allowlist — only permitted operations execute. **Blocked**: all DELETE, refunds, grant/revoke entitlements, customer deletion/transfer, subscription cancellation, app/project creation/deletion, product store creation, virtual currency transactions.

## API Specification

Full RevenueCat API v2 OpenAPI spec: see [references/api-spec.yaml](references/api-spec.yaml).
