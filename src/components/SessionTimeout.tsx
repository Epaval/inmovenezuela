"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutos en milisegundos

export default function SessionTimeout() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      // Limpiar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login con un parámetro para mostrar mensaje
      router.push('/login?reason=timeout');
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Eventos que reinician el temporizador
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar el temporizador al montar
    resetTimer();

    // Limpiar al desmontar
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router]);

  return null; // Este componente no renderiza nada visible
}