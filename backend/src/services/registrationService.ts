import { supabaseAdmin } from '../config/supabase';
import { CustomerService } from './customerService';
import DiscountService from './discountService';
import { EmailService } from './emailService';
import { Customer } from '../types/database';

export interface RegistrationData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  password?: string;
  marketing_emails?: boolean;
  interests?: string[];
  newsletter_frequency?: string;
}

export interface RegistrationResult {
  status: 'created' | 'already_exists';
  customer: Customer | null;
  discountCode?: string;
  message: string;
}

export class RegistrationService {
  /**
   * Registra un nuevo cliente o actualiza uno existente
   * Esta es la función unificada que se usa tanto para newsletter como para creación de cuenta
   */
  static async registerCustomer(data: RegistrationData): Promise<RegistrationResult> {
    const { email, first_name, last_name, phone, password, marketing_emails, interests, newsletter_frequency } = data;

    try {
      // 1. Verificar si el email ya existe en la tabla de clientes
      const existingCustomer = await CustomerService.getCustomerByEmail(email);

      if (existingCustomer) {
        // El cliente ya existe - no enviar email ni crear nuevo cupón
        return {
          status: 'already_exists',
          customer: existingCustomer,
          message: 'Este email ya está registrado en nuestro sistema'
        };
      }

      // 2. El email es nuevo - crear el cliente
      const customerData: any = {
        email,
        first_name: first_name || '',
        last_name: last_name || '',
        phone: phone || '',
        marketing_emails: marketing_emails ?? true,
        newsletter_subscribed: true,
        email_verified: false
      };

      if (password) {
        customerData.password = password;
      }

      const newCustomer = await CustomerService.createCustomer(customerData);

      // 3. Crear cupón de bienvenida BIENVENIDA10 (10% de descuento, un solo uso)
      const discountCode = await this.createWelcomeDiscount(email);

      // 4. Enviar email de bienvenida con el cupón
      await EmailService.sendWelcomeEmail({
        email,
        firstName: first_name,
        lastName: last_name,
        discountCode
      });

      // 5. Devolver el resultado
      return {
        status: 'created',
        customer: newCustomer,
        discountCode,
        message: 'Registro exitoso. Te hemos enviado un email con tu cupón de descuento.'
      };

    } catch (error) {
      console.error('Error en el registro de cliente:', error);
      throw new Error(`Error al registrar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crea un cupón de bienvenida con el formato BIENVENIDA10
   */
  private static async createWelcomeDiscount(email: string): Promise<string> {
    // Verificar si ya existe un cupón BIENVENIDA10 activo para este email
    const { data: existingDiscount } = await supabaseAdmin
      .from('discount_codes')
      .select('code')
      .eq('customer_email', email)
      .eq('is_active', true)
      .lt('times_used', 1)
      .ilike('code', 'BIENVENIDA10%')
      .maybeSingle();

    if (existingDiscount) {
      // Ya tiene un cupón de bienvenida activo
      return existingDiscount.code;
    }

    // Crear nuevo cupón con formato específico BIENVENIDA10
    const code = await this.generateWelcomeCode();

    const insertData = {
      code,
      customer_email: email,
      discount_percentage: 10,
      max_uses: 1,
      times_used: 0,
      is_active: true,
    };

    const { error } = await supabaseAdmin
      .from('discount_codes')
      .insert([insertData]);

    if (error) {
      throw new Error(`Error al crear código de descuento: ${error.message}`);
    }

    return code;
  }

  /**
   * Genera un código único con el formato BIENVENIDA10-XXXXXX
   */
  private static async generateWelcomeCode(): Promise<string> {
    const rand = (len: number) => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, len);

    for (let i = 0; i < 10; i++) {
      const code = `BIENVENIDA10-${rand(6)}`;
      
      // Verificar que no exista
      const { data } = await supabaseAdmin
        .from('discount_codes')
        .select('code')
        .eq('code', code)
        .maybeSingle();
      
      if (!data) {
        return code;
      }
    }
    
    // Fallback si hubo muchas colisiones
    return `BIENVENIDA10-${Date.now().toString().slice(-6)}`;
  }

  /**
   * Verifica si un email ya está registrado
   */
  static async isEmailRegistered(email: string): Promise<boolean> {
    const customer = await CustomerService.getCustomerByEmail(email);
    return customer !== null;
  }

  /**
   * Suscribir solo al newsletter (sin crear cuenta completa)
   * Esta función es para cuando alguien solo quiere recibir el newsletter
   * pero aún así le damos el cupón de bienvenida
   */
  static async subscribeToNewsletterOnly(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    interests?: string[];
    frequency?: string;
  }): Promise<RegistrationResult> {
    // Usar la misma lógica de registro pero sin contraseña
    return this.registerCustomer({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      interests: data.interests,
      newsletter_frequency: data.frequency,
      marketing_emails: true
    });
  }
}


