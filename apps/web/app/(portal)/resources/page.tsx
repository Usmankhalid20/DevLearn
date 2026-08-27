'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ResourceCard } from '@/components/resources/resource-card';
import { ResourceDialog } from '@/components/resources/resource-dialog';
import { learningApi } from '@/lib/learning-api';

export default function ResourcesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: learningApi.getResources,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this resource bookmark?')) {
      await learningApi.deleteResource(id);
      handleRefresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            Resources &amp; Links
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

      {/* Resource Grid */}
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
            <ResourceCard
              key={res.id}
              resource={res}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Resource Dialog */}
      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
