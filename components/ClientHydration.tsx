'use client';
import { useEffect, useState } from 'react';
import { useConfigStore } from '@/store/useConfigStore';

export default function ClientHydration({ children, initialConfig }: any) {
  const setConfig = useConfigStore((state) => state.setConfig);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
    setMounted(true);
  }, [initialConfig, setConfig]);

  if (!mounted) return null; // Evita errores de hidratación

  return <>{children}</>;
}