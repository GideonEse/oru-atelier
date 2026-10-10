import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import { useCatalog } from "@/components/site-frame";
import { CATEGORIES, listProducts } from "@/lib/shop";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : "all",
    sort: typeof search.sort === "string" ? search.sort : "featured",
    q: typeof search.q === "string" ? search.q : "",
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listProducts({ data: deps }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData && loaderData.length === 1
            ? "Shop — ORU"
            : "Shop — ORU",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const products = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const all = useCatalog();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-5 py-10">
      <p className="text-xs tracking-widest text-muted uppercase">The floor</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl">
          {search.category === "all" ? "Shop" : search.category}
        </h1>
        <label className="text-sm text-muted">
          <span className="sr-only">Sort</span>
          <select
            value={search.sort}
            onChange={(event) => {
              void navigate({
                search: { ...search, sort: event.target.value },
              });
            }}
            className="h-11 border border-line bg-surface px-3 text-fg"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low</option>
            <option value="price-desc">Price, high</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <FilterChip
          active={search.category === "all"}
          label={`All ${all.length}`}
          onClick={() => void navigate({ search: { ...search, category: "all" } })}
        />
        {CATEGORIES.map((category) => {
          const count = all.filter((product) => product.category === category).length;
          return (
            <FilterChip
              key={category}
              active={search.category === category}
              label={`${category} ${count}`}
              onClick={() => void navigate({ search: { ...search, category } })}
            />
          );
        })}
      </div>

      {search.q ? (
        <p className="mt-4 text-sm text-muted">
          Showing matches for “{search.q}”.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => void navigate({ search: { ...search, q: "" } })}
          >
            Clear
          </button>
        </p>
      ) : null}

      {products.length === 0 ? (
        <div className="mt-16 border border-line bg-surface px-6 py-16 text-center">
          <h2 className="text-3xl">Nothing on that search.</h2>
          <p className="mt-3 text-muted">Try a material, a town, or the whole floor.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 shrink-0 items-center px-4 text-sm ${active ? "bg-ink text-bg" : "border border-line bg-surface text-fg"}`}
    >
      {label}
    </button>
  );
}
