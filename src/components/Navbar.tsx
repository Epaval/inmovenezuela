import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg group-hover:from-blue-400 group-hover:to-blue-500 transition-all">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">Inmo</span>
              <span className="text-xl font-semibold text-white -mt-1">Venezuela</span>
            </div>
          </Link>

          {/* Enlaces de navegación */}
          <div className="hidden md:flex space-x-1">
            <Link href="/" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium">
              Inicio
            </Link>
            <Link href="/properties" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium">
              Propiedades
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium">
              Panel Vendedor
            </Link>
          </div>

          {/* Botón de acción */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}