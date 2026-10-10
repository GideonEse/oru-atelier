import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import { ProductMark } from "@/components/product-mark";
import { useCatalog } from "@/components/site-frame";
import { CATEGORIES } from "@/lib/shop";

const shopAll = { category: "all", sort: "featured", q: "" } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "ORU — Objects for the table" }],
  }),
  component: Home,
});

function Home() {
  const products = useCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const hero = [
    products.find((product) => product.slug === "indigo-loom-throw"),
    products.find((product) => product.slug === "abeokuta-clay-jug"),
    products.find((product) => product.slug === "slender-brass-sticks"),
  ].flatMap((product) => (product ? [product] : []));

  return (
    <main id="main">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-xs tracking-widest text-muted uppercase">Yaba, Lagos</p>
          <h1 className="mt-4 text-5xl leading-none md:text-7xl">Objects for a quieter table.</h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            {products.length} pieces from weavers, clay studios, and a brass bench. Made in small
            runs. Reserved here, dispatched from the house.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              search={shopAll}
              className="inline-flex min-h-11 items-center bg-clay px-5 text-sm text-surface"
            >
              Shop the edit
            </Link>
            <a
              href="#atelier"
              className="inline-flex min-h-11 items-center border border-line px-5 text-sm"
            >
              Read the house
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {hero[0] ? (
            <ProductMark
              tone={hero[0].tone}
              motif={hero[0].motif}
              name={hero[0].name}
              className="col-span-2 aspect-4/3"
            />
          ) : null}
          {hero[1] ? (
            <ProductMark
              tone={hero[1].tone}
              motif={hero[1].motif}
              name={hero[1].name}
              className="aspect-square"
            />
          ) : null}
          {hero[2] ? (
            <ProductMark
              tone={hero[2].tone}
              motif={hero[2].motif}
              name={hero[2].name}
              className="aspect-square"
            />
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-4xl">The edit</h2>
          <Link to="/shop" search={shopAll} className="text-sm text-muted underline-offset-2 hover:underline">
            All pieces
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <h2 className="text-4xl">Rooms</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const sample = products.find((product) => product.category === category);
            const count = products.filter((product) => product.category === category).length;
            return (
              <Link
                key={category}
                to="/shop"
                search={{ ...shopAll, category }}
                className="border border-line bg-surface p-4"
              >
                {sample ? (
                  <ProductMark
                    tone={sample.tone}
                    motif={sample.motif}
                    name={category}
                    className="aspect-4/3 w-full"
                  />
                ) : (
                  <div className="aspect-4/3 w-full bg-sand" />
                )}
                <p className="mt-4 font-display text-2xl">{category}</p>
                <p className="text-sm text-muted">{count} in the house</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="atelier" className="bg-ink text-bg">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <h2 className="text-4xl md:text-5xl">A house, not a warehouse.</h2>
          <div className="max-w-md text-bg/80">
            <p>
              ORU keeps a short list. Cloth from an Ibadan loom, clay from Abeokuta, brass raised in
              Lagos, scent poured down the road in Yaba. If a piece is here, there are only a few of
              them.
            </p>
            <p className="mt-4">
              Reserving a bag writes the pieces and the total into the order book. Your name and
              address stay on this device for the receipt. Nothing is charged.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
        {[
          ["01", "Choose", "Filter by room, or search a material. Every price is the studio price."],
          ["02", "Reserve", "The bag checks live stock. A receipt code is the only record we keep."],
          ["03", "Dispatch", "Orders leave Yaba. Over the threshold, dispatch is on the house."],
        ].map(([index, title, copy]) => (
          <div key={index} className="border-t border-line pt-4">
            <p className="text-xs tracking-widest text-muted">{index}</p>
            <h3 className="mt-3 text-2xl">{title}</h3>
            <p className="mt-2 text-sm text-muted">{copy}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
