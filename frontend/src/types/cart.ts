export interface Product {
  id: string | number;
  productId?: string;
  variantId?: string;
  name: string;
  price: number;
  main_image_url: string; // Campo oficial de imagen
  unit: string;
  category?: string;
  weight?: number; // Peso en kg por unidad/variante
}

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
  weight?: number; // Peso en kg por unidad/variante
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalWeight: number; // Peso total del carrito en kg
  isOpen: boolean;
  isLoading: boolean;
}

export interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  isLoading: boolean;
}


