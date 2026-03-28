
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Automation logs table
CREATE TABLE public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL CHECK (run_type IN ('generate', 'send', 'monitor', 'full_pipeline')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  subscribers_processed INT DEFAULT 0,
  subscribers_total INT DEFAULT 0,
  emails_sent INT DEFAULT 0,
  emails_failed INT DEFAULT 0,
  retries_attempted INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation logs" ON public.automation_logs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add send tracking to newsletters
ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS send_status TEXT DEFAULT 'pending' CHECK (send_status IN ('pending', 'sent', 'failed', 'retry')),
  ADD COLUMN IF NOT EXISTS send_attempts INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS send_error TEXT,
  ADD COLUMN IF NOT EXISTS automation_run_id UUID REFERENCES public.automation_logs(id);

-- Enable realtime for automation_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_logs;
