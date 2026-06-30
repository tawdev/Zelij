'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface AreaMetadata {
  width: number;
  height: number;
  numberOfAreas: number;
  totalAreaM2: number;
  wastageApplied: boolean;
  finalAreaM2: number;
  boxesNeeded: number;
}

export interface CartItem {
  cartItemId: string;
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  slug?: string;
  quantity: number;
  boxes?: number;
  area?: AreaMetadata | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'boxes' | 'area' | 'cartItemId'>, quantity?: number, boxes?: number, area?: AreaMetadata) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateItemDimensions: (cartItemId: string, width: number, height: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getQuantity: (productId: number) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'zelij_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items: CartItem[] = raw ? JSON.parse(raw) : [];
    return items.map((item) =>
      item.cartItemId ? item : { ...item, cartItemId: `${item.productId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity' | 'boxes' | 'area' | 'cartItemId'>, quantity = 1, boxes?: number, area?: AreaMetadata) => {
      setCartItems((prev) => {
        const key = area ? `${item.productId}-area` : `${item.productId}`;
        const existing = prev.find((i) => {
          if (area && i.area) {
            return i.productId === item.productId &&
              i.area.width === area.width &&
              i.area.height === area.height &&
              i.area.wastageApplied === area.wastageApplied;
          }
          return !i.area && i.productId === item.productId;
        });
        if (existing) {
          return prev.map((i) =>
            i === existing
              ? { ...i, quantity: i.quantity + quantity, price: Number(i.price) + Number(item.price), boxes: (i.boxes || 0) + (boxes || 0) }
              : i
          );
        }
        return [...prev, { ...item, cartItemId: `${item.productId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, price: Number(item.price), quantity, boxes: boxes || quantity, area: area || null }];
      });
    },
    []
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  const updateItemDimensions = useCallback((cartItemId: string, width: number, height: number) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.cartItemId !== cartItemId || !i.area) return i;
        const oldArea = i.area.totalAreaM2;
        const newArea = width * height;
        const unitPrice = oldArea > 0 ? Number(i.price) / oldArea : 0;
        return {
          ...i,
          quantity: newArea,
          price: unitPrice * newArea,
          area: { ...i.area, width, height, totalAreaM2: newArea },
        };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: number) => cartItems.some((i) => i.productId === productId),
    [cartItems]
  );

  const getQuantity = useCallback(
    (productId: number) => cartItems.find((i) => i.productId === productId)?.quantity || 0,
    [cartItems]
  );

  const totalItems = cartItems.length;
  const totalPrice = cartItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemDimensions,
        clearCart,
        isInCart,
        getQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
