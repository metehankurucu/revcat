import type {
  PaginatedList,
  MonetaryAmount,
  Environment,
  Ownership,
  Store,
} from "./common.ts";

// ─── Customer ───

export interface Customer {
  object: "customer";
  id: string;
  project_id: string;
  first_seen_at: number;
  last_seen_at: number | null;
  last_seen_app_version: string | null;
  last_seen_country: string | null;
  last_seen_platform: string | null;
  last_seen_platform_version: string | null;
  active_entitlements?: PaginatedList<CustomerActiveEntitlement> | null;
  experiment?: ExperimentEnrollment | null;
  attributes?: PaginatedList<CustomerAttribute> | null;
}

export interface CustomerActiveEntitlement {
  object: "customer.active_entitlement";
  entitlement_id: string;
  lookup_key: string;
}

export interface CustomerAttribute {
  object: "customer.attribute";
  key: string;
  value: string;
  updated_at: number;
}

export interface ExperimentEnrollment {
  id: string;
  variant: string;
}

// ─── Subscription ───

export interface Subscription {
  object: "subscription";
  id: string;
  customer_id: string;
  original_customer_id: string;
  product_id: string | null;
  starts_at: number;
  current_period_starts_at: number;
  current_period_ends_at: number | null;
  ends_at: number | null;
  gives_access: boolean;
  pending_payment: boolean;
  auto_renewal_status:
    | "will_renew"
    | "will_not_renew"
    | "will_change_product"
    | "will_pause"
    | "requires_price_increase_consent"
    | "has_already_renewed";
  status:
    | "trialing"
    | "active"
    | "expired"
    | "in_grace_period"
    | "in_billing_retry"
    | "paused"
    | "unknown"
    | "incomplete";
  total_revenue_in_usd: MonetaryAmount;
  presented_offering_id: string | null;
  entitlements: PaginatedList<SubscriptionEntitlement>;
  environment: Environment;
  store: Store;
  store_subscription_identifier: string;
  ownership: Ownership;
  management_url: string | null;
  country?: string | null;
  pending_changes?: { product: Product } | null;
}

export interface SubscriptionEntitlement {
  object: "subscription.entitlement";
  entitlement_id: string;
  lookup_key: string;
}

// ─── Purchase ───

export interface Purchase {
  object: "purchase";
  id: string;
  customer_id: string;
  original_customer_id: string;
  product_id: string;
  purchased_at: number;
  revenue_in_usd: MonetaryAmount;
  quantity: number;
  status: "owned" | "refunded";
  presented_offering_id: string | null;
  entitlements: PaginatedList<PurchaseEntitlement>;
  environment: Environment;
  store: Store;
  store_purchase_identifier: string;
  ownership: Ownership;
  country?: string | null;
}

export interface PurchaseEntitlement {
  object: "purchase.entitlement";
  entitlement_id: string;
  lookup_key: string;
}

// ─── Product ───

export type ProductType =
  | "subscription"
  | "one_time"
  | "consumable"
  | "non_consumable"
  | "non_renewing_subscription";

export interface Product {
  object: "product";
  id: string;
  store_identifier: string;
  type: ProductType;
  created_at: number;
  app_id: string;
  display_name: string | null;
  subscription?: SubscriptionProduct | null;
  one_time?: OneTimeProduct | null;
  app?: App | null;
}

export interface SubscriptionProduct {
  duration: string | null;
  grace_period_duration: string | null;
  trial_duration: string | null;
}

export interface OneTimeProduct {
  is_consumable: boolean;
}

// ─── Offering ───

export interface Offering {
  object: "offering";
  id: string;
  lookup_key: string;
  display_name: string;
  is_current: boolean;
  created_at: number;
  project_id: string;
  metadata?: Record<string, unknown> | null;
  packages?: PaginatedList<Package> | null;
}

// ─── Package ───

export interface Package {
  object: "package";
  id: string;
  lookup_key: string;
  display_name: string;
  position: number | null;
  created_at: number;
  products?: PaginatedList<Product> | null;
}

// ─── Entitlement ───

export interface Entitlement {
  object: "entitlement";
  project_id: string;
  id: string;
  lookup_key: string;
  display_name: string;
  created_at: number;
  products?: PaginatedList<Product> | null;
}

// ─── App ───

export type AppType =
  | "amazon"
  | "app_store"
  | "mac_app_store"
  | "play_store"
  | "stripe"
  | "rc_billing"
  | "roku"
  | "paddle"
  | "test_store";

export interface App {
  object: "app";
  id: string;
  name: string;
  created_at: number;
  type: AppType;
  project_id: string;
  amazon?: { package_name: string } | null;
  app_store?: { bundle_id: string } | null;
  mac_app_store?: { bundle_id: string } | null;
  play_store?: { package_name: string } | null;
  stripe?: { stripe_account_id: string | null } | null;
  rc_billing?: {
    stripe_account_id: string | null;
    app_name: string;
    default_currency: string;
    support_email: string | null;
  } | null;
  roku?: {
    roku_api_key: string | null;
    roku_channel_id: string | null;
    roku_channel_name: string | null;
  } | null;
  paddle?: {
    paddle_api_key: string | null;
    paddle_is_sandbox: boolean;
  } | null;
}

// ─── Paywall ───

export interface Paywall {
  object: "paywall";
  id: string;
  name: string | null;
  offering_id: string;
  created_at: number;
  published_at: number | null;
  offering?: Offering | null;
  components?: {
    published?: PaywallComponentsVersion | null;
    draft?: PaywallComponentsVersion | null;
  } | null;
}

export interface PaywallComponentsVersion {
  revision: number | null;
  components_config: Record<string, unknown> | null;
  default_locale: string | null;
  components_localizations: Record<string, unknown>;
  fonts?: Record<string, unknown> | null;
}

// ─── Invoice ───

export interface Invoice {
  object: "invoice";
  id: string;
  total_amount: MonetaryAmount;
  line_items: InvoiceLineItem[];
  issued_at: number;
  paid_at: number | null;
  invoice_url: string | null;
}

export interface InvoiceLineItem {
  object: "invoice.line_item";
  product_identifier: string;
  product_display_name: string | null;
  product_duration: string | null;
  quantity: number;
  unit_amount: MonetaryAmount;
}

// ─── Audit Log ───

export interface AuditLog {
  object: "audit_log";
  id: string;
  project_id: string;
  action_type: string;
  target_type: string;
  target_identifier: string;
  actor_type: "user" | "system" | "api_key";
  actor_identifier: string;
  occurred_at: number;
  additional_data: Record<string, unknown>;
}

// ─── Collaborator ───

export interface Collaborator {
  object: "collaborator";
  id: string;
  email: string;
  role: string;
  name?: string | null;
  accepted_at: number | null;
  has_mfa: boolean;
}

// ─── Virtual Currency ───

export interface VirtualCurrency {
  object: "virtual_currency";
  project_id: string;
  code: string;
  name: string;
  created_at: number;
  description?: string | null;
  product_grants?: VirtualCurrencyProductGrant[] | null;
}

export interface VirtualCurrencyProductGrant {
  object: "virtual_currency_product_grant";
  product_ids: string[];
  amount: number;
  trial_amount: number;
  expire_at_cycle_end: boolean;
}

export interface VirtualCurrencyBalance {
  object: "virtual_currency_balance";
  code: string;
  name: string;
  balance: number;
}

// ─── Webhook Integration ───

export interface WebhookIntegration {
  object: "webhook_integration";
  id: string;
  name: string;
  url: string;
  authorization_header: string | null;
  created_at: number;
  updated_at: number;
  environment: Environment | "all";
}

// ─── Project ───

export interface Project {
  object: "project";
  id: string;
  name: string;
  created_at: number;
}

// ─── Public API Key ───

export interface PublicApiKey {
  object: "public_api_key";
  key: string;
  name: string;
}

// ─── Subscription Transaction ───

export interface SubscriptionTransaction {
  object: "subscription.transaction";
  id: string;
  purchased_at: number;
  revenue_in_usd: MonetaryAmount;
  store_transaction_identifier: string;
  is_trial_period: boolean;
}
