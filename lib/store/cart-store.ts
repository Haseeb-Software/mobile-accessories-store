import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  price: number; // effective unit price (sale price if present)
  imageUrl: string;
  stockQuantity: number;
  variantLabel?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantLabel?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantLabel?: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === newItem.productId && i.variantLabel === newItem.variantLabel
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const nextQty = Math.min(
              updated[existingIndex].quantity + newItem.quantity,
              newItem.stockQuantity
            );
            updated[existingIndex] = { ...updated[existingIndex], quantity: nextQty };
            return { items: updated };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, variantLabel) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantLabel === variantLabel)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantLabel) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantLabel === variantLabel
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stockQuantity)) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "mobile-shop-cart" }
  )
);
