import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem, MenuItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  setInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
  restaurantId: string | null;
  setRestaurantId: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const addItem: CartContextValue['addItem'] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.menuItemId === item.id);
      if (existing) {
        return prev.map((p) =>
          p.menuItemId === item.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity,
          prepTime: item.prepTime,
          prepCategory: item.prepCategory,
        },
      ];
    });
  };

  const updateQuantity: CartContextValue['updateQuantity'] = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) => prev.map((p) => (p.menuItemId === menuItemId ? { ...p, quantity } : p)));
  };

  const removeItem: CartContextValue['removeItem'] = (menuItemId) => {
    setItems((prev) => prev.filter((p) => p.menuItemId !== menuItemId));
  };

  const setInstructions: CartContextValue['setInstructions'] = (menuItemId, instructions) => {
    setItems((prev) => prev.map((p) => (p.menuItemId === menuItemId ? { ...p, instructions } : p)));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, setInstructions, clearCart, total, count, restaurantId, setRestaurantId }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
