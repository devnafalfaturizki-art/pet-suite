import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Textarea } from '@/components/ui';
import { FileUpload } from '@/components/common/FileUpload';
import { groomingService } from '../grooming.service';
import { toast } from 'react-hot-toast';
import type { GroomingRecord } from '../grooming.types';

interface CompleteGroomingModalProps {
  record: GroomingRecord;
  onSuccess: () => void;
  onClose: () => void;
}

export function CompleteGroomingModal({ record, onSuccess, onClose }: CompleteGroomingModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [completedAt, setCompletedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await groomingService.completeGrooming(record.id, {
        completedAt,
        photoBeforeUrl: beforePhotoUrl,
        photoAfterUrl: afterPhotoUrl,
        notes
      });
      toast.success('Grooming completed');
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error('Unable to complete grooming. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete grooming</DialogTitle>
          <DialogDescription>Upload before/after photos and finalize this grooming session.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <FileUpload
            bucket="grooming-photos"
            storagePath={`grooming-photos/${record.id}`}
            label="Before photo"
            description="Upload a before photo for this grooming record."
            onUpload={(url) => setBeforePhotoUrl(url)}
          />

          <FileUpload
            bucket="grooming-photos"
            storagePath={`grooming-photos/${record.id}`}
            label="After photo"
            description="Upload an after photo once grooming is finished."
            onUpload={(url) => setAfterPhotoUrl(url)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Completed at</label>
              <Input type="datetime-local" value={completedAt} onChange={(event) => setCompletedAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleClose} type="button">Cancel</Button>
            <Button onClick={handleSubmit} type="button" disabled={isSaving}>{isSaving ? 'Saving…' : 'Mark Complete'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
