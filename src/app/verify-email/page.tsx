import { Suspense } from 'react';
import Link from 'next/link';
import VerifyEmailForm from '@/components/VerifyEmailForm';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl font-bold text-blue-400">Inmo</span>
            <span className="text-3xl font-bold text-white">Venezuela</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white">
            Verifica tu Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Ingresa el código que recibiste en tu correo
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ✅ Suspense boundary requerido por Next.js para useSearchParams */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          }>
            <VerifyEmailForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            ¿Ya tienes cuenta verificada?{' '}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}