import { Link } from "@tanstack/react-router";
import { naira } from "@/lib/money";
import type { Product } from "@/lib/shop";
import { ProductMark } from "@/components/product-mark";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col gap-3"
    >
      <ProductMark
        tone={product.tone}
        motif={product.motif}
        name={product.name}
        className="aspect-3/4 w-full transition-transform duration-200 group-hover:-translate-y-0.5"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-muted uppercase">{product.category}</p>
          <h3 className="mt-1 text-xl leading-tight">{product.name}</h3>
        </div>
        <p className="shrink-0 pt-5 text-sm tabular-nums">{naira(product.priceNaira)}</p>
      </div>
      {product.stock === 0 ? (
        <p className="text-xs tracking-widest text-clay uppercase">Sold out</p>
      ) : null}
    </Link>
  );
}
