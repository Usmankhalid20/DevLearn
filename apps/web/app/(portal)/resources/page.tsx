'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ExternalLink, Trash2, Bookmark, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { learningApi } from '@/lib/learning-api';

export default function ResourcesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: learningApi.getResources,
  });

  const createMutation = useMutation({
    mutationFn: learningApi.createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setTitle('');
      setUrl('');
      setDialogOpen(false);
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Delete this resource bookmark?')) {
      await learningApi.deleteResource(id);
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    createMutation.mutate({ title: title.trim(), url: url.trim() });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Resources & Links
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Store and organize optional documentation URLs, articles, and video links.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 font-mono text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Resource
        </Button>
      </div>

      {/* Resource Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-foreground-muted font-mono">
          Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <Card className="bg-surface text-center py-12">
          <CardContent className="space-y-2">
            <Bookmark className="mx-auto h-8 w-8 text-foreground-muted" />
            <p className="text-sm font-mono text-white">No resources saved</p>
            <p className="text-xs text-foreground-secondary">
              Save URLs to documentation, textbooks, or tutorials for quick reference.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => (
            <Card key={res.id} className="border-border bg-surface hover:border-neutral-700 transition-colors">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold font-mono text-white flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-foreground-secondary shrink-0" />
                    {res.title}
                  </h3>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-foreground-secondary hover:text-white flex items-center gap-1 truncate max-w-sm transition-colors"
                  >
                    <span className="truncate">{res.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-foreground-muted hover:text-state-error shrink-0"
                  onClick={() => handleDelete(res.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Resource Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Add Resource Link</DialogTitle>
          <DialogDescription>
            Store an external documentation page, article, or video reference.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-title">Title</Label>
            <Input
              id="res-title"
              placeholder="e.g. Raft Consensus Visualization"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="res-url">URL</Label>
            <Input
              id="res-url"
              type="url"
              placeholder="https://thesecretlivesofdata.com/raft/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Resource'
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
