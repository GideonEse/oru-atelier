import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { getRouteApi, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { cartCount, useBagReady, useCart } from "@/lib/cart";
import { dispatchFor, FREE_DISPATCH_FROM, naira } from "@/lib/money";
import { CATEGORIES, type Product } from "@/lib/shop";
import { ProductMark } from "@/components/product-mark";

const rootRoute = getRouteApi("__root__");

export function useCatalog(): Product[] {
  return rootRoute.useLoaderData();
}

const shopAll = { category: "all", sort: "featured", q: "" } as const;

export function SiteFrame({ children }: { children: ReactNode }) {
  const products = useCatalog();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const items = useCart((state) => state.items);
  const drawerOpen = useCart((state) => state.drawerOpen);
  const closeDrawer = useCart((state) => state.closeDrawer);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ready = useBagReady();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  const count = ready ? cartCount(items) : 0;
  const lines = items.flatMap((line) => {
    const product = products.find((item) => item.slug === line.slug);
    return product ? [{ line, product }] : [];
  });
  const goods = lines.reduce((sum, entry) => sum + entry.product.priceNaira * entry.line.qty, 0);
  const dispatch = dispatchFor(goods);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setMenuOpen(false);
    void navigate({
      to: "/shop",
      search: { ...shopAll, q: query.trim() },
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <p className="border-b border-line px-5 py-2 text-center text-xs tracking-widest text-muted uppercase">
          Complimentary dispatch over {naira(FREE_DISPATCH_FROM)}
        </p>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-5">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="font-display text-2xl tracking-wide">
            ORU
          </Link>
          <nav className="ml-6 hidden items-center gap-5 md:flex">
            <Link to="/shop" search={shopAll} className="text-sm text-muted hover:text-fg">
              Shop
            </Link>
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                to="/shop"
                search={{ ...shopAll, category }}
                className="text-sm text-muted hover:text-fg"
              >
                {category}
              </Link>
            ))}
          </nav>
          <form onSubmit={onSearch} className="ml-auto hidden md:block">
            <label className="sr-only" htmlFor="site-search">
              Search the shop
            </label>
            <input
              id="site-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cloth, clay, brass"
              className="h-11 w-56 border border-line bg-surface px-3 text-sm outline-none placeholder:text-muted"
            />
          </form>
          <button
            type="button"
            className="ml-auto inline-flex min-h-11 items-center gap-2 px-2 text-sm md:ml-2"
            onClick={() => useCart.getState().openDrawer()}
          >
            <ShoppingBag className="size-5" />
            <span>Bag</span>
            <span className="tabular-nums text-muted">{count}</span>
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-line px-5 py-4 md:hidden">
            <form onSubmit={onSearch}>
              <label className="sr-only" htmlFor="mobile-search">
                Search the shop
              </label>
              <input
                id="mobile-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the house"
                className="h-11 w-full border border-line bg-surface px-3 text-sm outline-none"
              />
            </form>
            <div className="mt-4 flex flex-col">
              <Link to="/shop" search={shopAll} className="min-h-11 py-2 text-lg">
                Shop
              </Link>
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  to="/shop"
                  search={{ ...shopAll, category }}
                  className="min-h-11 py-2 text-lg"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-16 border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl">ORU</p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              A Yaba house for the table and the room. Small runs from looms, kilns, and a brass bench.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-xs tracking-widest text-muted uppercase">Visit</p>
            <Link to="/shop" search={shopAll} className="min-h-11 py-2 md:min-h-0">
              All pieces
            </Link>
            <Link to="/cart" className="min-h-11 py-2 md:min-h-0">
              Your bag
            </Link>
            <Link to="/" hash="atelier" className="min-h-11 py-2 md:min-h-0">
              The atelier
            </Link>
          </div>
          <div className="text-sm text-muted">
            <p className="text-xs tracking-widest uppercase">Dispatch</p>
            <p className="mt-3">
              Orders over {naira(FREE_DISPATCH_FROM)} ship free. Under that, dispatch is {naira(3500)}. No
              card is taken on this desk.
            </p>
          </div>
        </div>
      </footer>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close bag"
            onClick={closeDrawer}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="relative flex h-full w-full max-w-md flex-col bg-bg"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-2xl">Your bag</h2>
              <button type="button" className="inline-flex size-11 items-center justify-center" onClick={closeDrawer} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <p className="text-muted">The bag is empty. The edit is on the shop floor.</p>
              ) : (
                <ul className="flex flex-col gap-5">
                  {lines.map(({ line, product }) => (
                    <li key={line.slug} className="flex gap-4">
                      <ProductMark
                        tone={product.tone}
                        motif={product.motif}
                        name={product.name}
                        className="size-20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to="/product/$slug"
                            params={{ slug: product.slug }}
                            onClick={closeDrawer}
                            className="font-display text-lg leading-tight"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm tabular-nums">{naira(product.priceNaira * line.qty)}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
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
                            className="ml-auto text-sm text-muted underline-offset-2 hover:underline"
                            onClick={() => remove(product.slug)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-line px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Pieces</span>
                <span className="tabular-nums">{naira(goods)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted">Dispatch</span>
                <span className="tabular-nums">{dispatch === 0 ? "Included" : naira(dispatch)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Total</span>
                <span className="tabular-nums">{naira(goods + dispatch)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={closeDrawer}
                aria-disabled={lines.length === 0}
                className={`mt-5 inline-flex min-h-11 w-full items-center justify-center bg-clay text-sm text-surface ${lines.length === 0 ? "pointer-events-none opacity-40" : ""}`}
              >
                Reserve these pieces
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
