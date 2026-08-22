/**
 * Selección de variante para los listados de catálogo.
 *
 * En esta tienda el producto base solo existe como precio orientativo por kilo:
 * lo que se vende siempre es una variante (una caja). Las tarjetas de producto
 * no tienen selector, así que añaden la variante vendible más barata.
 */

export interface ProductVariant {
  id: string;
  name: string;
  price: number | string | null;
  weight?: number | string | null;
  unit?: string | null;
  is_active?: boolean | null;
}

// Se replican las mismas reglas que aplica el servidor en resolveLinePricing:
// si el carrito propone una variante inactiva o sin precio, el checkout la
// rechazaría al crear el pedido.
export const isSellableVariant = (variant: ProductVariant | null | undefined): boolean => {
  if (!variant?.id) return false;
  if (variant.is_active === false) return false;

  const price = Number(variant.price);
  return Number.isFinite(price) && price > 0;
};

export const pickCheapestVariant = (
  variants: ProductVariant[] | null | undefined
): ProductVariant | null => {
  if (!Array.isArray(variants)) return null;

  return variants.filter(isSellableVariant).reduce<ProductVariant | null>((cheapest, variant) => {
    // El > deja ganar a la primera variante en caso de empate, para que la
    // tarjeta no cambie de opción entre renderizados.
    if (!cheapest || Number(cheapest.price) > Number(variant.price)) {
      return variant;
    }
    return cheapest;
  }, null);
};
