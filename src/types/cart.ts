export interface Product {
  id: string;
  productId?: string;
  variantId?: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
  category?: string;
  weight?: number; // Peso en kg para cálculo de envío
}

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  isLoading: boolean;
}

export interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  isLoading: boolean;
}


