import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Users, Zap, Globe, Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const features = [
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Multiple participants can edit code simultaneously with instant sync',
  },
  {
    icon: Code,
    title: 'Multi-language Support',
    description: 'JavaScript, TypeScript, Python, Java, and C++ with syntax highlighting',
  },
  {
    icon: Play,
    title: 'Live Execution',
    description: 'Run JavaScript and TypeScript code directly in the browser',
  },
  {
    icon: Globe,
    title: 'Easy Sharing',
    description: 'Generate a unique link and share it with candidates instantly',
  },
];

export default function Index() {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const session = await api.createSession();
      navigate(`/session/${session.id}`);
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl">CodeInterview</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Real-time collaborative coding
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Conduct{' '}
            <span className="text-gradient">coding interviews</span>
            <br />
            seamlessly
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Create a collaborative coding environment in seconds. Share a link with candidates and code together in real-time with syntax highlighting and live execution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              size="lg"
              onClick={handleCreateSession}
              disabled={isCreating}
              className="gap-2 shadow-button hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          Built for seamless technical interviews
        </div>
      </footer>
    </div>
  );
}
