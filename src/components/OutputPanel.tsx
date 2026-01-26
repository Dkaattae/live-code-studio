import { Terminal, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { ExecutionResult } from '@/lib/codeRunner';

interface OutputPanelProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
}

export function OutputPanel({ result, isExecuting }: OutputPanelProps) {
  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Output</span>
        </div>
        {result && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{result.executionTime.toFixed(2)}ms</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-auto font-mono text-sm">
        {isExecuting ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Running...</span>
          </div>
        ) : result ? (
          <>
            {result.error ? (
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <pre className="whitespace-pre-wrap">{result.error}</pre>
              </div>
            ) : (
              <div className="space-y-2">
                {result.output ? (
                  <>
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Execution successful</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-foreground">{result.output}</pre>
                  </>
                ) : (
                  <span className="text-muted-foreground italic">No output</span>
                )}
              </div>
            )}
          </>
        ) : (
          <span className="text-muted-foreground italic">
            Click "Run Code" to execute your code
          </span>
        )}
      </div>
    </div>
  );
}
