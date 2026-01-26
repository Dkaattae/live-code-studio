import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/CodeEditor';
import { LanguageSelector } from '@/components/LanguageSelector';
import { OutputPanel } from '@/components/OutputPanel';
import { ParticipantIndicator } from '@/components/ParticipantIndicator';
import { ShareButton } from '@/components/ShareButton';
import { api, InterviewSession } from '@/lib/api';
import { executeCode, ExecutionResult } from '@/lib/codeRunner';
import { toast } from 'sonner';

// Generate a unique user ID for this session
const getUserId = () => {
  let userId = sessionStorage.getItem('codeinterview_user_id');
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('codeinterview_user_id', userId);
  }
  return userId;
};

export default function Session() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [participants, setParticipants] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isRemoteUpdate = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load session and subscribe to updates
  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        const data = await api.getSession(sessionId);
        if (!data) {
          toast.error('Session not found');
          navigate('/');
          return;
        }
        setSession(data);
        setCode(data.code);
        setLanguage(data.language);
      } catch (error) {
        toast.error('Failed to load session');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Subscribe to session updates
    const unsubscribeSession = api.subscribeToSession(sessionId, (updated) => {
      isRemoteUpdate.current = true;
      setCode(updated.code);
      setLanguage(updated.language);
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    });

    // Subscribe to presence
    const userId = getUserId();
    const unsubscribePresence = api.subscribeToPresence(
      sessionId,
      userId,
      setParticipants
    );

    return () => {
      unsubscribeSession();
      unsubscribePresence();
    };
  }, [sessionId, navigate]);

  // Handle code changes with debounce
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    
    // Don't sync if this was a remote update
    if (isRemoteUpdate.current) return;
    
    // Debounce the sync
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(async () => {
      if (sessionId) {
        try {
          await api.updateSessionCode(sessionId, newCode);
        } catch (error) {
          console.error('Failed to sync code:', error);
        }
      }
    }, 300);
  }, [sessionId]);

  // Handle language change
  const handleLanguageChange = useCallback(async (newLanguage: string) => {
    setLanguage(newLanguage);
    if (sessionId && !isRemoteUpdate.current) {
      try {
        await api.updateSessionLanguage(sessionId, newLanguage);
      } catch (error) {
        toast.error('Failed to update language');
      }
    }
  }, [sessionId]);

  // Handle code execution
  const handleRun = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    
    try {
      const result = await executeCode(code, language);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold">CodeInterview</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ParticipantIndicator count={participants.length} />
            <LanguageSelector value={language} onChange={handleLanguageChange} />
            <Button
              onClick={handleRun}
              disabled={isExecuting}
              className="gap-2 shadow-button"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Code
                </>
              )}
            </Button>
            <ShareButton sessionId={session.id} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 p-4">
          <CodeEditor
            code={code}
            language={language}
            onChange={handleCodeChange}
          />
        </div>

        {/* Output Panel */}
        <div className="w-[400px] p-4 pl-0">
          <OutputPanel
            result={executionResult}
            isExecuting={isExecuting}
          />
        </div>
      </main>
    </div>
  );
}
