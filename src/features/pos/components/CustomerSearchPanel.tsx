import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
import { Input, Button, Card, Badge } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';

export interface CustomerSearchPanelProps {
  onSelect: (customerId: string | null, customerName: string | null, loyaltyPoints: number, phone?: string | null) => void;
  selectedCustomerId?: string;
  selectedCustomerName?: string;
}

export interface CustomerSearchResult {
  id: string;
  full_name: string;
  whatsapp: string | null;
  loyalty_points: number;
}

export function CustomerSearchPanel({ onSelect, selectedCustomerId, selectedCustomerName }: CustomerSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    let active = true;
    async function fetchCustomers() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('id,full_name,whatsapp,loyalty_points')
        .ilike('full_name', `%${debouncedQuery}%`)
        .limit(10);

      if (active) {
        if (error) {
          setResults([]);
        } else {
          setResults(data || []);
        }
      }
    }

    fetchCustomers();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const selectedCustomer = useMemo(
    () => ({ id: selectedCustomerId, name: selectedCustomerName }),
    [selectedCustomerId, selectedCustomerName]
  );

  const clearSelection = () => {
    onSelect(null, null, 0);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Customer</h3>
          <p className="text-sm text-slate-500">Select a customer to apply loyalty and billing info.</p>
        </div>
      </div>

      {selectedCustomer.id ? (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <Avatar placeholder={selectedCustomer.name ?? 'CU'} />
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{selectedCustomer.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Customer selected</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={clearSelection}>Clear</Button>
        </div>
      ) : null}

      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="pos-customer-search">
          Search customer
        </label>
        <div className="mt-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            id="pos-customer-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            placeholder="Search by name"
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {isOpen && (results.length > 0 || query) ? (
          <div className="absolute z-20 mt-2 w-full rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-t-3xl px-4 py-3 text-left text-sm text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900"
              onClick={() => {
                onSelect(null, null, 0);
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
            >
              <span>Walk-in (no customer)</span>
              <Badge variant="secondary">No customer</Badge>
            </button>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {results.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
                  onClick={() => {
                    onSelect(customer.id, customer.full_name, Number(customer.loyalty_points || 0), customer.whatsapp);
                    setIsOpen(false);
                  }}
                >
                  <Avatar placeholder={customer.full_name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-900 dark:text-slate-100">{customer.full_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{customer.whatsapp || 'No WhatsApp'}</div>
                  </div>
                  <Badge variant="outline">{customer.loyalty_points ?? 0} pts</Badge>
                </button>
              ))}
              {!results.length && query ? (
                <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No matching customers found.</div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
