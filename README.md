# ORU

A full-stack atelier shop for textiles, ceramics, brass, and scent. The catalog lives in Postgres. The bag lives in the browser. Checkout reserves pieces and writes an order: line items, dispatch, and a total. Names and addresses are not stored on the server.

## Stack

- TanStack Start and React
- Tailwind
- Postgres (Neon when `DATABASE_URL` is set, embedded Postgres otherwise)

## Run

```bash
npm install
npm run dev
```

The shop listens on port 8080. Schema is applied from `migrations/` on startup.

## Shop

- `/` the edit, rooms, and the house note
- `/shop` filter, sort, and search
- `/product/:slug` piece, stock, and related work
- `/cart` and `/checkout` reserve a bag
- `/order/:code` receipt

No card is charged. Stock updates when an order is written.
