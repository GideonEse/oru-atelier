import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductMark } from "@/components/product-mark";
import { useCatalog } from "@/components/site-frame";
import { useBagReady, useCart } from "@/lib/cart";
import { dispatchFor, naira } from "@/lib/money";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your bag — ORU" }] }),
  component: CartPage,
});

function CartPage() {
  const products = useCatalog();
  const ready = useBagReady();
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const lines = items.flatMap((line) => {
    const product = products.find((item) => item.slug === line.slug);
    return product ? [{ line, product }] : [];
  });
  const goods = lines.reduce((sum, entry) => sum + entry.product.priceNaira * entry.line.qty, 0);
  const dispatch = dispatchFor(goods);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-5xl">Your bag</h1>
      { !ready ? (
        <p className="mt-10 text-muted">Opening your bag…</p>
      ) : lines.length === 0 ? (
        <div className="mt-10 border border-line bg-surface px-6 py-14">
          <p className="text-muted">Nothing reserved yet.</p>
          <Link
            to="/shop"
            search={{ category: "all", sort: "featured", q: "" }}
            className="mt-6 inline-flex min-h-11 items-center bg-clay px-5 text-sm text-surface"
          >
            Shop the edit
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 flex flex-col gap-6">
            {lines.map(({ line, product }) => (
              <li key={line.slug} className="flex gap-4 border-b border-line pb-6">
                <ProductMark
                  tone={product.tone}
                  motif={product.motif}
                  name={product.name}
                  className="size-24 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs tracking-widest text-muted uppercase">{product.category}</p>
                      <Link
                        to="/product/$slug"
                        params={{ slug: product.slug }}
                        className="font-display text-2xl"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <p className="tabular-nums">{naira(product.priceNaira * line.qty)}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex size-11 items-center justify-center border border-line"
                      aria-label={`Fewer ${product.name}`}
                      onClick={() => setQty(product.slug, line.qty - 1, product.stock)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center tabular-nums">{line.qty}</span>
                    <button
                      type="button"
                      className="inline-flex size-11 items-center justify-center border border-line disabled:opacity-40"
                      aria-label={`More ${product.name}`}
                      disabled={line.qty >= Math.min(8, product.stock)}
                      onClick={() => setQty(product.slug, line.qty + 1, product.stock)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-sm text-muted"
                      onClick={() => remove(product.slug)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center justify-between">
            <span className="text-muted">Dispatch</span>
            <span className="tabular-nums">{dispatch === 0 ? "Included" : naira(dispatch)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xl">
            <span>Total</span>
            <span className="tabular-nums">{naira(goods + dispatch)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-8 inline-flex min-h-11 w-full items-center justify-center bg-clay text-sm text-surface md:w-auto md:px-8"
          >
            Continue to reserve
          </Link>
        </>
      )}
    </main>
  );
}
