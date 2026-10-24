"use client";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-8 text-center mt-auto">
      <p>© {new Date().getFullYear()} InmoVenezuela. Todos los derechos reservados.</p>
    </footer>
  );
}