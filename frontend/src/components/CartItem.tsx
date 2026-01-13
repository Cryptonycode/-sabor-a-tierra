import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  showImage?: boolean;
  compact?: boolean;
}

export default function CartItem({ item, showImage = true, compact = false }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          {showImage && (
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded flex-shrink-0">
              <Image
                src={(item as any).main_image_url || item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-800 truncate">{item.name}</h4>
            <p className="text-xs text-gray-500 uppercase">
              {item.unit}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors"
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs sm:text-sm font-medium transition-colors"
            >
              +
            </button>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-accent min-w-[40px] sm:min-w-[50px] text-right">
            {item.subtotal.toFixed(2)}€
          </span>
          <button
            onClick={handleRemove}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors text-xs sm:text-sm"
            title="Eliminar producto"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center space-x-3 flex-1">
        {showImage && (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg flex-shrink-0">
            <Image
              src={(item as any).main_image_url || item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">{item.name}</h3>
          <p className="text-sm sm:text-base text-gray-600 uppercase">
            {item.unit}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
        {/* Control de cantidad */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium transition-colors text-sm"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium transition-colors text-sm"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[60px] sm:min-w-[80px]">
          <p className="text-base sm:text-lg font-semibold text-accent">
            {item.subtotal.toFixed(2)}€
          </p>
        </div>

        {/* Botón eliminar */}
        <button
          onClick={handleRemove}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 font-bold transition-colors text-sm"
          title="Eliminar producto"
        >
          ×
        </button>
      </div>
    </div>
  );
}


