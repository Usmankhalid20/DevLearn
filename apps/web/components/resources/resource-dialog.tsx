'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { learningApi } from '@/lib/learning-api';

interface ResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ResourceDialog({
  open,
  onOpenChange,
  onSuccess,
}: ResourceDialogProps) {
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');

  const createMutation = useMutation({
    mutationFn: learningApi.createResource,
    onSuccess: () => {
      setTitle('');
      setUrl('');
      onOpenChange(false);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    createMutation.mutate({ title: title.trim(), url: url.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <DialogTitle className="font-mono text-white">Add Learning Resource</DialogTitle>
          <DialogDescription className="text-xs font-mono text-foreground-secondary">
            Bookmark an article, documentation page, course video, or textbook link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="res-title" className="text-xs font-mono text-foreground-secondary">
              Resource Title *
            </Label>
            <Input
              id="res-title"
              placeholder="e.g. Raft Consensus Paper / PostgreSQL Indexing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-mono text-xs bg-background"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="res-url" className="text-xs font-mono text-foreground-secondary">
              URL Link *
            </Label>
            <Input
              id="res-url"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-xs bg-background"
              required
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending || !title.trim() || !url.trim()}
            className="font-mono text-xs"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Bookmark'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
