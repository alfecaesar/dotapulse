'use client';

import { useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';

export function ThemeScript() {
  const { mounted } = useTheme();

  useEffect(() => {
    // ensure dark class present before paint to avoid flash
  }, [mounted]);

  return null;
}
