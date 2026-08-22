import { Resend } from 'resend';

const FROM_ADDRESS = 'Sabor a Tierra <hola@saboratierra.es>';

// El cliente se crea por llamada: así un despliegue sin RESEND_API_KEY no
// tumba el resto del servidor al importar este módulo.
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Falta la variable de entorno RESEND_API_KEY');
  }

  return new Resend(apiKey);
};

const welcomeDiscountHtml = (code: string) => `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:24px;background-color:#f6f6f4;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <tr>
        <td>
          <h1 style="margin:0 0 16px;font-size:24px;color:#2f5d3a;">¡Bienvenido a Sabor a Tierra!</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.5;">
            Gracias por unirte. Aquí tienes tu <strong>10% de descuento</strong> para tu primera compra:
          </p>
          <p style="margin:0 0 20px;text-align:center;">
            <span style="display:inline-block;padding:16px 28px;background:#f3f8f4;border:2px dashed #2f5d3a;border-radius:8px;font-size:22px;font-weight:bold;letter-spacing:1px;color:#2f5d3a;">
              ${code}
            </span>
          </p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">
            Introdúcelo en el carrito o en el checkout para aplicarlo. Es válido para un solo pedido.
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">
            Fruta y verdura recién recogida, directa del agricultor a tu casa.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const sendWelcomeDiscountEmail = async (to: string, code: string) => {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Tu 10% de descuento: ${code}`,
    html: welcomeDiscountHtml(code),
    text: `¡Bienvenido a Sabor a Tierra! Tu código de 10% de descuento es ${code}. Introdúcelo en el carrito o en el checkout para aplicarlo. Válido para un solo pedido.`
  });

  if (error) {
    throw new Error(error.message || 'No se pudo enviar el email');
  }
};
