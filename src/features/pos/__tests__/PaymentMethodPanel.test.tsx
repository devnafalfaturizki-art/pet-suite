import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaymentMethodPanel } from '../components/PaymentMethodPanel';

describe('PaymentMethodPanel', () => {
  it('renders payment options and calls the primary method handler', () => {
    const onMethodChange = vi.fn();
    const onSecondaryMethodChange = vi.fn();
    const onPaidAmountChange = vi.fn();
    const onPaidAmountSecondaryChange = vi.fn();
    const onSplitToggle = vi.fn();
    const onReferenceChange = vi.fn();

    render(
      <PaymentMethodPanel
        method="cash"
        methodSecondary={null}
        paidAmount={0}
        paidAmountSecondary={0}
        changeAmount={0}
        splitEnabled={false}
        reference={null}
        onMethodChange={onMethodChange}
        onSecondaryMethodChange={onSecondaryMethodChange}
        onPaidAmountChange={onPaidAmountChange}
        onPaidAmountSecondaryChange={onPaidAmountSecondaryChange}
        onSplitToggle={onSplitToggle}
        onReferenceChange={onReferenceChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Card/i }));
    expect(onMethodChange).toHaveBeenCalledWith('card');
  });

  it('shows the reference input when using a non-cash method', () => {
    const onMethodChange = vi.fn();
    const onSecondaryMethodChange = vi.fn();
    const onPaidAmountChange = vi.fn();
    const onPaidAmountSecondaryChange = vi.fn();
    const onSplitToggle = vi.fn();
    const onReferenceChange = vi.fn();

    render(
      <PaymentMethodPanel
        method="card"
        methodSecondary={null}
        paidAmount={100000}
        paidAmountSecondary={0}
        changeAmount={0}
        splitEnabled={false}
        reference="REF123"
        onMethodChange={onMethodChange}
        onSecondaryMethodChange={onSecondaryMethodChange}
        onPaidAmountChange={onPaidAmountChange}
        onPaidAmountSecondaryChange={onPaidAmountSecondaryChange}
        onSplitToggle={onSplitToggle}
        onReferenceChange={onReferenceChange}
      />
    );

    expect(screen.getByLabelText(/Reference/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Reference/i), { target: { value: 'REF456' } });
    expect(onReferenceChange).toHaveBeenCalledWith('REF456');
  });
});
