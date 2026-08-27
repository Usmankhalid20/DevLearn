import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, ExternalLink, Trash2 } from 'lucide-react';
import type { Resource } from '@/lib/learning-api';

interface ResourceCardProps {
  resource: Resource;
  onDelete: (id: string) => Promise<void>;
}

export function ResourceCard({ resource, onDelete }: ResourceCardProps) {
  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <Card className="border-border bg-surface hover:border-neutral-700 transition-colors">
      <CardContent className="p-4 flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-semibold font-mono text-white flex items-center gap-1.5 truncate">
            <Globe className="h-3.5 w-3.5 text-foreground-secondary shrink-0" />
            {resource.title}
          </h3>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-foreground-secondary hover:text-white flex items-center gap-1 transition-colors truncate"
          >
            <span>{getDomain(resource.url)}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(resource.id)}
          className="h-8 w-8 p-0 text-foreground-muted hover:text-state-error hover:bg-state-error/10 shrink-0"
          title="Delete bookmark"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
