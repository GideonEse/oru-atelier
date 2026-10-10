import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-5 py-20">
      <p className="text-xs tracking-widest text-muted uppercase">Missing</p>
      <h1 className="mt-3 text-5xl">That page is not in the house.</h1>
      <p className="mt-4 max-w-md text-muted">The piece may have moved. The shop is still open.</p>
      <Link
        to="/shop"
        search={{ category: "all", sort: "featured", q: "" }}
        className="mt-8 inline-flex min-h-11 items-center self-start bg-clay px-5 text-sm text-surface"
      >
        Back to the shop
      </Link>
    </main>
  );
}
