'use client';
import Image from 'next/image';
import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-primary shadow z-50">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Sabor a Tierra Logo"
              width={40}
              height={40}
              className="rounded-full object-cover bg-white"
              priority
            />
            <span className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-white tracking-tight ml-3">
              <span className="hidden sm:inline">Sabor a Tierra</span>
              <span className="sm:hidden">Sabor</span>
            </span>
          </div>
        </Link>
        
        {/* Navegación y Carrito */}
        <div className="flex items-center space-x-3 md:space-x-6">
          {/* Navegación */}
          <ul className="hidden lg:flex space-x-6 text-white font-medium">
            <li>
              <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
            </li>
            <li>
              <Link href="/productos" className="hover:text-accent transition-colors">Productos</Link>
            </li>
            <li>
              <Link href="/agricultores" className="hover:text-accent transition-colors">Agricultores</Link>
            </li>
            <li>
              <Link href="/sobre-nosotros" className="hover:text-accent transition-colors">Sobre Nosotros</Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-accent transition-colors">Contacto</Link>
            </li>
          </ul>
          
          {/* Menú móvil */}
          <div className="lg:hidden">
            <button className="text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Carrito */}
          <CartIcon />
        </div>
      </nav>
    </header>
  );
} 