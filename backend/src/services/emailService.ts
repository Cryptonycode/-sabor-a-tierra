import { supabaseAdmin } from '../config/supabase';

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  lastName?: string;
  discountCode: string;
}

export class EmailService {
  /**
   * Envía un email de bienvenida con el cupón de descuento
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const { email, firstName, lastName, discountCode } = data;
    
    // Construir el nombre de saludo
    const greeting = firstName 
      ? `Hola ${firstName}${lastName ? ' ' + lastName : ''}` 
      : 'Hola';
    
    const subject = '¡Bienvenido a Sabor a Tierra! 🌱 Aquí está tu cupón de descuento';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .discount-code { background-color: #fff; border: 2px dashed #4CAF50; padding: 20px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50; border-radius: 8px; }
            .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Sabor a Tierra! 🌱</h1>
            </div>
            <div class="content">
              <p>${greeting},</p>
              <p>¡Gracias por unirte a nuestra comunidad! Estamos emocionados de tenerte con nosotros.</p>
              <p>Como agradecimiento, aquí está tu cupón de descuento exclusivo:</p>
              
              <div class="discount-code">
                ${discountCode}
              </div>
              
              <p><strong>¡Disfruta de un 10% de descuento en tu primera compra!</strong></p>
              
              <p>Este cupón es válido para una sola compra y te permite disfrutar de nuestros productos frescos y sostenibles directamente de agricultores locales.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/productos" class="button">
                  Explorar Productos
                </a>
              </div>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>¡Gracias por apoyar a los agricultores locales!</p>
              
              <p>Saludos cordiales,<br><strong>El equipo de Sabor a Tierra</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Sabor a Tierra. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      ${greeting},

      ¡Gracias por unirte a Sabor a Tierra!

      Tu cupón de descuento exclusivo: ${discountCode}

      ¡Disfruta de un 10% de descuento en tu primera compra!

      Este cupón es válido para una sola compra.

      Visita ${process.env.FRONTEND_URL || 'http://localhost:3000'}/productos para empezar a comprar.

      ¡Gracias por apoyar a los agricultores locales!

      Saludos,
      El equipo de Sabor a Tierra
    `;

    try {
      // Aquí puedes integrar con un servicio de email real como:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Resend
      // Por ahora, solo logueamos el email (para desarrollo)
      
      console.log('📧 Email de bienvenida preparado:');
      console.log('Para:', email);
      console.log('Asunto:', subject);
      console.log('Código de descuento:', discountCode);
      
      // TODO: Implementar integración con servicio de email real
      // Ejemplo con SendGrid:
      // await sgMail.send({
      //   to: email,
      //   from: process.env.EMAIL_FROM || 'noreply@saboratierra.com',
      //   subject,
      //   text: textContent,
      //   html: htmlContent,
      // });

      // Por ahora, simulamos el envío exitoso
      // En producción, descomentar la línea de arriba y eliminar este log
      
      // Registrar el envío en la base de datos (opcional)
      await this.logEmailSent(email, 'welcome', discountCode);
      
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      throw new Error('No se pudo enviar el email de bienvenida');
    }
  }

  /**
   * Registra el envío de un email en la base de datos (para auditoría)
   */
  private static async logEmailSent(
    email: string, 
    type: string, 
    discountCode?: string
  ): Promise<void> {
    try {
      // Esto es opcional - puedes crear una tabla email_logs si lo deseas
      console.log(`✅ Email registrado: ${type} enviado a ${email}`);
    } catch (error) {
      // No fallar si el log falla
      console.warn('No se pudo registrar el envío del email:', error);
    }
  }

  /**
   * Envía un email de confirmación de newsletter (si es necesario)
   */
  static async sendNewsletterConfirmation(
    email: string, 
    confirmationToken: string
  ): Promise<void> {
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/newsletter/confirm/${confirmationToken}`;
    
    const subject = 'Confirma tu suscripción a Sabor a Tierra';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Confirma tu suscripción</h2>
            <p>Gracias por suscribirte a nuestro newsletter.</p>
            <p>Por favor, confirma tu dirección de email haciendo clic en el siguiente enlace:</p>
            <p><a href="${confirmUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Confirmar suscripción</a></p>
            <p>Si no solicitaste esta suscripción, puedes ignorar este mensaje.</p>
            <p>Saludos,<br>El equipo de Sabor a Tierra</p>
          </div>
        </body>
      </html>
    `;

    console.log('📧 Email de confirmación de newsletter preparado para:', email);
    console.log('URL de confirmación:', confirmUrl);
    
    // TODO: Implementar envío real
    await this.logEmailSent(email, 'newsletter_confirmation');
  }
}

