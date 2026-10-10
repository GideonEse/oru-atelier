import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { dispatchFor } from "@/lib/money";

export const CATEGORIES = ["Textiles", "Ceramics", "Brass", "Scent"] as const;
export type Category = (typeof CATEGORIES)[number];

export const TONES = ["indigo", "clay", "brass", "oat", "ink"] as const;
export type Tone = (typeof TONES)[number];

export const MOTIFS = [
  "weave",
  "vessel",
  "disc",
  "stripe",
  "stack",
  "fold",
  "flame",
  "pair",
  "coil",
  "cup",
  "block",
  "spout",
] as const;
export type Motif = (typeof MOTIFS)[number];

const SORTS = ["featured", "price-asc", "price-desc", "name"] as const;
export type SortKey = (typeof SORTS)[number];

export type Product = {
  slug: string;
  name: string;
  category: Category;
  priceNaira: number;
  blurb: string;
  description: string;
  material: string;
  origin: string;
  tone: Tone;
  motif: Motif;
  featured: boolean;
  stock: number;
};

export type OrderLine = {
  slug: string;
  name: string;
  qty: number;
  unitNaira: number;
};

export type OrderRecord = {
  code: string;
  items: OrderLine[];
  dispatchNaira: number;
  totalNaira: number;
  createdAt: string;
};

export type ShopQuery = {
  category: string;
  q: string;
  sort: string;
};

type ProductRow = {
  slug: string;
  name: string;
  category: string;
  price_naira: number;
  blurb: string;
  description: string;
  material: string;
  origin: string;
  tone: string;
  motif: string;
  featured: boolean | number | string;
  stock: number;
};

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

function isMotif(value: string): value is Motif {
  return (MOTIFS as readonly string[]).includes(value);
}

function flag(value: unknown): boolean {
  return value === true || value === 1 || value === "t" || value === "true";
}

function toProduct(row: ProductRow): Product | null {
  if (!isCategory(row.category) || !isTone(row.tone) || !isMotif(row.motif)) {
    return null;
  }
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    priceNaira: Number(row.price_naira),
    blurb: row.blurb,
    description: row.description,
    material: row.material,
    origin: row.origin,
    tone: row.tone,
    motif: row.motif,
    featured: flag(row.featured),
    stock: Number(row.stock),
  };
}

function normalizeQuery(input: unknown): ShopQuery {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const category = typeof raw.category === "string" ? raw.category : "all";
  const sort = typeof raw.sort === "string" ? raw.sort : "featured";
  const q = typeof raw.q === "string" ? raw.q.trim().slice(0, 80) : "";
  return {
    category: category === "all" || isCategory(category) ? category : "all",
    sort: (SORTS as readonly string[]).includes(sort) ? sort : "featured",
    q,
  };
}

function sortProducts(products: Product[], sort: string): Product[] {
  const next = [...products];
  next.sort((a, b) => {
    if (sort === "price-asc") return a.priceNaira - b.priceNaira || a.name.localeCompare(b.name);
    if (sort === "price-desc") return b.priceNaira - a.priceNaira || a.name.localeCompare(b.name);
    if (sort === "name") return a.name.localeCompare(b.name);
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return next;
}

export const listProducts = createServerFn({ method: "GET" })
  .validator((input: unknown) => normalizeQuery(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      select slug, name, category, price_naira, blurb, description, material, origin,
             tone, motif, featured, stock
      from products
      where (${data.category} = 'all' or category = ${data.category})
        and (
          ${data.q} = ''
          or name ilike ${"%" + data.q + "%"}
          or blurb ilike ${"%" + data.q + "%"}
          or material ilike ${"%" + data.q + "%"}
          or origin ilike ${"%" + data.q + "%"}
        )
    `;
    const products = rows.flatMap((row) => {
      const product = toProduct(row);
      return product ? [product] : [];
    });
    return sortProducts(products, data.sort);
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((slug: unknown) => {
    if (typeof slug !== "string" || !/^[a-z0-9-]{2,80}$/.test(slug)) return "";
    return slug;
  })
  .handler(async ({ data }) => {
    if (!data) return null;
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      select slug, name, category, price_naira, blurb, description, material, origin,
             tone, motif, featured, stock
      from products
      where slug = ${data}
    `;
    const row = rows[0];
    return row ? toProduct(row) : null;
  });

const MAX_QTY = 8;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function orderCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = "ORU-";
  for (const byte of bytes) code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return code;
}

function asLines(value: unknown): OrderLine[] {
  const raw = typeof value === "string" ? (JSON.parse(value) as unknown) : value;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((line) => {
    if (!line || typeof line !== "object") return [];
    const record = line as Record<string, unknown>;
    if (
      typeof record.slug !== "string" ||
      typeof record.name !== "string" ||
      typeof record.qty !== "number" ||
      typeof record.unitNaira !== "number"
    ) {
      return [];
    }
    return [
      {
        slug: record.slug,
        name: record.name,
        qty: record.qty,
        unitNaira: record.unitNaira,
      },
    ];
  });
}

function stamp(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

type OrderRow = {
  code: string;
  items: unknown;
  dispatch_naira: number;
  total_naira: number;
  created_at: unknown;
};

function toOrder(row: OrderRow): OrderRecord {
  return {
    code: row.code,
    items: asLines(row.items),
    dispatchNaira: Number(row.dispatch_naira),
    totalNaira: Number(row.total_naira),
    createdAt: stamp(row.created_at),
  };
}

export const placeOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object" || !("items" in input)) {
      throw new Error("Your bag is empty.");
    }
    const raw = (input as { items: unknown }).items;
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > 12) {
      throw new Error("Your bag is empty.");
    }
    const seen = new Set<string>();
    const items = raw.map((line) => {
      if (!line || typeof line !== "object") throw new Error("That bag could not be read.");
      const slug = (line as { slug?: unknown }).slug;
      const qty = (line as { qty?: unknown }).qty;
      if (typeof slug !== "string" || !/^[a-z0-9-]{2,80}$/.test(slug)) {
        throw new Error("Unknown piece in the bag.");
      }
      if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        throw new Error("Quantity has to be between 1 and 8.");
      }
      if (seen.has(slug)) throw new Error("A piece is listed twice.");
      seen.add(slug);
      return { slug, qty };
    });
    return { items };
  })
  .handler(async ({ data }): Promise<OrderRecord> => {
    const sql = await getSql();
    const placeholders = data.items.map((_, index) => `$${index + 1}`).join(", ");
    const rows = await sql.query<ProductRow>(
      `select slug, name, category, price_naira, blurb, description, material, origin,
              tone, motif, featured, stock
       from products
       where slug in (${placeholders})`,
      data.items.map((item) => item.slug),
    );
    const bySlug = new Map<string, Product>();
    for (const row of rows) {
      const product = toProduct(row);
      if (product) bySlug.set(product.slug, product);
    }

    const priced = data.items.map((item) => {
      const product = bySlug.get(item.slug);
      if (!product) throw new Error("A piece in your bag is no longer listed.");
      if (product.stock < item.qty) {
        const left = product.stock === 0 ? "is gone" : `has ${product.stock} left`;
        throw new Error(`${product.name} ${left}.`);
      }
      return {
        slug: product.slug,
        name: product.name,
        qty: item.qty,
        unitNaira: product.priceNaira,
      } satisfies OrderLine;
    });

    const goods = priced.reduce((sum, line) => sum + line.unitNaira * line.qty, 0);
    const dispatchNaira = dispatchFor(goods);
    const held: OrderLine[] = [];
    let committed = false;

    try {
      for (const line of priced) {
        const updated = await sql.query<{ slug: string }>(
          "update products set stock = stock - $2 where slug = $1 and stock >= $2 returning slug",
          [line.slug, line.qty],
        );
        if (updated.length === 0) {
          throw new Error(`${line.name} just sold out. Nothing was reserved.`);
        }
        held.push(line);
      }

      const code = orderCode();
      const inserted = await sql.query<OrderRow>(
        `insert into orders (code, items, dispatch_naira, total_naira)
         values ($1, $2::jsonb, $3, $4)
         returning code, items, dispatch_naira, total_naira, created_at`,
        [code, JSON.stringify(priced), dispatchNaira, goods + dispatchNaira],
      );
      const row = inserted[0];
      if (!row) throw new Error("The order book did not take that. Try again.");
      committed = true;
      return toOrder(row);
    } catch (error) {
      if (!committed) {
        for (const line of held) {
          await sql.query("update products set stock = stock + $2 where slug = $1", [
            line.slug,
            line.qty,
          ]);
        }
      }
      throw error;
    }
  });

export const getOrder = createServerFn({ method: "GET" })
  .validator((code: unknown) => {
    if (typeof code !== "string" || !/^ORU-[A-Z0-9]{6}$/.test(code)) return "";
    return code;
  })
  .handler(async ({ data }) => {
    if (!data) return null;
    const sql = await getSql();
    const rows = await sql<OrderRow>`
      select code, items, dispatch_naira, total_naira, created_at
      from orders
      where code = ${data}
    `;
    const row = rows[0];
    return row ? toOrder(row) : null;
  });
