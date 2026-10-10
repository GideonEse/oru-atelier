import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  slug: string;
  qty: number;
};

type CartState = {
  items: CartLine[];
  drawerOpen: boolean;
  add: (slug: string, qty?: number, stock?: number) => void;
  setQty: (slug: string, qty: number, stock?: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const MAX_QTY = 8;

function cap(qty: number, stock?: number) {
  const upper = stock === undefined ? MAX_QTY : Math.min(MAX_QTY, Math.max(0, stock));
  return Math.max(0, Math.min(upper, qty));
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      add: (slug, qty = 1, stock) =>
        set((state) => {
          const existing = state.items.find((line) => line.slug === slug);
          const nextQty = cap((existing?.qty ?? 0) + qty, stock);
          if (nextQty < 1) return state;
          const items = existing
            ? state.items.map((line) =>
                line.slug === slug ? { ...line, qty: nextQty } : line,
              )
            : [...state.items, { slug, qty: nextQty }];
          return { items, drawerOpen: true };
        }),
      setQty: (slug, qty, stock) =>
        set((state) => {
          const nextQty = cap(qty, stock);
          if (nextQty < 1) {
            return { items: state.items.filter((line) => line.slug !== slug) };
          }
          return {
            items: state.items.map((line) =>
              line.slug === slug ? { ...line, qty: nextQty } : line,
            ),
          };
        }),
      remove: (slug) =>
        set((state) => ({
          items: state.items.filter((line) => line.slug !== slug),
        })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "oru-bag",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartCount(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + line.qty, 0);
}

export function useBagReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void useCart.persist.rehydrate();
    setReady(true);
  }, []);
  return ready;
}
