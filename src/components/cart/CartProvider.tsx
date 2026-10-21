"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartLine } from "@/commerce/types";
import { products } from "@/data/products";
import type { Product, VariantOption } from "@/data/types";

const STORAGE_KEY = "kutak.cart.v1";
export const MAX_QTY = 20;

export interface CartItem extends CartLine {
  product: Product;
  option: VariantOption | null;
  lineTotal: number;
}

interface CartValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (productId: string, optionId: string | null, quantity: number) => void;
  setQuantity: (productId: string, optionId: string | null, quantity: number) => void;
  remove: (productId: string, optionId: string | null) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Last message for the polite live region (screen readers). */
  announcement: string;
  announce: (message: string) => void;
}

const CartContext = createContext<CartValue | null>(null);

function sameLine(a: CartLine, productId: string, optionId: string | null) {
  return a.productId === productId && a.optionId === optionId;
}

function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const out: CartLine[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const { productId, optionId, quantity } = r as Record<string, unknown>;
    const product = products.find((p) => p.id === productId);
    if (!product || typeof quantity !== "number") continue;
    const opt = typeof optionId === "string" ? optionId : null;
    if (product.variants ? !product.variants.options.some((o) => o.id === opt) : opt !== null) continue;
    out.push({ productId: product.id, optionId: opt, quantity: Math.min(MAX_QTY, Math.max(1, Math.floor(quantity))) });
  }
  return out;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const loaded = useRef(false);

  // Load once on the client. Storage can be unavailable (private mode) — the cart then lives in memory.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(sanitize(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    loaded.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setLines(sanitize(e.newValue ? JSON.parse(e.newValue) : []));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((productId: string, optionId: string | null, quantity: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, productId, optionId));
      if (existing) {
        return prev.map((l) =>
          sameLine(l, productId, optionId) ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l,
        );
      }
      return [...prev, { productId, optionId, quantity: Math.min(MAX_QTY, Math.max(1, quantity)) }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, optionId: string | null, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => !sameLine(l, productId, optionId))
        : prev.map((l) => (sameLine(l, productId, optionId) ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
    );
  }, []);

  const remove = useCallback((productId: string, optionId: string | null) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, productId, optionId)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const announce = useCallback((message: string) => {
    // Reset first so repeating the same message is announced again.
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 40);
  }, []);

  const value = useMemo<CartValue>(() => {
    const items: CartItem[] = [];
    for (const l of lines) {
      const product = products.find((p) => p.id === l.productId);
      if (!product) continue;
      const option = product.variants?.options.find((o) => o.id === l.optionId) ?? null;
      items.push({ ...l, product, option, lineTotal: Math.round(product.price * l.quantity * 100) / 100 });
    }
    return {
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100,
      ready,
      add,
      setQuantity,
      remove,
      clear,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      announcement,
      announce,
    };
  }, [lines, ready, add, setQuantity, remove, clear, drawerOpen, announcement, announce]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart must be used inside <CartProvider>");
  return v;
}
