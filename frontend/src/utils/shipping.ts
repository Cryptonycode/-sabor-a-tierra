/**
 * Calcula el costo de envío basado en el peso total del pedido
 * @param weightInKg - Peso total en kilogramos
 * @returns Costo de envío en euros
 */
export function calculateShippingByWeight(weightInKg: number): number {
  if (weightInKg <= 0) return 0;
  
  if (weightInKg <= 4) {
    return 3.90;
  } else if (weightInKg <= 10) {
    return 4.45;
  } else if (weightInKg <= 15) {
    return 5.90;
  } else if (weightInKg <= 20) {
    return 10.95;
  } else {
    // Peso superior a 20kg - retornar valor especial para detectar error
    return -1;
  }
}

/**
 * Verifica si el peso del pedido excede el límite permitido
 * @param weightInKg - Peso total en kilogramos
 * @returns true si excede el límite, false en caso contrario
 */
export function exceedsWeightLimit(weightInKg: number): boolean {
  return weightInKg > 20;
}

/**
 * Obtiene un mensaje descriptivo del tramo de envío
 * @param weightInKg - Peso total en kilogramos
 * @returns Descripción del tramo de envío
 */
export function getShippingDescription(weightInKg: number): string {
  if (weightInKg <= 0) return 'Sin peso';
  if (weightInKg <= 4) return '0-4kg: €3,90';
  if (weightInKg <= 10) return '4-10kg: €4,45';
  if (weightInKg <= 15) return '10-15kg: €5,90';
  if (weightInKg <= 20) return '15-20kg: €10,95';
  return 'Peso excedido (máx 20kg)';
}

