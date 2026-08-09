import React from 'react';

export default function PoliticaReembolsoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">Política de Reembolso y Devoluciones</h1>
      
      <div className="space-y-6 leading-relaxed">
        <p>
          En <strong>Sabor a Tierra</strong>, nuestra prioridad es garantizar tu total satisfacción y mantener una transparencia absoluta en cada compra. Sabemos que en ocasiones pueden ocurrir imprevistos con los envíos, por ello hemos diseñado esta política que detalla cómo procedemos ante devoluciones, reembolsos y sustituciones de productos.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Ámbito de aplicación</h2>
        <p>
          Las presentes condiciones regulan las compras realizadas en la plataforma de Sabor a Tierra, abarcando todo nuestro catálogo, ya sean artículos perecederos o no perecederos.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">2. Gestión de incidencias por daños, errores o mal estado</h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Caja completa afectada:</strong> Si la totalidad del pedido llega en malas condiciones, ofrecemos la sustitución completa sin gastos adicionales, la devolución íntegra del dinero, o saldo a favor para futuras compras.
          </li>
          <li>
            <strong>Parte del pedido afectada:</strong> Si solo una parte presenta problemas, ofrecemos un reembolso proporcional, saldo a favor en la tienda, o un cupón del 10% de descuento para tu próximo pedido.
          </li>
          <li>
            <strong>Producto equivocado:</strong> Si recibes algo que no pediste, procederemos al envío gratuito del artículo correcto, al abono completo del producto original, o a la entrega de saldo a favor en tu cuenta.
          </li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-4">3. Cómo tramitar una reclamación o devolución</h2>
        <p>
          Puedes gestionar cualquier incidencia de forma autónoma a través de nuestro portal de devoluciones, siguiendo las instrucciones en pantalla. Si tienes dificultades con el proceso, nuestro equipo está a tu disposición a través de nuestro correo de contacto para ayudarte personalmente.
        </p>
        <p className="font-medium">
          Nota importante: No exigimos la devolución física de los productos en mal estado o equivocados para procesar tu compensación.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">4. Tiempos y condiciones generales</h2>
        <p>
          Tienes un máximo de 7 días naturales desde que recibes el paquete para notificar cualquier problema. Una vez aceptada la reclamación, el dinero se reintegrará en un plazo de 1 a 10 días laborables, según tu entidad bancaria. Si el error es responsabilidad logística de Sabor a Tierra, asumiremos el coste de enviarte el pedido correcto o te devolveremos el dinero, según prefieras.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">5. Política de cancelaciones</h2>
        <p>
          Puedes anular tu compra siempre y cuando no haya comenzado su preparación logística (es decir, antes de que se genere la etiqueta de envío). Para tu comodidad, el correo de confirmación incluye un enlace directo a tu área de cliente desde donde puedes cancelar el pedido. Una vez que el paquete entra en fase de expedición, la cancelación ya no será posible y se aplicarán las normas de devolución estándar.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">6. Gastos de gestión y envío</h2>
        <p>
          Si Sabor a Tierra aprueba la sustitución de un producto, nosotros cubriremos los nuevos gastos de transporte. En caso de que un paquete nos sea devuelto porque fue imposible entregarlo tras los intentos estipulados, descontaremos los gastos de envío y retorno del importe a devolver (o se denegará el reembolso si los costes superan el valor).
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">7. Causas de fuerza mayor</h2>
        <p>
          Ante circunstancias extraordinarias (fenómenos meteorológicos extremos, huelgas, bloqueos logísticos externos), Sabor a Tierra analizará cada situación de manera individual para ofrecer la alternativa más justa, ya sea una solución personalizada o un reembolso parcial.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">8. Entregas fallidas</h2>
        <p>
          La agencia de transporte realizará hasta dos intentos de entrega en la dirección proporcionada. Si no se logra entregar y el paquete es devuelto a origen, no se reembolsará el coste del pedido y se deducirán los gastos generados. Te recomendamos contactar directamente con la mensajería para acordar la entrega dentro de sus plazos. Si el paquete es devuelto y deseas que te lo enviemos de nuevo, deberás abonar los nuevos portes. Solo haremos excepciones ante causas de fuerza mayor debidamente justificadas.
        </p>
      </div>
    </div>
  );
}
