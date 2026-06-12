import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Input, Button, Textarea } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalCustomer, usePortalCustomerId, useUpdateMyProfile } from '../portal.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import toast from 'react-hot-toast';

export default function PortalProfilePage() {
  const user = useAuthStore((s) => s.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const customerQuery = usePortalCustomer(user?.id);
  const updateProfile = useUpdateMyProfile();

  const [fullName, setFullName] = useState(customerQuery.data?.fullName ?? user?.fullName ?? '');
  const [whatsapp, setWhatsapp] = useState(customerQuery.data?.whatsapp ?? '');
  const [address, setAddress] = useState((customerQuery.data as any)?.address ?? '');

  useDocumentTitle('My Profile');

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ fullName, whatsapp, address });
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your contact details and password." />

      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Full name</p>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <p className="text-sm text-slate-500">WhatsApp</p>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-slate-500">Address</p>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} isLoading={updateProfile.isLoading}>Save</Button>
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-slate-500">Change password</p>
        <p className="mt-2 text-sm text-slate-600">To change your password, use the reset password flow in account settings.</p>
      </Card>
    </div>
  );
}
