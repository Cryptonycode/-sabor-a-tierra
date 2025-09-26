export interface Farmer {
  id: number;
  name: string;
  location: string;
  coordinates: string;
  image: string;
  coverImage: string;
  specialties: string[];
  story: string;
  shortDescription: string;
  experience: number;
  certification: string[];
  products: {
    name: string;
    productId: number;
    image: string;
    description: string;
  }[];
  stats: {
    hectares: number;
    yearsExperience: number;
    productsGrown: number;
    customersServed: number;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

export const farmers: Farmer[] = [
  {
    id: 1,
    name: 'María García',
    location: 'Almería, Andalucía',
    coordinates: '36°44\'31.3"N 3°28\'28.1"W',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
    specialties: ['Tomates', 'Pimientos', 'Pepinos'],
    story: 'Soy María García y cultivo tomates desde hace más de 20 años en los invernaderos de Almería. Mi familia lleva generaciones dedicándose a la agricultura, y hemos perfeccionado el arte de cultivar los mejores tomates Raf. Utilizamos técnicas sostenibles y respetamos los ciclos naturales de la tierra. Cada tomate que cultivamos lleva el cariño y la dedicación de toda una vida.',
    shortDescription: 'Especialista en tomates Raf con más de 20 años de experiencia en agricultura sostenible.',
    experience: 20,
    certification: ['Agricultura Ecológica', 'Comercio Justo', 'Sostenibilidad Agrícola'],
    products: [
      {
        name: 'Tomates Raf',
        productId: 1,
        image: 'https://images.unsplash.com/photo-1546094097-5c5f1a0c8c1c?w=300&h=300&fit=crop',
        description: 'Tomates Raf de sabor intenso, cultivados con amor y técnicas tradicionales.'
      }
    ],
    stats: {
      hectares: 5,
      yearsExperience: 20,
      productsGrown: 3,
      customersServed: 1500
    },
    contactInfo: {
      email: 'maria@saboratierra.com',
      phone: '+34 950 123 456'
    }
  },
  {
    id: 2,
    name: 'Juan Martínez',
    location: 'Jaén, Andalucía',
    coordinates: '37°46\'3.6"N 3°47\'6.1"W',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&h=600&fit=crop',
    specialties: ['Aceitunas', 'Aceite de Oliva'],
    story: 'Mi familia produce aceite de oliva desde 1920 en los olivares de Jaén. Nuestros olivos centenarios dan un aceite de calidad excepcional. Cuidamos cada detalle desde el cultivo hasta el embotellado, manteniendo las tradiciones familiares que se han transmitido de generación en generación. El secreto está en la paciencia y el respeto por los tiempos de la naturaleza.',
    shortDescription: 'Productor de aceite de oliva virgen extra de cuarta generación.',
    experience: 25,
    certification: ['Denominación de Origen', 'Agricultura Tradicional', 'Calidad Premium'],
    products: [
      {
        name: 'Aceite de Oliva Virgen Extra',
        productId: 2,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop',
        description: 'Aceite de primera presión en frío de olivares centenarios.'
      }
    ],
    stats: {
      hectares: 15,
      yearsExperience: 25,
      productsGrown: 2,
      customersServed: 3000
    },
    contactInfo: {
      email: 'juan@saboratierra.com',
      phone: '+34 953 789 012'
    }
  },
  {
    id: 3,
    name: 'Ana López',
    location: 'Valencia, Comunidad Valenciana',
    coordinates: '39°28\'16.8"N 0°22\'32.4"W',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=1200&h=600&fit=crop',
    specialties: ['Naranjas', 'Limones', 'Mandarinas'],
    story: 'Cultivo naranjas ecológicas en los campos valencianos siguiendo métodos tradicionales. Mi objetivo es producir las naranjas más dulces y jugosas, respetando el medio ambiente y ofreciendo un producto 100% natural. Cada árbol es cuidado individualmente, y recogemos la fruta en su punto óptimo de maduración para garantizar la máxima calidad.',
    shortDescription: 'Cultivadora de cítricos ecológicos en la huerta valenciana.',
    experience: 15,
    certification: ['Agricultura Ecológica', 'Sin Pesticidas', 'Huerta Tradicional'],
    products: [
      {
        name: 'Naranjas Ecológicas',
        productId: 3,
        image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop',
        description: 'Naranjas Valencia Late perfectas para zumo, recogidas del árbol.'
      }
    ],
    stats: {
      hectares: 8,
      yearsExperience: 15,
      productsGrown: 4,
      customersServed: 2200
    },
    contactInfo: {
      email: 'ana@saboratierra.com',
      phone: '+34 963 456 789'
    }
  },
  {
    id: 4,
    name: 'Manuel Barba',
    location: 'Granada, Andalucía',
    coordinates: '36°44\'31.3"N 3°28\'28.1"W',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1519162584292-56dfc9eb5db4?w=1200&h=600&fit=crop',
    specialties: ['Aguacates', 'Mangos', 'Chirimoyas'],
    story: 'Me llamo Manuel Barba y soy agricultor en la Costa Tropical de Granada. Vengo de una familia con raíces profundas en el campo: abuelos, tíos y primos han trabajado la tierra desde siempre, cultivando hortalizas como pepino, tomate, calabacín o berenjena. Crecí entre invernaderos y surcos, y fue ahí donde entendí que la agricultura no es solo un trabajo: es una forma de vida.',
    shortDescription: 'Especialista en cultivos subtropicales en la Costa Tropical de Granada.',
    experience: 18,
    certification: ['Cultivo Subtropical', 'Agricultura Familiar', 'Calidad Gourmet'],
    products: [
      {
        name: 'Aguacates Hass',
        productId: 4,
        image: 'https://images.unsplash.com/photo-1519162584292-56dfc9eb5db4?w=300&h=300&fit=crop',
        description: 'Aguacates Hass de textura cremosa, cultivados en clima subtropical.'
      }
    ],
    stats: {
      hectares: 12,
      yearsExperience: 18,
      productsGrown: 5,
      customersServed: 1800
    },
    contactInfo: {
      email: 'manuel@saboratierra.com',
      phone: '+34 958 345 678'
    }
  },
  {
    id: 5,
    name: 'Carmen Ruiz',
    location: 'Murcia, Región de Murcia',
    coordinates: '37°59\'13.2"N 1°07\'57.6"W',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=1200&h=600&fit=crop',
    specialties: ['Pimientos', 'Berenjenas', 'Calabacines'],
    story: 'Llevo 15 años cultivando pimientos en la huerta murciana. Mis pimientos rojos se caracterizan por su dulzor y su color intenso. Utilizo técnicas de agricultura integrada que respetan el medio ambiente, combinando la sabiduría tradicional con las mejores prácticas modernas.',
    shortDescription: 'Productora de hortalizas en la huerta tradicional murciana.',
    experience: 15,
    certification: ['Agricultura Integrada', 'Huerta Tradicional', 'Producto Local'],
    products: [
      {
        name: 'Pimientos Rojos',
        productId: 5,
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&h=300&fit=crop',
        description: 'Pimientos rojos dulces perfectos para asados y ensaladas.'
      }
    ],
    stats: {
      hectares: 6,
      yearsExperience: 15,
      productsGrown: 6,
      customersServed: 1200
    },
    contactInfo: {
      email: 'carmen@saboratierra.com',
      phone: '+34 968 234 567'
    }
  },
  {
    id: 6,
    name: 'Pedro Jiménez',
    location: 'Almería, Andalucía',
    coordinates: '36°50\'12.5"N 2°27\'45.8"W',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=1200&h=600&fit=crop',
    specialties: ['Lechugas', 'Espinacas', 'Rúcula'],
    story: 'Cultivo lechugas en invernaderos tecnológicos de Almería. Mi especialidad son las lechugas iceberg crujientes y frescas, perfectas para ensaladas. Combino la tecnología más avanzada con el cuidado artesanal para ofrecer productos de máxima calidad y frescura.',
    shortDescription: 'Especialista en hojas verdes con tecnología de invernadero avanzada.',
    experience: 12,
    certification: ['Cultivo Hidropónico', 'Tecnología Avanzada', 'Frescura Garantizada'],
    products: [
      {
        name: 'Lechugas Iceberg',
        productId: 6,
        image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=300&fit=crop',
        description: 'Lechugas iceberg crujientes cultivadas en hidropónico.'
      }
    ],
    stats: {
      hectares: 4,
      yearsExperience: 12,
      productsGrown: 8,
      customersServed: 800
    },
    contactInfo: {
      email: 'pedro@saboratierra.com',
      phone: '+34 950 876 543'
    }
  }
];

export function getFarmerById(id: number): Farmer | null {
  return farmers.find(farmer => farmer.id === id) || null;
}

export function getAllFarmers(): Farmer[] {
  return farmers;
}

export function getFarmersBySpecialty(specialty: string): Farmer[] {
  return farmers.filter(farmer => 
    farmer.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
}


