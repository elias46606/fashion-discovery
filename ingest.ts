// =============================================================================
// ingest.ts — Backend-Ingestion via Shopify products.json
// -----------------------------------------------------------------------------
// Holt Produktdaten der Marken und reichert sie an. Löst auf einen Schlag:
//   Punkt 2  → Produktbeschreibungen + Material/Saison-Tags
//   Punkt 3  → Größen + Live-Verfügbarkeit (Sorte 4)
//   Punkt 4  → Deeplinks direkt zum Produkt
//
// LÄUFT IM BACKEND (Node 18+), NICHT auf GitHub Pages.
// Aufruf:  node --experimental-strip-types ingest.ts   (Node 22+)
//   oder:  tsx ingest.ts
//
// Hinweis Fairness/Recht: products.json ist bei Shopify standardmäßig offen,
// aber respektiere robots.txt/ToS, drossle Requests, setze einen User-Agent.
// Nicht jeder Shop ist Shopify — der Code degradiert sauber (leeres products[]).
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

// ---------- Rohform der Shopify-Antwort (nur was wir brauchen) ----------------

interface ShopifyVariant {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  available: boolean;
  price: string; // z.B. "59.00"
}

interface ShopifyOption {
  name: string; // "Size", "Größe", "Color", ...
  position: number; // 1-basiert → mappt auf option1/2/3
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

// ---------- Punkt 2: Material-Lexikon (DE / EN / FR) --------------------------

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

// Saison-Schlüsselwörter, falls explizit genannt
const SEASON_LEXICON: Record<Exclude<Season, "ganzjaehrig">, string[]> = {
  sommer: ["sommer", "summer", "été", "ss", "spring/summer"],
  winter: ["winter", "hiver", "fw", "fall/winter", "autumn/winter"],
  uebergang: ["übergang", "uebergang", "mid-season", "demi-saison"],
};

// Material → Saison-Heuristik
const SUMMER_MATERIALS: Material[] = ["leinen", "tencel"];
const WINTER_MATERIALS: Material[] = ["wolle", "fleece", "kaschmir"];

// ---------- HTTP --------------------------------------------------------------

const USER_AGENT =
  "FashionDiscoveryBot/1.0 (+https://elias46606.github.io/fashion-discovery)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lädt ALLE Produkte eines Shops über die paginierte products.json. */
async function fetchAllProducts(shopDomain: string): Promise<ShopifyProduct[]> {
  const base = shopDomain.replace(/\/+$/, "");
  const limit = 250; // Shopify-Maximum
  const out: ShopifyProduct[] = [];

  for (let page = 1; page <= 40; page++) {
    const url = `${base}/products.json?limit=${limit}&page=${page}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      console.warn(`  ↳ ${shopDomain}: Netzwerkfehler oder Timeout, überspringe.`);
      break;
    }
    if (!res.ok) {
      // 404/403 → vermutlich kein offener Shopify-Feed. Sauber abbrechen.
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
    if (data.products.length < limit) break; // letzte Seite
    await sleep(600); // höflich drosseln
  }
  return out;
}

// ---------- Ableitung der Tags ------------------------------------------------

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

  // 1) explizite Saison-Wörter
  for (const [season, keywords] of Object.entries(SEASON_LEXICON)) {
    if (keywords.some((k) => text.includes(k))) found.add(season as Season);
  }
  // 2) Material-Heuristik
  if (materials.some((m) => SUMMER_MATERIALS.includes(m))) found.add("sommer");
  if (materials.some((m) => WINTER_MATERIALS.includes(m))) found.add("winter");
  // 3) Typ-Heuristik
  if (/(shorts|tank|kurzarm|sandal)/.test(text)) found.add("sommer");
  if (/(mantel|coat|puffer|daunen|parka|beanie)/.test(text)) found.add("winter");

  if (found.size === 0) found.add("ganzjaehrig");
  return [...found];
}

// ---------- Punkt 3: Größen extrahieren --------------------------------------

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
  // Finde die Option, die für Größe steht (Position → option1/2/3).
  const sizeOption = p.options.find((o) => SIZE_OPTION_RE.test(o.name));

  if (!sizeOption) {
    // Keine Größen-Option → behandeln wir als One-Size, sofern Varianten da.
    const available = p.variants.some((v) => v.available);
    return {
      sizes: [{ label: "One Size", available, variantId: p.variants[0]?.id }],
      system: "one-size",
    };
  }

  const idx = sizeOption.position; // 1,2,3
  const sizes: SizeVariant[] = p.variants.map((v) => {
    const label =
      idx === 1 ? v.option1 : idx === 2 ? v.option2 : v.option3;
    return {
      label: (label ?? "").trim() || "—",
      available: v.available,
      variantId: v.id,
    };
  });

  // Duplikate zusammenführen (verfügbar, wenn IRGENDEINE Variante verfügbar ist)
  const merged = new Map<string, SizeVariant>();
  for (const s of sizes) {
    const prev = merged.get(s.label);
    if (!prev) merged.set(s.label, { ...s });
    else prev.available = prev.available || s.available;
  }
  const list = [...merged.values()];
  return { sizes: list, system: detectSizingSystem(list.map((s) => s.label)) };
}

// ---------- Helpers -----------------------------------------------------------

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ") // Tags raus
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280); // kurze Karten-Beschreibung
}

function toMinor(price: string): number {
  const n = Number.parseFloat(price);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

// ---------- Produkt bauen -----------------------------------------------------

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
    description: stripHtml(sp.body_html), // Punkt 2
    productUrl: `${base}/products/${sp.handle}`, // Punkt 4
    imageUrl: sp.images?.[0]?.src,
    priceMinor: toMinor(sp.variants?.[0]?.price ?? "0"),
    currency: "EUR",
    materials, // Punkt 2
    seasons, // Punkt 2
    fits,
    sizingSystem: system, // Punkt 3
    sizes, // Punkt 3
  };
}

// ---------- Marke anreichern --------------------------------------------------

export async function enrichBrand(brand: Brand): Promise<Brand> {
  console.log(`• ${brand.name} …`);
  const raw = await fetchAllProducts(brand.shopDomain);
  const products = raw.map((sp) => buildProduct(brand.shopDomain, sp));
  console.log(`  ↳ ${products.length} Produkte.`);
  return { ...brand, products };
}

// ---------- Einstieg ----------------------------------------------------------
// Erwartet eine schlanke Seed-Liste (brands.seed.json) mit mindestens
// { id, name, shopDomain, ... } und schreibt die angereicherte brands.json.

async function main() {
  const seedPath = process.argv[2] ?? "./brands.seed.json";
  const outPath = process.argv[3] ?? "./brands.json";

  const seed = (await import(seedPath, { with: { type: "json" } })).default as Brand[];

  const enriched: Brand[] = [];
  for (const brand of seed) {
    enriched.push(await enrichBrand(brand));
    await sleep(800); // zwischen Shops drosseln
  }

  await writeFile(outPath, JSON.stringify(enriched, null, 2), "utf8");
  console.log(`\n✓ ${enriched.length} Marken → ${outPath}`);
}

// Nur ausführen, wenn direkt gestartet (nicht beim Import).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
