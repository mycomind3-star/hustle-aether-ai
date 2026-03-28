
-- Fix: Remove overly permissive policy on daily_metrics
DROP POLICY "Service role can manage metrics" ON public.daily_metrics;

-- Fix: Tighten interaction_events insert policy to only allow specific event types
DROP POLICY "Anyone can insert events" ON public.interaction_events;
CREATE POLICY "Anon can insert events" ON public.interaction_events
  FOR INSERT WITH CHECK (
    event_type IN ('page_view', 'button_click', 'signup', 'scroll_depth')
    AND session_id IS NOT NULL
  );
