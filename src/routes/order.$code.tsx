import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getOrder } from "@/lib/shop";
import { naira } from "@/lib/money";

type LocalReceipt = {
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
};

export const Route = createFileRoute("/order/$code")({
  loader: ({ params }) => getOrder({ data: params.code }),
  head: ({ params }) => ({
    meta: [{ title: `Receipt ${params.code} — ORU` }],
  }),
  component: OrderPage,
});

function OrderPage() {
  const order = Route.useLoaderData();
  const { code } = Route.useParams();
  const [local, setLocal] = useState<LocalReceipt | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("oru-receipt");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as LocalReceipt;
      if (parsed.code === code) setLocal(parsed);
    } catch {
      setLocal(null);
    }
  }, [code]);

  if (!order) {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="text-5xl">No receipt under that code.</h1>
        <p className="mt-4 text-muted">Check the letters. Codes look like ORU- followed by six characters.</p>
      </main>
    );
  }

  const first = local?.name.split(/\s+/)[0];

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-5 py-12">
      <p className="text-xs tracking-widest text-muted uppercase">Reserved</p>
      <h1 className="mt-3 text-5xl">{first ? `${first}, it is in the book.` : "It is in the book."}</h1>
      <p className="mt-4 font-display text-3xl tracking-wide tabular-nums">{order.code}</p>
      <p className="mt-4 max-w-md text-muted">
        Nothing was charged. Show this code if you write to the studio. The order book holds the
        pieces and the total only.
      </p>
      {local ? (
        <div className="mt-8 border border-line bg-surface p-5 text-sm">
          <p className="text-xs tracking-widest text-muted uppercase">On this device</p>
          <p className="mt-3">{local.name}</p>
          <p>{local.address}</p>
          <p>
            {local.city}
          </p>
          <p className="mt-2 text-muted">
            {local.email} · {local.phone}
          </p>
        </div>
      ) : null}
      <ul className="mt-8 flex flex-col gap-3">
        {order.items.map((line) => (
          <li key={line.slug} className="flex justify-between gap-3 border-b border-line pb-3 text-sm">
            <span>
              {line.name}
              <span className="text-muted"> × {line.qty}</span>
            </span>
            <span className="tabular-nums">{naira(line.unitNaira * line.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted">Dispatch</span>
        <span className="tabular-nums">
          {order.dispatchNaira === 0 ? "Included" : naira(order.dispatchNaira)}
        </span>
      </div>
      <div className="mt-2 flex justify-between text-xl">
        <span>Total</span>
        <span className="tabular-nums">{naira(order.totalNaira)}</span>
      </div>
      <Link
        to="/shop"
        search={{ category: "all", sort: "featured", q: "" }}
        className="mt-10 inline-flex min-h-11 items-center border border-line px-5 text-sm"
      >
        Keep looking
      </Link>
    </main>
  );
}
