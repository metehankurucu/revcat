export type HttpMethod = "GET" | "POST";

export interface AllowedOperation {
  method: HttpMethod;
  path: string;
  domain: "charts_metrics" | "customer_information" | "project_configuration";
}

/**
 * Strict allowlist of permitted API operations.
 * Only operations in this map can be executed.
 * This is the security foundation - no DELETE, no refunds,
 * no grant/revoke, no cancellation, no destructive operations.
 */
export const ALLOWED_OPERATIONS = new Map<string, AllowedOperation>([
  // ─── Projects ───
  ["list-projects", { method: "GET", path: "/projects", domain: "project_configuration" }],

  // ─── Apps ───
  ["list-apps", { method: "GET", path: "/projects/{project_id}/apps", domain: "project_configuration" }],
  ["get-app", { method: "GET", path: "/projects/{project_id}/apps/{app_id}", domain: "project_configuration" }],
  ["list-app-public-api-keys", { method: "GET", path: "/projects/{project_id}/apps/{app_id}/public_api_keys", domain: "project_configuration" }],
  ["get-app-storekit-config", { method: "GET", path: "/projects/{project_id}/apps/{app_id}/store_kit_config", domain: "project_configuration" }],

  // ─── Charts & Metrics (CORE ANALYTICS) ───
  ["get-overview-metrics", { method: "GET", path: "/projects/{project_id}/metrics/overview", domain: "charts_metrics" }],
  ["get-chart-data", { method: "GET", path: "/projects/{project_id}/charts/{chart_name}", domain: "charts_metrics" }],
  ["get-chart-options", { method: "GET", path: "/projects/{project_id}/charts/{chart_name}/options", domain: "charts_metrics" }],

  // ─── Customers (READ) ───
  ["list-customers", { method: "GET", path: "/projects/{project_id}/customers", domain: "customer_information" }],
  ["get-customer", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}", domain: "customer_information" }],
  ["list-customer-active-entitlements", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/active_entitlements", domain: "customer_information" }],
  ["list-customer-aliases", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/aliases", domain: "customer_information" }],
  ["list-customer-attributes", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/attributes", domain: "customer_information" }],
  ["list-customer-purchases", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/purchases", domain: "customer_information" }],
  ["list-customer-subscriptions", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/subscriptions", domain: "customer_information" }],
  ["list-customer-vc-balances", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/virtual_currencies", domain: "customer_information" }],

  // ─── Customers (SAFE WRITE) ───
  ["set-customer-attributes", { method: "POST", path: "/projects/{project_id}/customers/{customer_id}/attributes", domain: "customer_information" }],
  ["assign-customer-offering", { method: "POST", path: "/projects/{project_id}/customers/{customer_id}/actions/assign_offering", domain: "customer_information" }],

  // ─── Entitlements ───
  ["list-entitlements", { method: "GET", path: "/projects/{project_id}/entitlements", domain: "project_configuration" }],
  ["get-entitlement", { method: "GET", path: "/projects/{project_id}/entitlements/{entitlement_id}", domain: "project_configuration" }],
  ["list-entitlement-products", { method: "GET", path: "/projects/{project_id}/entitlements/{entitlement_id}/products", domain: "project_configuration" }],
  ["create-entitlement", { method: "POST", path: "/projects/{project_id}/entitlements", domain: "project_configuration" }],
  ["update-entitlement", { method: "POST", path: "/projects/{project_id}/entitlements/{entitlement_id}", domain: "project_configuration" }],
  ["attach-products-to-entitlement", { method: "POST", path: "/projects/{project_id}/entitlements/{entitlement_id}/actions/attach_products", domain: "project_configuration" }],
  ["detach-products-from-entitlement", { method: "POST", path: "/projects/{project_id}/entitlements/{entitlement_id}/actions/detach_products", domain: "project_configuration" }],

  // ─── Offerings ───
  ["list-offerings", { method: "GET", path: "/projects/{project_id}/offerings", domain: "project_configuration" }],
  ["get-offering", { method: "GET", path: "/projects/{project_id}/offerings/{offering_id}", domain: "project_configuration" }],
  ["create-offering", { method: "POST", path: "/projects/{project_id}/offerings", domain: "project_configuration" }],
  ["update-offering", { method: "POST", path: "/projects/{project_id}/offerings/{offering_id}", domain: "project_configuration" }],

  // ─── Packages ───
  ["list-packages", { method: "GET", path: "/projects/{project_id}/offerings/{offering_id}/packages", domain: "project_configuration" }],
  ["get-package", { method: "GET", path: "/projects/{project_id}/packages/{package_id}", domain: "project_configuration" }],
  ["list-package-products", { method: "GET", path: "/projects/{project_id}/packages/{package_id}/products", domain: "project_configuration" }],
  ["create-package", { method: "POST", path: "/projects/{project_id}/offerings/{offering_id}/packages", domain: "project_configuration" }],
  ["update-package", { method: "POST", path: "/projects/{project_id}/packages/{package_id}", domain: "project_configuration" }],
  ["attach-products-to-package", { method: "POST", path: "/projects/{project_id}/packages/{package_id}/actions/attach_products", domain: "project_configuration" }],
  ["detach-products-from-package", { method: "POST", path: "/projects/{project_id}/packages/{package_id}/actions/detach_products", domain: "project_configuration" }],

  // ─── Products (READ ONLY) ───
  ["list-products", { method: "GET", path: "/projects/{project_id}/products", domain: "project_configuration" }],
  ["get-product", { method: "GET", path: "/projects/{project_id}/products/{product_id}", domain: "project_configuration" }],

  // ─── Subscriptions (READ ONLY) ───
  ["search-subscriptions", { method: "GET", path: "/projects/{project_id}/subscriptions", domain: "customer_information" }],
  ["get-subscription", { method: "GET", path: "/projects/{project_id}/subscriptions/{subscription_id}", domain: "customer_information" }],
  ["list-subscription-entitlements", { method: "GET", path: "/projects/{project_id}/subscriptions/{subscription_id}/entitlements", domain: "customer_information" }],
  ["get-subscription-transactions", { method: "GET", path: "/projects/{project_id}/subscriptions/{subscription_id}/transactions", domain: "customer_information" }],
  ["get-subscription-management-url", { method: "GET", path: "/projects/{project_id}/subscriptions/{subscription_id}/authenticated_management_url", domain: "customer_information" }],

  // ─── Purchases (READ ONLY) ───
  ["search-purchases", { method: "GET", path: "/projects/{project_id}/purchases", domain: "customer_information" }],
  ["get-purchase", { method: "GET", path: "/projects/{project_id}/purchases/{purchase_id}", domain: "customer_information" }],
  ["list-purchase-entitlements", { method: "GET", path: "/projects/{project_id}/purchases/{purchase_id}/entitlements", domain: "customer_information" }],

  // ─── Invoices (READ ONLY) ───
  ["list-invoices", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/invoices", domain: "customer_information" }],
  ["get-invoice-file", { method: "GET", path: "/projects/{project_id}/customers/{customer_id}/invoices/{invoice_id}/file", domain: "customer_information" }],

  // ─── Audit Logs ───
  ["list-audit-logs", { method: "GET", path: "/projects/{project_id}/audit_logs", domain: "project_configuration" }],

  // ─── Collaborators ───
  ["list-collaborators", { method: "GET", path: "/projects/{project_id}/collaborators", domain: "project_configuration" }],

  // ─── Virtual Currencies (READ ONLY) ───
  ["list-virtual-currencies", { method: "GET", path: "/projects/{project_id}/virtual_currencies", domain: "project_configuration" }],
  ["get-virtual-currency", { method: "GET", path: "/projects/{project_id}/virtual_currencies/{virtual_currency_code}", domain: "project_configuration" }],

  // ─── Webhooks ───
  ["list-webhooks", { method: "GET", path: "/projects/{project_id}/integrations/webhooks", domain: "project_configuration" }],
  ["get-webhook", { method: "GET", path: "/projects/{project_id}/integrations/webhooks/{webhook_integration_id}", domain: "project_configuration" }],
  ["create-webhook", { method: "POST", path: "/projects/{project_id}/integrations/webhooks", domain: "project_configuration" }],
  ["update-webhook", { method: "POST", path: "/projects/{project_id}/integrations/webhooks/{webhook_integration_id}", domain: "project_configuration" }],

  // ─── Paywalls ───
  ["list-paywalls", { method: "GET", path: "/projects/{project_id}/paywalls", domain: "project_configuration" }],
  ["get-paywall", { method: "GET", path: "/projects/{project_id}/paywalls/{paywall_id}", domain: "project_configuration" }],
  ["create-paywall", { method: "POST", path: "/projects/{project_id}/paywalls", domain: "project_configuration" }],
]);
