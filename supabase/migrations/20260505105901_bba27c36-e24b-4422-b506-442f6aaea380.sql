CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.user_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_type TEXT NOT NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_generations_user_tool ON public.user_generations(user_id, tool_type, created_at DESC);

ALTER TABLE public.user_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations" ON public.user_generations
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own generations" ON public.user_generations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own generations" ON public.user_generations
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own generations" ON public.user_generations
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_user_generations_updated_at
  BEFORE UPDATE ON public.user_generations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();