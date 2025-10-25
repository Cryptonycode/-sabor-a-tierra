import './globals.css';
import CartSidebar from '@/components/CartSidebar';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

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
        <ClientLayoutWrapper>
          <div className="pt-24">{children}</div>
        </ClientLayoutWrapper>
      </body>
    </html>
  )
}
