import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import { ProductMark } from "@/components/product-mark";
import { useCatalog } from "@/components/site-frame";
import { useCart } from "@/lib/cart";
import { naira } from "@/lib/money";
import { getProduct } from "@/lib/shop";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProduct({ data: params.slug });
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.name} — ORU` : "ORU" }],
  }),
  notFoundComponent: () => (
    <main className="mx-auto w-full max-w-3xl px-5 py-20">
      <h1 className="text-5xl">That piece has left the floor.</h1>
      <Link
        to="/shop"
        search={{ category: "all", sort: "featured", q: "" }}
        className="mt-8 inline-flex min-h-11 items-center bg-clay px-5 text-sm text-surface"
      >
        See what is left
      </Link>
    </main>
  ),
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const catalog = useCatalog();
  const items = useCart((state) => state.items);
  const add = useCart((state) => state.add);
  const [qty, setQty] = useState(1);
  const inBag = items.find((line) => line.slug === product.slug)?.qty ?? 0;
  const room = Math.max(0, Math.min(8, product.stock) - inBag);
  const related = catalog
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 3);

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-5 py-10">
      <p className="text-xs tracking-widest text-muted uppercase">
        <Link to="/shop" search={{ category: product.category, sort: "featured", q: "" }}>
          {product.category}
        </Link>
      </p>
      <div className="mt-6 grid items-start gap-10 md:grid-cols-2">
        <ProductMark
          tone={product.tone}
          motif={product.motif}
          name={product.name}
          className="aspect-3/4 w-full"
        />
        <div>
          <h1 className="text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl tabular-nums">{naira(product.priceNaira)}</p>
          <p className="mt-6 max-w-md text-lg">{product.blurb}</p>
          <p className="mt-4 max-w-md text-muted">{product.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-xs tracking-widest text-muted uppercase">Material</dt>
              <dd className="mt-1">{product.material}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted uppercase">Origin</dt>
              <dd className="mt-1">{product.origin}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted uppercase">In the house</dt>
              <dd className="mt-1">{product.stock === 0 ? "Sold out" : `${product.stock} left`}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted uppercase">In your bag</dt>
              <dd className="mt-1 tabular-nums">{inBag}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-line">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center"
                aria-label="Decrease quantity"
                onClick={() => setQty((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span className="w-8 text-center tabular-nums">{qty}</span>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center disabled:opacity-40"
                aria-label="Increase quantity"
                disabled={qty >= Math.max(1, room)}
                onClick={() => setQty((value) => value + 1)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={room < 1}
              onClick={() => add(product.slug, qty, product.stock)}
              className="inline-flex min-h-11 items-center bg-clay px-6 text-sm text-surface disabled:opacity-40"
            >
              {product.stock === 0 ? "Sold out" : room < 1 ? "All of these are in your bag" : "Add to bag"}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="text-3xl">With it</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
