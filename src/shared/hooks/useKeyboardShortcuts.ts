/**
 * Global keyboard shortcut system.
 * 
 * Mandatory shortcuts:
 * - Ctrl+K => command palette
 * - Ctrl+N => create appointment
 * - Ctrl+F => global search
 * - Esc => close panel/dialog
 * - Alt+1..9 => major sections
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/ui.store';

type ShortcutHandler = () => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  handler: ShortcutHandler;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      ctrl: true,
      handler: () => setCommandPaletteOpen(true),
      description: 'Open command palette',
    },
    {
      key: 'n',
      ctrl: true,
      handler: () => navigate('/staff/appointments/create'),
      description: 'Create appointment',
    },
    {
      key: 'f',
      ctrl: true,
      handler: () => setCommandPaletteOpen(true),
      description: 'Global search',
    },
    {
      key: '1',
      alt: true,
      handler: () => navigate('/dashboard'),
      description: 'Dashboard',
    },
    {
      key: '2',
      alt: true,
      handler: () => navigate('/staff/appointments'),
      description: 'Appointments',
    },
    {
      key: '3',
      alt: true,
      handler: () => navigate('/staff/customers'),
      description: 'Customers',
    },
    {
      key: '4',
      alt: true,
      handler: () => navigate('/staff/pos'),
      description: 'POS',
    },
  ];

  useKeyboardShortcuts(shortcuts);
}