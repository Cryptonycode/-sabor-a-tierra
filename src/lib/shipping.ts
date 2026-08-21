/**
 * Única fuente de verdad de los gastos de envío.
 *
 * La importan tanto el carrito y el checkout (cliente) como la creación del
 * pedido (servidor) para que el importe mostrado y el guardado en la tabla
 * `orders` no puedan divergir. No añadir aquí dependencias de servidor.
 */

// Tramos por peso total del pedido en kg. El límite es inclusivo.
export const SHIPPING_TIERS = [
  { maxWeightKg: 4, cost: 3.90 },
  { maxWeightKg: 10, cost: 4.45 },
  { maxWeightKg: 15, cost: 5.90 }
] as const;

// Tarifa plana por encima del último tramo, sin límite de peso.
export const SHIPPING_COST_OVER_MAX_WEIGHT = 10.95;

export interface ShippableLine {
  weight?: number | null;
  quantity: number;
}

export const calculateTotalWeight = (lines: ShippableLine[]): number =>
  lines.reduce((total, line) => {
    const weight = Number(line.weight) || 0;
    const quantity = Number(line.quantity) || 0;
    return total + weight * quantity;
  }, 0);

export const calculateShippingCost = (totalWeightKg: number): number => {
  const weight = Number(totalWeightKg) || 0;
  const tier = SHIPPING_TIERS.find((candidate) => weight <= candidate.maxWeightKg);

  return tier ? tier.cost : SHIPPING_COST_OVER_MAX_WEIGHT;
};

export const calculateShippingCostForLines = (lines: ShippableLine[]): number =>
  calculateShippingCost(calculateTotalWeight(lines));
