"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeoutMessage, setTimeoutMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number | null>(null);

  // ✅ Detectar si fue redirigido por inactividad
  useEffect(() => {
    if (searchParams.get('reason') === 'timeout') {
      setTimeoutMessage('Tu sesión se cerró automáticamente por inactividad (3 minutos).');
      
      // Auto-limpiar mensaje de timeout después de 5 segundos
      const timer = setTimeout(() => {
        setTimeoutMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // ✅ Contador regresivo cuando la cuenta está bloqueada
  useEffect(() => {
    if (!isLocked) return;

    // Iniciar contador de 3 minutos (180 segundos)
    setLockoutTimeLeft(180);

    const interval = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Tiempo agotado: limpiar estado de bloqueo
          setIsLocked(false);
          setError('');
          setRemainingAttempts(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRemainingAttempts(null);
    setIsLocked(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Guardar información de intentos restantes
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        if (data.isLocked) {
          setIsLocked(true);
        }
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir según el rol y si debe cambiar contraseña
      if (data.user.role === 'ADMIN') {
        if (data.user.mustChangePassword) {
          router.push('/change-password');
        } else {
          router.push('/admin');
        }
      } else {
        if (data.user.mustChangePassword) {
          router.push('/change-password');
        } else {
          router.push('/dashboard');
        }
      }
     
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Formatear tiempo (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizar barra de intentos restantes
  const renderAttemptsWarning = () => {
    if (remainingAttempts === null || remainingAttempts === 3) return null;

    const getWarningColor = () => {
      if (remainingAttempts === 1) return 'bg-red-500';
      if (remainingAttempts === 2) return 'bg-yellow-500';
      return 'bg-blue-500';
    };

    const getWarningText = () => {
      if (remainingAttempts === 1) {
        return '⚠️ ¡ÚLTIMO INTENTO! Te queda 1 intento antes del bloqueo.';
      }
      if (remainingAttempts === 2) {
        return '⚡ Te quedan 2 intentos antes del bloqueo temporal.';
      }
      return null;
    };

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">Intentos restantes:</span>
          <span className={`text-xs font-bold ${remainingAttempts === 1 ? 'text-red-600' : 'text-gray-700'}`}>
            {remainingAttempts} de 3
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getWarningColor()}`}
            style={{ width: `${(remainingAttempts / 3) * 100}%` }}
          ></div>
        </div>
        {getWarningText() && (
          <p className="text-xs mt-2 text-red-600 font-semibold">
            {getWarningText()}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <span className="text-3xl font-bold text-blue-400">Inmo</span>
            <span className="text-3xl font-bold text-white">Venezuela</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Accede a tu panel de vendedor
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* ✅ Mensaje de timeout por inactividad (se auto-limpia en 5 segundos) */}
          {timeoutMessage && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {timeoutMessage}
            </div>
          )}

          {error && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              isLocked 
                ? 'bg-red-100 border border-red-300 text-red-800' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* ✅ Contador regresivo cuando está bloqueado */}
          {isLocked && lockoutTimeLeft !== null && (
            <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-800">
                  ⏰ Desbloqueo automático en:
                </span>
                <span className="text-lg font-bold text-orange-900 font-mono">
                  {formatTime(lockoutTimeLeft)}
                </span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="h-2 bg-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(lockoutTimeLeft / 180) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-orange-700 mt-2">
                Espera a que el contador llegue a cero para intentar de nuevo.
              </p>
            </div>
          )}

          {/* ✅ Contador de intentos restantes */}
          {renderAttemptsWarning()}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="vendedor@inmovenezuela.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : isLocked ? `Cuenta Bloqueada (${formatTime(lockoutTimeLeft || 0)})` : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Instrucciones para nuevos agentes */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900 font-semibold mb-2">
              🔑 ¿Eres un agente nuevo?
            </p>
           
            <p className="text-xs text-blue-800">
              ⚠️ El sistema te redirigirá <strong>automáticamente</strong> para que establezcas tu contraseña definitiva.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}