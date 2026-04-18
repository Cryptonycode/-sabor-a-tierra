export interface ProductBase {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  unit: 'kg' | 'caja';
  category: string;
}

export interface ProductDetailed extends ProductBase {
  farmer: {
    name: string;
    location: string;
    coordinates: string;
    story: string;
    image: string;
  };
  sizes: Array<{
    name: string;
    weight: string;
    pieces: string;
    price: number;
    discount: number;
  }>;
  description: string;
  features: string[];
  nutritionalInfo: string;
  storage: string;
  season: string;
}

// Productos base para listados
export const allProducts: ProductBase[] = [
  {
    id: 1,
    name: 'Tomates Raf',
    price: 4.99,
    imageUrl: 'https://images.pexels.com/photos/9475238/pexels-photo-9475238.jpeg?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'vegetables',
  },
  {
    id: 2,
    name: 'Aceite de Oliva Virgen Extra',
    price: 12.99,
    imageUrl: 'https://images.pexels.com/photos/4197440/pexels-photo-4197440.jpeg?w=500&h=500&fit=crop',
    unit: 'caja',
    category: 'oils',
  },
  {
    id: 3,
    name: 'Naranjas Ecológicas',
    price: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'fruits',
  },
  {
    id: 4,
    name: 'Aguacates Hass',
    price: 5.99,
    imageUrl: 'https://images.pexels.com/photos/3687927/pexels-photo-3687927.jpeg?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'fruits',
  },
  {
    id: 5,
    name: 'Pimientos Rojos',
    price: 3.49,
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'vegetables',
  },
  {
    id: 6,
    name: 'Lechugas Iceberg',
    price: 1.99,
    imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'vegetables',
  },
  {
    id: 7,
    name: 'Limones',
    price: 2.99,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'fruits',
  },
  {
    id: 8,
    name: 'Queso de Cabra',
    price: 8.99,
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&h=500&fit=crop',
    unit: 'caja',
    category: 'dairy',
  },
  {
    id: 9,
    name: 'Zanahorias Baby',
    price: 2.49,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'vegetables',
  },
  {
    id: 10,
    name: 'Manzanas Golden',
    price: 3.29,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'fruits',
  },
  {
    id: 11,
    name: 'Aceite de Girasol',
    price: 6.99,
    imageUrl: 'https://images.pexels.com/photos/4197440/pexels-photo-4197440.jpeg?w=500&h=500&fit=crop',
    unit: 'caja',
    category: 'oils',
  },
  {
    id: 12,
    name: 'Lentejas Rojas',
    price: 4.49,
    imageUrl: 'https://images.unsplash.com/photo-1586825883498-e8a4ff1b6c2a?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'grains',
  },
  {
    id: 13,
    name: 'Yogur Natural',
    price: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=500&fit=crop',
    unit: 'caja',
    category: 'dairy',
  },
  {
    id: 14,
    name: 'Calabacines',
    price: 2.79,
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'vegetables',
  },
  {
    id: 15,
    name: 'Arroz Bomba',
    price: 5.99,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop',
    unit: 'kg',
    category: 'grains',
  },
];

// Productos detallados para páginas específicas
export const allProductsDetailed: ProductDetailed[] = [
  {
    id: 1,
    name: 'Tomates Raf',
    price: 4.99,
    imageUrl: 'https://images.pexels.com/photos/9475238/pexels-photo-9475238.jpeg?w=800&h=600&fit=crop',
    unit: 'kg',
    category: 'vegetables',
    farmer: {
      name: 'María García',
      location: 'Almería, Andalucía',
      coordinates: '36°44\'31.3"N 3°28\'28.1"W',
      story: 'Soy María García y cultivo tomates desde hace más de 20 años en los invernaderos de Almería. Mi familia lleva generaciones dedicándose a la agricultura, y hemos perfeccionado el arte de cultivar los mejores tomates Raf. Utilizamos técnicas sostenibles y respetamos los ciclos naturales de la tierra.',
      image: 'https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg?w=400&h=400&fit=crop',
    },
    sizes: [
      { name: 'Pequeña', weight: '1kg', pieces: '8-12 piezas aprox', price: 3.99, discount: 0 },
      { name: 'Mediana', weight: '2kg', pieces: '16-24 piezas aprox', price: 4.99, discount: 5 },
      { name: 'Grande', weight: '3kg', pieces: '24-36 piezas aprox', price: 6.99, discount: 10 },
    ],
    description: 'Tomates Raf de agricultura ecológica, cultivados sin pesticidas en invernaderos sostenibles. Sabor intenso y textura carnosa perfecta para ensaladas.',
    features: [
      'Cultivado sin pesticidas',
      'Agricultura ecológica certificada',
      'Recogido en su punto óptimo de maduración',
      'Transporte refrigerado para mantener frescura',
    ],
    nutritionalInfo: 'Rico en licopeno, vitamina C y antioxidantes. Bajo en calorías (18 kcal/100g).',
    storage: 'Conservar a temperatura ambiente. Duración 6-8 días.',
    season: 'Octubre - Junio',
  },
  {
    id: 2,
    name: 'Aceite de Oliva Virgen Extra',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop',
    unit: 'caja',
    category: 'oils',
    farmer: {
      name: 'Juan Martínez',
      location: 'Jaén, Andalucía',
      coordinates: '37°46\'3.6"N 3°47\'6.1"W',
      story: 'Mi familia produce aceite de oliva desde 1920 en los olivares de Jaén. Nuestros olivos centenarios dan un aceite de calidad excepcional. Cuidamos cada detalle desde el cultivo hasta el embotellado, manteniendo las tradiciones familiares.',
      image: 'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg?w=400&h=400&fit=crop',
    },
    sizes: [
      { name: 'Botella 500ml', weight: '500ml', pieces: '1 botella', price: 8.99, discount: 0 },
      { name: 'Pack 2 botellas', weight: '1L', pieces: '2 botellas de 500ml', price: 12.99, discount: 15 },
      { name: 'Pack Familiar', weight: '2.5L', pieces: '5 botellas de 500ml', price: 24.99, discount: 20 },
    ],
    description: 'Aceite de oliva virgen extra de primera presión en frío. Elaborado con aceitunas picual de nuestros olivares centenarios.',
    features: [
      'Primera presión en frío',
      'Acidez inferior a 0.3°',
      'Olivares centenarios',
      'Proceso artesanal tradicional',
    ],
    nutritionalInfo: 'Rico en vitamina E y antioxidantes. Ácidos grasos monoinsaturados (899 kcal/100ml).',
    storage: 'Conservar en lugar fresco y seco, protegido de la luz. Duración 24 meses.',
    season: 'Disponible todo el año',
  },
  {
    id: 3,
    name: 'Naranjas Ecológicas',
    price: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=600&fit=crop',
    unit: 'kg',
    category: 'fruits',
    farmer: {
      name: 'Ana López',
      location: 'Valencia, Comunidad Valenciana',
      coordinates: '39°28\'16.8"N 0°22\'32.4"W',
      story: 'Cultivo naranjas ecológicas en los campos valencianos siguiendo métodos tradicionales. Mi objetivo es producir las naranjas más dulces y jugosas, respetando el medio ambiente y ofreciendo un producto 100% natural.',
      image: 'https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?w=400&h=400&fit=crop',
    },
    sizes: [
      { name: 'Pequeña', weight: '2kg', pieces: '12-16 piezas aprox', price: 3.99, discount: 0 },
      { name: 'Mediana', weight: '5kg', pieces: '30-40 piezas aprox', price: 8.99, discount: 8 },
      { name: 'Grande', weight: '10kg', pieces: '60-80 piezas aprox', price: 15.99, discount: 15 },
    ],
    description: 'Naranjas Valencia Late de cultivo ecológico. Perfectas para zumo o consumo directo. Recogidas en su punto óptimo de maduración.',
    features: [
      'Cultivo 100% ecológico',
      'Sin tratamientos químicos',
      'Recogida del árbol bajo pedido',
      'Máxima frescura garantizada',
    ],
    nutritionalInfo: 'Rica en vitamina C, fibra y antioxidantes. (47 kcal/100g).',
    storage: 'Conservar en lugar fresco. Duración 2-3 semanas en nevera.',
    season: 'Noviembre - Mayo',
  },
  {
    id: 4,
    name: 'Aguacates Hass',
    price: 5.99,
    imageUrl: 'https://images.pexels.com/photos/3687927/pexels-photo-3687927.jpeg?w=800&h=600&fit=crop',
    unit: 'kg',
    category: 'fruits',
    farmer: {
      name: 'Manuel Barba',
      location: 'Granada, Andalucía',
      coordinates: '36°44\'31.3"N 3°28\'28.1"W',
      story: 'Me llamo Manuel Barba y soy agricultor en la Costa Tropical de Granada. Vengo de una familia con raíces profundas en el campo: abuelos, tíos y primos han trabajado la tierra desde siempre, cultivando hortalizas como pepino, tomate, calabacín o berenjena. Crecí entre invernaderos y surcos.',
      image: 'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg?w=400&h=400&fit=crop',
    },
    sizes: [
      { name: 'Pequeña', weight: '1.25kg', pieces: '15-18 piezas aprox', price: 4.99, discount: 0 },
      { name: 'Grande', weight: '2.5kg', pieces: '30-36 piezas aprox', price: 5.99, discount: 7 },
    ],
    description: 'Aguacates Hass cultivados en la Costa Tropical de Granada. Textura cremosa y sabor intenso, perfectos para cualquier momento del día.',
    features: [
      'Variedad Hass premium',
      'Cultivo subtropical',
      'Maduración controlada',
      'Transporte especializado',
    ],
    nutritionalInfo: 'Rico en grasas saludables, vitamina K y folato. (160 kcal/100g).',
    storage: 'Conservar a temperatura ambiente hasta madurar, luego refrigerar. Duración 6-8 días a temperatura ambiente y 8-10 en nevera.',
    season: 'Disponible todo el año',
  },
  // Para los productos restantes, voy a crear datos básicos
  {
    id: 5,
    name: 'Pimientos Rojos',
    price: 3.49,
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=600&fit=crop',
    unit: 'kg',
    category: 'vegetables',
    farmer: {
      name: 'Carmen Ruiz',
      location: 'Murcia, Región de Murcia',
      coordinates: '37°59\'13.2"N 1°07\'57.6"W',
      story: 'Llevo 15 años cultivando pimientos en la huerta murciana. Mis pimientos rojos se caracterizan por su dulzor y su color intenso. Utilizo técnicas de agricultura integrada que respetan el medio ambiente.',
      image: 'https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?w=400&h=400&fit=crop',
    },
    sizes: [
      { name: 'Pequeña', weight: '1kg', pieces: '6-8 piezas aprox', price: 3.49, discount: 0 },
      { name: 'Mediana', weight: '2kg', pieces: '12-16 piezas aprox', price: 6.49, discount: 8 },
      { name: 'Grande', weight: '3kg', pieces: '18-24 piezas aprox', price: 8.99, discount: 12 },
    ],
    description: 'Pimientos rojos dulces cultivados en la huerta murciana. Perfectos para asados, ensaladas o rellenos.',
    features: [
      'Cultivo en huerta tradicional',
      'Variedades dulces seleccionadas',
      'Recogidos en su punto óptimo',
      'Sin tratamientos químicos agresivos',
    ],
    nutritionalInfo: 'Rico en vitamina C, betacarotenos y antioxidantes. (31 kcal/100g).',
    storage: 'Conservar en nevera. Duración 7-10 días.',
    season: 'Mayo - Octubre',
  },
  {
    id: 6,
    name: 'Lechugas Iceberg',
    price: 1.99,
    imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=600&fit=crop',
    unit: 'kg',
    category: 'vegetables',
    farmer: {
      name: 'Pedro Jiménez',
      location: 'Almería, Andalucía',
      coordinates: '36°50\'12.5"N 2°27\'45.8"W',
      story: 'Cultivo lechugas en invernaderos tecnológicos de Almería. Mi especialidad son las lechugas iceberg crujientes y frescas, perfectas para ensaladas.',
      image: 'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg?w=400&h=400&fit=crop',
    },
    sizes: [
      { name: 'Unidad', weight: '400g', pieces: '1 pieza aprox', price: 1.99, discount: 0 },
      { name: 'Pack 3 uds', weight: '1.2kg', pieces: '3 piezas aprox', price: 4.99, discount: 10 },
      { name: 'Pack 5 uds', weight: '2kg', pieces: '5 piezas aprox', price: 7.99, discount: 15 },
    ],
    description: 'Lechugas iceberg crujientes y refrescantes, cultivadas en invernaderos de última generación.',
    features: [
      'Cultivo hidropónico',
      'Máxima frescura',
      'Textura crujiente',
      'Lista para consumir',
    ],
    nutritionalInfo: 'Rica en agua, vitaminas A y K, y folato. (14 kcal/100g).',
    storage: 'Conservar en nevera. Duración 5-7 días.',
    season: 'Disponible todo el año',
  },
];

// Función para obtener un producto por ID con datos completos
export function getProductById(id: number): ProductDetailed | null {
  return allProductsDetailed.find(product => product.id === id) || null;
}

// Función para obtener todos los productos base
export function getAllProducts(): ProductBase[] {
  return allProducts;
}


