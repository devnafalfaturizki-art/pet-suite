import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import PosPage from '../pages/PosPage';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value
}));

vi.mock('../pos.service', () => ({
  posService: {
    searchProducts: vi.fn().mockResolvedValue([]),
    searchServices: vi.fn().mockResolvedValue([]),
    createInvoice: vi.fn().mockResolvedValue({ id: 'inv-1', invoice_number: 'INV-1' })
  }
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('PosPage', () => {
  it('renders the POS page with search, cart, and payment sections', () => {
    renderWithProviders(<PosPage />);

    expect(screen.getByText(/Point of Sale/i)).toBeInTheDocument();
    expect(screen.getByText(/Search inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/Cart items/i)).toBeInTheDocument();
    expect(screen.getByText(/Checkout/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete checkout/i })).toBeDisabled();
  });
});
