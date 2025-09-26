export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  unit: 'kg' | 'caja';
  category?: string;
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
}

export interface CartContextType {
  cart: CartState;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}


