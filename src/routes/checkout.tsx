import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCatalog } from "@/components/site-frame";
import { useBagReady, useCart } from "@/lib/cart";
import { dispatchFor, naira } from "@/lib/money";
import { placeOrder } from "@/lib/shop";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Reserve — ORU" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const products = useCatalog();
  const ready = useBagReady();
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const reserve = useServerFn(placeOrder);
  const navigate = useNavigate();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lagos");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const lines = items.flatMap((line) => {
    const product = products.find((item) => item.slug === line.slug);
    return product ? [{ line, product }] : [];
  });
  const goods = lines.reduce((sum, entry) => sum + entry.product.priceNaira * entry.line.qty, 0);
  const dispatch = dispatchFor(goods);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Add the name for this receipt.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email does not look usable.");
      return;
    }
    if (phone.trim().length < 7) {
      setError("Add a phone number for dispatch.");
      return;
    }
    if (address.trim().length < 6) {
      setError("Add a street address.");
      return;
    }
    setPending(true);
    try {
      const order = await reserve({
        data: { items: lines.map(({ line }) => ({ slug: line.slug, qty: line.qty })) },
      });
      sessionStorage.setItem(
        "oru-receipt",
        JSON.stringify({
          code: order.code,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city,
          address: address.trim(),
        }),
      );
      clear();
      await router.invalidate();
      await navigate({ to: "/order/$code", params: { code: order.code } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The reserve did not go through.");
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="text-5xl">Reserve</h1>
        <p className="mt-4 text-muted">Opening your bag…</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="text-5xl">Nothing to reserve.</h1>
        <Link
          to="/shop"
          search={{ category: "all", sort: "featured", q: "" }}
          className="mt-8 inline-flex min-h-11 items-center bg-clay px-5 text-sm text-surface"
        >
          Return to the shop
        </Link>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-10 md:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <p className="text-xs tracking-widest text-muted uppercase">Desk</p>
        <h1 className="text-5xl">Reserve</h1>
        <p className="max-w-md text-muted">
          No card is taken. We write the pieces and the total into the order book. Your name and
          address stay in this browser so the receipt can greet you. They are not stored on the server.
        </p>
        <Field label="Full name" value={name} onChange={setName} autoComplete="name" />
        <Field label="Email" value={email} onChange={setEmail} autoComplete="email" type="email" />
        <Field label="Phone" value={phone} onChange={setPhone} autoComplete="tel" />
        <label className="block text-sm">
          City
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-2 h-11 w-full border border-line bg-surface px-3"
          >
            {["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Enugu", "Elsewhere"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Address
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            autoComplete="street-address"
            rows={3}
            className="mt-2 w-full border border-line bg-surface px-3 py-3"
          />
        </label>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center bg-clay px-5 text-sm text-surface disabled:opacity-50"
        >
          {pending ? "Writing the book…" : `Reserve · ${naira(goods + dispatch)}`}
        </button>
      </form>
      <aside className="h-fit border border-line bg-surface p-5">
        <h2 className="text-2xl">Pieces</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {lines.map(({ line, product }) => (
            <li key={line.slug} className="flex justify-between gap-3 text-sm">
              <span>
                {product.name}
                <span className="text-muted"> × {line.qty}</span>
              </span>
              <span className="tabular-nums">{naira(product.priceNaira * line.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
          <span className="text-muted">Dispatch</span>
          <span className="tabular-nums">{dispatch === 0 ? "Included" : naira(dispatch)}</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span>Total</span>
          <span className="tabular-nums">{naira(goods + dispatch)}</span>
        </div>
      </aside>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full border border-line bg-surface px-3"
      />
    </label>
  );
}
