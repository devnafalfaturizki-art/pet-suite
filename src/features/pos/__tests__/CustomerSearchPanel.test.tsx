import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { CustomerSearchPanel } from '../components/CustomerSearchPanel';

const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: unknown) => value,
}));

describe('CustomerSearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const select = vi.fn(() => ({
      ilike: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    }));
    mockSupabase.from.mockReturnValue({ select });
  });

  it('selects walk-in when the user chooses no customer', async () => {
    const onSelect = vi.fn();

    renderWithProviders(
      <CustomerSearchPanel
        onSelect={onSelect}
        selectedCustomerId={undefined}
        selectedCustomerName={undefined}
      />,
    );

    const input = screen.getByLabelText(/Search customer/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test' } });

    const walkIn = await screen.findByRole('button', { name: /Walk-in/i });
    fireEvent.click(walkIn);

    expect(onSelect).toHaveBeenCalledWith(null, null, 0);
  });
});