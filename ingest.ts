// =============================================================================
// ingest.ts — Backend-Ingestion via Shopify products.json
// =============================================================================

import { writeFile } from "node:fs/promises";
import type {
  Brand,
  Material,
  Product,
  Season,
  SizeVariant,
  SizingSystem,
  Fit,
} from "./schema.ts";

interface ShopifyVariant {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  available: boolean;
  price: string;
}

interface ShopifyOption {
  name: string;
  position: number;
  values: string[];
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string | null;
  product_type: string | null;
  tags: string[] | string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: { src: string }[];
}

interface ShopifyPage {
  products: ShopifyProduct[];
}

const MATERIAL_LEXICON: Record<Material, string[]> = {
  leinen: ["leinen", "linen", "lin"],
  baumwolle: ["baumwolle", "cotton", "coton"],
  wolle: ["wolle", "wool", "merino", "laine"],
  denim: ["denim", "jeans"],
  kord: ["kord", "cord", "corduroy"],
  fleece: ["fleece"],
  seide: ["seide", "silk", "soie"],
  kaschmir: ["kaschmir", "cashmere", "cachemire"],
  leder: ["leder", "leather", "cuir"],
  nylon: ["nylon"],
  polyester: ["polyester"],
  tencel: ["tencel", "lyocell"],
  viskose: ["viskose", "viscose", "rayon"],
};

const FIT_LEXICON: Record<Fit, string[]> = {
  slim: ["slim"],
  skinny: ["skinny"],
  straight: ["straight", "gerade"],
  relaxed: ["relaxed", "locker"],
  "wide-leg": ["wide-leg", "wide leg", "weites bein"],
  oversized: ["oversized", "oversize"],
  boxy: ["boxy"],
  baggy: ["baggy"],
  cropped: ["cropped", "verkürzt"],
  tailored: ["tailored", "tailliert"],
  regular: ["regular", "regulär"],
};

const SEASON_LEXICON: Record<Exclude<Season, "ganzjaehrig">, string[]> = {
  sommer: ["sommer", "summer", "été", "ss", "spring/summer"],
  winter: ["winter", "hiver", "fw", "fall/winter", "autumn/winter"],
  uebergang: ["übergang", "uebergang", "mid-season", "demi-saison"],
};

const SUMMER_MATERIALS: Material[] = ["leinen", "tencel"];
const WINTER_MATERIALS: Material[] = ["wolle", "fleece", "kaschmir"];

const USER_AGENT =
  "FashionDiscoveryBot/1.0 (+https://elias46606.github.io/fashion-discovery)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchAllProducts(shopDomain: string): Promise<ShopifyProduct[]> {
  const base = shopDomain.replace(/\/+$/, "");
  const limit = 250;
  const out: ShopifyProduct[] = [];

  for (let page = 1; page <= 40; page++) {
    const url = `${base}/products.json?limit=${limit}&page=${page}`;
    let res: Response;
    try {
      res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    } catch {
      console.warn(`  ↳ ${shopDomain}: Netzwerkfehler, überspringe.`);
      break;
    }
    if (!res.ok) {
      console.warn(`  ↳ ${shopDomain}: HTTP ${res.status}, kein offener Feed.`);
      break;
    }
        let data: ShopifyPage;
    try {
      data = (await res.json()) as ShopifyPage;
    } catch {
      console.warn(`  ↳ ${shopDomain}: Kein gültiges JSON, kein Shopify-Feed.`);
      break;
    }
    if (!data.products?.length) break;
    out.push(...data.products);
    if (data.products.length < limit) break;
    await sleep(600);
  }
  return out;
}

function tagsToText(p: ShopifyProduct): string {
  const tags = Array.isArray(p.tags) ? p.tags.join(" ") : p.tags ?? "";
  return [p.title, p.body_html ?? "", p.product_type ?? "", tags]
    .join(" ")
    .toLowerCase();
}

function inferMaterials(text: string): Material[] {
  const found = new Set<Material>();
  for (const [mat, keywords] of Object.entries(MATERIAL_LEXICON)) {
    if (keywords.some((k) => text.includes(k))) found.add(mat as Material);
  }
  return [...found];
}

function inferFits(text: string): Fit[] {
  const found = new Set<Fit>();
  for (const [fit, keywords] of Object.entries(FIT_LEXICON)) {
    if (keywords.some((k) => text.includes(k))) found.add(fit as Fit);
  }
  return [...found];
}

function inferSeasons(text: string, materials: Material[]): Season[] {
  const found = new Set<Season>();
  for (const [season, keywords] of Object.entries(SEASON_LEXICON)) {
    if (keywords.some((k) => text.includes(k))) found.add(season as Season);
  }
  if (materials.some((m) => SUMMER_MATERIALS.includes(m))) found.add("sommer");
  if (materials.some((m) => WINTER_MATERIALS.includes(m))) found.add("winter");
  if (/(shorts|tank|kurzarm|sandal)/.test(text)) found.add("sommer");
  if (/(mantel|coat|puffer|daunen|parka|beanie)/.test(text)) found.add("winter");
  if (found.size === 0) found.add("ganzjaehrig");
  return [...found];
}

const SIZE_OPTION_RE = /size|größe|grösse|groesse|taille|talla/i;

function detectSizingSystem(labels: string[]): SizingSystem {
  const lower = labels.map((l) => l.toLowerCase().trim());
  if (lower.some((l) => /one[\s-]?size|einheits|os\b|taille unique/.test(l))) {
    return "one-size";
  }
  const allNumeric = lower.every((l) => /^\d{1,3}([./]\d)?$/.test(l));
  if (allNumeric && lower.length > 0) return "numeric";
  const allAlpha = lower.every((l) => /^(xxs|xs|s|m|l|xl|xxl|3xl)$/.test(l));
  if (allAlpha && lower.length > 0) return "alpha";
  return "mixed";
}

function extractSizes(p: ShopifyProduct): {
  sizes: SizeVariant[];
  system: SizingSystem;
} {
  const sizeOption = p.options.find((o) => SIZE_OPTION_RE.test(o.name));

  if (!sizeOption) {
    const available = p.variants.some((v) => v.available);
    return {
      sizes: [{ label: "One Size", available, variantId: p.variants[0]?.id }],
      system: "one-size",
    };
  }

  const idx = sizeOption.position;
  const sizes: SizeVariant[] = p.variants.map((v) => {
    const label =
      idx === 1 ? v.option1 : idx === 2 ? v.option2 : v.option3;
    return {
      label: (label ?? "").trim() || "—",
      available: v.available,
      variantId: v.id,
    };
  });

  const merged = new Map<string, SizeVariant>();
  for (const s of sizes) {
    const prev = merged.get(s.label);
    if (!prev) merged.set(s.label, { ...s });
    else prev.available = prev.available || s.available;
  }
  const list = [...merged.values()];
  return { sizes: list, system: detectSizingSystem(list.map((s) => s.label)) };
}

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function toMinor(price: string): number {
  const n = Number.parseFloat(price);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function buildProduct(shopDomain: string, sp: ShopifyProduct): Product {
  const base = shopDomain.replace(/\/+$/, "");
  const text = tagsToText(sp);
  const materials = inferMaterials(text);
  const fits = inferFits(text);
  const seasons = inferSeasons(text, materials);
  const { sizes, system } = extractSizes(sp);

  return {
    id: String(sp.id),
    title: sp.title,
    description: stripHtml(sp.body_html),
    productUrl: `${base}/products/${sp.handle}`,
    imageUrl: sp.images?.[0]?.src,
    priceMinor: toMinor(sp.variants?.[0]?.price ?? "0"),
    currency: "EUR",
    materials,
    seasons,
    fits,
    sizingSystem: system,
    sizes,
  };
}

export async function enrichBrand(brand: Brand): Promise<Brand> {
  console.log(`• ${brand.name} …`);
  const raw = await fetchAllProducts(brand.shopDomain);
  const products = raw.map((sp) => buildProduct(brand.shopDomain, sp));
  console.log(`  ↳ ${products.length} Produkte.`);
  return { ...brand, products };
}

async function main() {
  const seedPath = process.argv[2] ?? "./brands.seed.json";
  const outPath = process.argv[3] ?? "./brands.json";

  const seed = (await import(seedPath, { with: { type: "json" } })).default as Brand[];

  const enriched: Brand[] = [];
  for (const brand of seed) {
    enriched.push(await enrichBrand(brand));
    await sleep(800);
  }

  await writeFile(outPath, JSON.stringify(enriched, null, 2), "utf8");
  console.log(`\n✓ ${enriched.length} Marken → ${outPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
