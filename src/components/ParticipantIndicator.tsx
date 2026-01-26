import { Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ParticipantIndicatorProps {
  count: number;
}

const avatarColors = [
  'bg-primary',
  'bg-accent',
  'bg-success',
  'bg-warning',
  'bg-destructive',
];

export function ParticipantIndicator({ count }: ParticipantIndicatorProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{count}</span>
          <div className="flex -space-x-1.5">
            {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full ${avatarColors[i]} ring-2 ring-background flex items-center justify-center`}
              >
                <span className="text-[10px] font-bold text-primary-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
            ))}
            {count > 5 && (
              <div className="w-5 h-5 rounded-full bg-muted ring-2 ring-background flex items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground">
                  +{count - 5}
                </span>
              </div>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{count} participant{count !== 1 ? 's' : ''} connected</p>
      </TooltipContent>
    </Tooltip>
  );
}
