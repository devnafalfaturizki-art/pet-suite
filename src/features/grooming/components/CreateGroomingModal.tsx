import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { groomingService } from '../grooming.service';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Textarea } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface CreateGroomingModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface CustomerRecord {
  id: string;
  full_name: string;
}

interface PetRecord {
  id: string;
  name: string;
}

export function CreateGroomingModal({ onSuccess, onClose }: CreateGroomingModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerRecord[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [petOptions, setPetOptions] = useState<PetRecord[]>([]);
  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [groomer, setGroomer] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  const debouncedCustomerQuery = useDebounce(customerQuery, 300);

  useEffect(() => {
    let active = true;
    if (!debouncedCustomerQuery) {
      setCustomerResults([]);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name')
        .ilike('full_name', `%${debouncedCustomerQuery}%`)
        .limit(10);
      if (!active) return;
      if (error) {
        setCustomerResults([]);
      } else {
        setCustomerResults(data || []);
      }
    })();

    return () => {
      active = false;
    };
  }, [debouncedCustomerQuery]);

  useEffect(() => {
    let active = true;
    if (!customerId) {
      setPetOptions([]);
      return;
    }

    (async () => {
      const { data, error } = await supabase.from('pets').select('id, name').eq('customer_id', customerId);
      if (!active) return;
      if (error) {
        setPetOptions([]);
      } else {
        setPetOptions(data || []);
      }
    })();

    return () => {
      active = false;
    };
  }, [customerId]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.from('grooming_services').select('id, name').eq('is_active', true).order('name');
      if (!active) return;
      if (!error) {
        setServices(data || []);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const customerName = useMemo(
    () => customerResults.find((customer) => customer.id === customerId)?.full_name || '',
    [customerId, customerResults]
  );

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    if (!customerId || !petId || !serviceId || !scheduledAt) {
      setError('Customer, pet, service, and schedule date are required.');
      return;
    }

    setIsSaving(true);
    try {
      await groomingService.createRecord({ petId, serviceId, groomerId: groomer || undefined, scheduledAt, notes });
      toast.success('Grooming booking created');
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Unable to create booking. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New grooming booking</DialogTitle>
          <DialogDescription>Schedule a grooming service for a customer’s pet.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Customer</label>
            <Input
              placeholder="Search customer"
              value={customerQuery}
              onChange={(event) => setCustomerQuery(event.target.value)}
            />
            {customerResults.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                {customerResults.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-slate-900 hover:bg-slate-50"
                    onClick={() => {
                      setCustomerId(customer.id);
                      setCustomerQuery(customer.full_name);
                      setCustomerResults([]);
                    }}
                  >
                    {customer.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Pet</label>
              <select
                value={petId}
                onChange={(event) => setPetId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Select pet</option>
                {petOptions.map((pet) => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Service</label>
              <select
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Select service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Scheduled date</label>
              <Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Groomer</label>
              <Input value={groomer} onChange={(event) => setGroomer(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </div>

          {error ? <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        </div>

        <DialogFooter>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose} type="button">Cancel</Button>
            <Button onClick={handleSubmit} type="button" disabled={isSaving}>{isSaving ? 'Creating…' : 'Create booking'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
