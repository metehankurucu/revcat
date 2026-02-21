export interface PaginatedList<T> {
  object: "list";
  items: T[];
  next_page: string | null;
  url: string;
}

export interface MonetaryAmount {
  currency: string;
  gross: number;
  commission: number;
  tax: number;
  proceeds: number;
}

export type Environment = "production" | "sandbox";

export type Ownership = "purchased" | "family_shared";

export type Store =
  | "amazon"
  | "app_store"
  | "mac_app_store"
  | "play_store"
  | "promotional"
  | "stripe"
  | "rc_billing"
  | "roku"
  | "paddle";
