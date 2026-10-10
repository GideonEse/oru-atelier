export const FREE_DISPATCH_FROM = 80_000;
export const DISPATCH_NAIRA = 3_500;

export function naira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function dispatchFor(goodsNaira: number): number {
  if (goodsNaira <= 0) return 0;
  return goodsNaira >= FREE_DISPATCH_FROM ? 0 : DISPATCH_NAIRA;
}
