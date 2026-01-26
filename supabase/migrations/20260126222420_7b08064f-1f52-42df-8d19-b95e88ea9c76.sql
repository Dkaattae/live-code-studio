-- Create interview sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone with the link can view)
CREATE POLICY "Anyone can view sessions" 
ON public.interview_sessions 
FOR SELECT 
USING (true);

-- Public insert access (anyone can create sessions)
CREATE POLICY "Anyone can create sessions" 
ON public.interview_sessions 
FOR INSERT 
WITH CHECK (true);

-- Public update access (anyone with the link can edit)
CREATE POLICY "Anyone can update sessions" 
ON public.interview_sessions 
FOR UPDATE 
USING (true);

-- Enable realtime for collaborative editing
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_sessions;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.interview_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();