'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartState, CartContextType, Product, CartItem } from '@/types/cart';

// Estado inicial del carrito
const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
};

// Tipos de acciones del reducer
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Funciones auxiliares
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { totalItems, totalPrice };
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

// Reducer del carrito
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      let newItems: CartItem[];
      
      if (existingItem) {
        // Si el producto ya existe, aumentar cantidad
        newItems = state.items.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price
              }
            : item
        );
      } else {
        // Si es un producto nuevo, añadirlo
        const newItem: CartItem = {
          ...product,
          quantity: 1,
          subtotal: product.price
        };
        newItems = [...state.items, newItem];
      }
      
      const { totalItems, totalPrice } = calculateTotals(newItems);
      saveCartToStorage(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { totalItems, totalPrice } = calculateTotals(newItems);
      saveCartToStorage(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, eliminar el producto
        const newItems = state.items.filter(item => item.id !== id);
        const { totalItems, totalPrice } = calculateTotals(newItems);
        saveCartToStorage(newItems);
        
        return {
          ...state,
          items: newItems,
          totalItems,
          totalPrice,
        };
      }
      
      const newItems = state.items.map(item =>
        item.id === id
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.price
            }
          : item
      );
      
      const { totalItems, totalPrice } = calculateTotals(newItems);
      saveCartToStorage(newItems);
      
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      };
    }
    
    case 'CLEAR_CART':
      saveCartToStorage([]);
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };
    
    case 'LOAD_CART': {
      const { totalItems, totalPrice } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
      };
    }
    
    default:
      return state;
  }
};

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider del carrito
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: savedCart });
    }
  }, []);

  // Funciones del contexto
  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};


