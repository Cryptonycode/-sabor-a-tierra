import './globals.css';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: 'Sabor a Tierra',
  description: 'Tienda online de productos agrícolas frescos y sostenibles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <Header />
          <div className="pt-24">{children}</div>
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  )
}
