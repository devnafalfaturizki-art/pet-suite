import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoyaltyRedeemPanel } from '../components/LoyaltyRedeemPanel';

describe('LoyaltyRedeemPanel', () => {
  it('renders loyalty details and updates redemption points', () => {
    const onRedeemChange = vi.fn();

    render(
      <LoyaltyRedeemPanel
        availablePoints={150}
        currentTotal={50000}
        pointsToRedeem={50}
        onRedeemChange={onRedeemChange}
      />
    );

    expect(screen.getByText(/Loyalty Points Available/i)).toBeInTheDocument();
    expect(screen.getByText(/150 pts/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '30' } });
    expect(onRedeemChange).toHaveBeenCalledWith(30);
  });

  it('does not render when no points are available', () => {
    const onRedeemChange = vi.fn();

    const { container } = render(
      <LoyaltyRedeemPanel
        availablePoints={0}
        currentTotal={50000}
        pointsToRedeem={0}
        onRedeemChange={onRedeemChange}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
