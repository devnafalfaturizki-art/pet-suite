import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalCustomerId, usePortalPet } from '../portal.hooks';

export default function PortalPetDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const petQuery = usePortalPet(customerIdQuery.data ?? undefined, id ?? undefined);

  if (!id) {
    return <div className="p-6">Pet not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pet details" description="View details for your registered pet." />
      {petQuery.isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Loading...</div>
      ) : petQuery.data ? (
        <Card className="p-6">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
            <div>
              <div className="text-sm text-slate-500">Pet</div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{petQuery.data.name}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Species</p>
                  <p className="mt-1 font-semibold text-slate-900">{petQuery.data.species}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Breed</p>
                  <p className="mt-1 font-semibold text-slate-900">{petQuery.data.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Photo</p>
                  <p className="mt-1 text-slate-900">{petQuery.data.photoUrl ? 'Available' : 'No photo available'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:bg-slate-900 dark:border-slate-800">
              <div className="text-sm text-slate-500">Actions</div>
              <div className="mt-4 space-y-3">
                <Link
                  to="/portal/pets"
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  Back to pets
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Pet not found or not available for this portal account.</div>
      )}
    </div>
  );
}
