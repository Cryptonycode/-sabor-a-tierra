import './globals.css';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';

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
        <AuthProvider>
          <CartProvider>
            <Header />
            <div className="pt-24">{children}</div>
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
