import { Resend } from 'resend';

// Verificar que existe la API key
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ ADVERTENCIA: RESEND_API_KEY no está configurada en las variables de entorno');
}

// Inicializar Resend con la API key desde variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// Datos de configuración
// IMPORTANTE: Para pruebas, usar obligatoriamente onboarding@resend.dev
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const COMPANY_NAME = 'Sabor a Tierra';
const WHATSAPP_NUMBER = '600000000';
const BIZUM_NUMBER = '600 000 000';
const IBAN = 'ES00 0000 0000 0000 0000 0000';

console.log(`📧 Servicio de email inicializado con remitente: ${FROM_EMAIL}`);

interface OrderItem {
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: 'card' | 'bizum' | 'transferencia';
  delivery_address: {
    address: string;
    city: string;
    postal_code: string;
    province: string;
  };
}

interface WelcomeEmailData {
  firstName: string;
  email: string;
  discountCode: string;
  discountPercentage: number;
}

/**
 * 📧 Email de Confirmación de Pedido
 */
export const sendOrderConfirmationEmail = async (data: OrderConfirmationData): Promise<boolean> => {
  try {
    // Generar HTML del listado de productos
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product_name}</strong><br/>
          <small style="color: #6b7280;">${item.variant_name} × ${item.quantity}</small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${item.total_price.toFixed(2)}€
        </td>
      </tr>
    `).join('');

    // Bloque condicional para métodos de pago manuales
    let paymentInstructionsHTML = '';
    
    if (data.payment_method === 'bizum') {
      paymentInstructionsHTML = `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">💳 Instrucciones de Pago - Bizum</h3>
          <p style="margin: 5px 0; color: #78350f;">
            <strong>Número Bizum:</strong> ${BIZUM_NUMBER}
          </p>
          <p style="margin: 5px 0; color: #78350f;">
            <strong>Importe:</strong> ${data.total.toFixed(2)}€
          </p>
          <p style="margin: 10px 0 5px 0; color: #78350f;">
            ⚠️ <strong>IMPORTANTE:</strong> Es imprescindible enviar una captura de pantalla del comprobante de pago por WhatsApp para procesar tu pedido.
          </p>
          <a href="https://wa.me/34${WHATSAPP_NUMBER.replace(/\s/g, '')}?text=Hola,%20adjunto%20comprobante%20del%20pedido%20${data.orderId}" 
             style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold;">
            📱 Enviar Comprobante por WhatsApp
          </a>
        </div>
      `;
    } else if (data.payment_method === 'transferencia') {
      paymentInstructionsHTML = `
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #1e3a8a;">🏦 Instrucciones de Pago - Transferencia Bancaria</h3>
          <p style="margin: 5px 0; color: #1e40af;">
            <strong>IBAN:</strong> ${IBAN}
          </p>
          <p style="margin: 5px 0; color: #1e40af;">
            <strong>Beneficiario:</strong> ${COMPANY_NAME}
          </p>
          <p style="margin: 5px 0; color: #1e40af;">
            <strong>Concepto:</strong> Pedido ${data.orderId}
          </p>
          <p style="margin: 5px 0; color: #1e40af;">
            <strong>Importe:</strong> ${data.total.toFixed(2)}€
          </p>
          <p style="margin: 10px 0 5px 0; color: #1e40af;">
            ⚠️ <strong>IMPORTANTE:</strong> Es imprescindible enviar una captura de pantalla del comprobante de pago por WhatsApp para procesar tu pedido.
          </p>
          <a href="https://wa.me/34${WHATSAPP_NUMBER.replace(/\s/g, '')}?text=Hola,%20adjunto%20comprobante%20del%20pedido%20${data.orderId}" 
             style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: bold;">
            📱 Enviar Comprobante por WhatsApp
          </a>
        </div>
      `;
    } else {
      // Tarjeta - pago confirmado
      paymentInstructionsHTML = `
        <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">✅ Pago Confirmado</h3>
          <p style="margin: 5px 0; color: #047857;">
            Tu pago ha sido procesado correctamente. Comenzaremos a preparar tu pedido de inmediato.
          </p>
        </div>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pedido</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🌿 ${COMPANY_NAME}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">¡Gracias por tu pedido!</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #059669; margin-top: 0;">Confirmación de Pedido</h2>
          
          <p>Hola <strong>${data.customerName}</strong>,</p>
          
          <p>Hemos recibido tu pedido correctamente. A continuación encontrarás los detalles:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280;">
              <strong>Número de Pedido:</strong> ${data.orderId}
            </p>
          </div>

          ${paymentInstructionsHTML}
          
          <h3 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">📦 Productos</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #059669;">Producto</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #059669;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0;">Subtotal:</td>
                <td style="padding: 5px 0; text-align: right;">${data.subtotal.toFixed(2)}€</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;">Gastos de envío:</td>
                <td style="padding: 5px 0; text-align: right;">${data.shipping_cost.toFixed(2)}€</td>
              </tr>
              ${data.discount > 0 ? `
              <tr>
                <td style="padding: 5px 0; color: #059669;">Descuento aplicado:</td>
                <td style="padding: 5px 0; text-align: right; color: #059669;">-${data.discount.toFixed(2)}€</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #059669; font-weight: bold; font-size: 18px;">
                <td style="padding: 15px 0 5px 0;">TOTAL:</td>
                <td style="padding: 15px 0 5px 0; text-align: right; color: #059669;">${data.total.toFixed(2)}€</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 5px 0; font-size: 12px; color: #6b7280;">
                  IVA (4%) incluido
                </td>
              </tr>
            </table>
          </div>
          
          <h3 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">📍 Dirección de Entrega</h3>
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;">${data.delivery_address.address}</p>
            <p style="margin: 5px 0;">${data.delivery_address.postal_code}, ${data.delivery_address.city}</p>
            <p style="margin: 5px 0;">${data.delivery_address.province}</p>
          </div>
          
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;">
              💚 <strong>Productos frescos del campo</strong><br/>
              Recibirás tus productos en perfectas condiciones, directamente de nuestros agricultores locales.
            </p>
          </div>
          
          <p style="margin-top: 30px;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
          
          <p style="margin-top: 20px;">
            Saludos cordiales,<br/>
            <strong>El equipo de ${COMPANY_NAME}</strong>
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.</p>
          <p style="margin: 5px 0;">Productos frescos del campo a tu mesa</p>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `✅ Confirmación de Pedido #${data.orderId} - ${COMPANY_NAME}`,
      html,
    });

    console.log(`✅ Email de confirmación enviado a ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de confirmación:');
    console.error('Error completo:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    return false;
  }
};

/**
 * 🎉 Email de Bienvenida con Cupón
 */
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<boolean> => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido/a a ${COMPANY_NAME}!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #059669; color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">🌿 ¡Bienvenido/a!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px;">Gracias por unirte a ${COMPANY_NAME}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px;">Hola <strong>${data.firstName}</strong>,</p>
          
          <p>¡Estamos encantados de tenerte con nosotros! En ${COMPANY_NAME} conectamos a agricultores locales con personas como tú que valoran la calidad y frescura de los productos del campo.</p>
          
          <div style="background-color: #fef3c7; border: 3px dashed #f59e0b; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">
              🎁 Regalo de Bienvenida
            </p>
            <p style="margin: 0 0 15px 0; font-size: 28px; font-weight: bold; color: #92400e;">
              ${data.discountPercentage}% de Descuento
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 6px; border: 2px solid #f59e0b;">
              <p style="margin: 0; font-size: 12px; color: #78350f; text-transform: uppercase; letter-spacing: 1px;">
                Usa el código
              </p>
              <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                ${data.discountCode}
              </p>
            </div>
            <p style="margin: 15px 0 0 0; font-size: 13px; color: #78350f;">
              Válido para tu primera compra
            </p>
          </div>
          
          <h3 style="color: #059669; margin-top: 30px;">¿Por qué elegirnos?</h3>
          
          <div style="margin: 20px 0;">
            <div style="margin: 15px 0; padding-left: 10px; border-left: 3px solid #059669;">
              <p style="margin: 0; font-weight: bold; color: #059669;">🌱 Productos Frescos</p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
                Directamente del campo a tu mesa. Sin intermediarios, sin largos tiempos de almacenamiento.
              </p>
            </div>
            
            <div style="margin: 15px 0; padding-left: 10px; border-left: 3px solid #059669;">
              <p style="margin: 0; font-weight: bold; color: #059669;">👨‍🌾 Apoya lo Local</p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
                Cada compra apoya a agricultores locales y a la economía de tu región.
              </p>
            </div>
            
            <div style="margin: 15px 0; padding-left: 10px; border-left: 3px solid #059669;">
              <p style="margin: 0; font-weight: bold; color: #059669;">🚚 Envío Rápido</p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
                Recibe tus productos en 24-48 horas, garantizando la máxima frescura.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://saboratierra.com'}/productos" 
               style="display: inline-block; background-color: #059669; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              🛒 Comenzar a Comprar
            </a>
          </div>
          
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 6px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              💡 <strong>Consejo:</strong> Guarda este email para tener tu código de descuento siempre a mano.
            </p>
          </div>
          
          <p style="margin-top: 30px;">
            Si tienes cualquier pregunta, estamos aquí para ayudarte. ¡No dudes en contactarnos!
          </p>
          
          <p style="margin-top: 20px;">
            Con cariño,<br/>
            <strong>El equipo de ${COMPANY_NAME}</strong> 🌿
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.</p>
          <p style="margin: 5px 0;">Productos frescos del campo a tu mesa</p>
          <p style="margin: 15px 0 5px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://saboratierra.com'}/productos" style="color: #059669; text-decoration: none; margin: 0 10px;">Ver Productos</a>
            <a href="${process.env.FRONTEND_URL || 'https://saboratierra.com'}/contacto" style="color: #059669; text-decoration: none; margin: 0 10px;">Contacto</a>
          </p>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `🎉 ¡Bienvenido/a a ${COMPANY_NAME}! Tu cupón de ${data.discountPercentage}% te espera`,
      html,
    });

    console.log(`✅ Email de bienvenida enviado a ${data.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de bienvenida:');
    console.error('Error completo:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    return false;
  }
};

/**
 * 🔐 Email de Acceso Seguro (Reemplazo de "Magic Link")
 */
export const sendSecureAccessEmail = async (
  email: string,
  firstName: string,
  accessLink: string
): Promise<boolean> => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acceso Seguro a tu Cuenta</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🌿 ${COMPANY_NAME}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Acceso Seguro a tu Cuenta</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px;">Hola${firstName ? ` <strong>${firstName}</strong>` : ''},</p>
          
          <p>Has solicitado acceder a tu cuenta en ${COMPANY_NAME}. Haz clic en el botón de abajo para identificarte de forma segura:</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${accessLink}" 
               style="display: inline-block; background-color: #059669; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              🔐 Acceder a mi Cuenta
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #78350f;">
              ⚡ <strong>Acceso rápido:</strong> Este enlace es válido durante 1 hora y solo puede usarse una vez.
            </p>
          </div>
          
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;">
              🔒 <strong>Seguridad:</strong> Si no has solicitado este acceso, ignora este email. Tu cuenta permanece segura.
            </p>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="word-break: break-all; font-size: 12px; color: #059669; background-color: #f0fdf4; padding: 10px; border-radius: 4px;">
            ${accessLink}
          </p>
          
          <p style="margin-top: 30px;">
            Saludos,<br/>
            <strong>El equipo de ${COMPANY_NAME}</strong>
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🔐 Acceso Seguro a ${COMPANY_NAME}`,
      html,
    });

    console.log(`✅ Email de acceso seguro enviado a ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email de acceso seguro:');
    console.error('Error completo:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    return false;
  }
};

