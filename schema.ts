// Typen für das Fashion-Discovery-Datenmodell

export type Material =
  | "leinen" | "baumwolle" | "wolle" | "denim" | "kord"
  | "fleece" | "seide" | "kaschmir" | "leder" | "nylon"
  | "polyester" | "tencel" | "viskose";

export type Season = "sommer" | "winter" | "uebergang" | "ganzjaehrig";

export type SizingSystem = "alpha" | "numeric" | "one-size" | "mixed";

export type Fit =
  | "slim" | "skinny" | "straight" | "relaxed" | "wide-leg"
  | "oversized" | "boxy" | "baggy" | "cropped" | "tailored" | "regular";

export interface SizeVariant {
  label: string;
  available: boolean;
  variantId?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  productUrl: string;
  imageUrl?: string;
  priceMinor: number;
  currency: string;
  materials: Material[];
  seasons: Season[];
  fits: Fit[];
  sizingSystem: SizingSystem;
  sizes: SizeVariant[];
}

export interface FamousnessSignals {
  searchVolume: number;
  stockistReach: number;
  followerCount: number;
}

export interface AffiliateInfo {
  hasNativeProgram: boolean;
  network?: string;
}

export interface Brand {
  id: string;
  name: string;
  shopDomain: string;
  founderVisible: boolean;
  originalImagery: boolean;
  networkConfirmed: boolean;
  watchlist: boolean;
  styleTags: string[];
  famousness: FamousnessSignals;
  affiliate: AffiliateInfo;
  products: Product[];
}
