
-- Homepage variants for A/B testing
CREATE TABLE public.homepage_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL CHECK (section_type IN ('hero_headline', 'hero_subtext', 'hero_badge', 'testimonial', 'pricing_headline', 'cta_text', 'stat')),
  variant_text TEXT NOT NULL,
  variant_metadata JSONB DEFAULT '{}',
  performance_score NUMERIC DEFAULT 0,
  impressions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  created_by TEXT DEFAULT 'system',
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_variants ENABLE ROW LEVEL SECURITY;

-- Allow public reads for variant display
CREATE POLICY "Anyone can read active variants" ON public.homepage_variants
  FOR SELECT USING (is_active = true AND is_archived = false);

CREATE POLICY "Admins can manage variants" ON public.homepage_variants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Daily metrics tracking
CREATE TABLE public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_subscribers INT DEFAULT 0,
  new_signups INT DEFAULT 0,
  page_views INT DEFAULT 0,
  button_clicks INT DEFAULT 0,
  open_rate NUMERIC DEFAULT 0,
  click_rate NUMERIC DEFAULT 0,
  stripe_revenue NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date)
);
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage metrics" ON public.daily_metrics
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow anon inserts for tracking (upserts via edge function)
CREATE POLICY "Service role can manage metrics" ON public.daily_metrics
  FOR ALL USING (true);

-- Interaction events table for granular tracking
CREATE TABLE public.interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'button_click', 'signup', 'scroll_depth')),
  event_data JSONB DEFAULT '{}',
  variant_id UUID REFERENCES public.homepage_variants(id),
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interaction_events ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for tracking
CREATE POLICY "Anyone can insert events" ON public.interaction_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read events" ON public.interaction_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default variants
INSERT INTO public.homepage_variants (section_type, variant_text, variant_metadata, performance_score, is_active) VALUES
  ('hero_headline', 'AI That Prints Money Daily', '{"line1":"AI That","line2":"Prints Money","line3":"Daily"}', 50, true),
  ('hero_headline', 'Your AI-Powered Wealth Engine', '{"line1":"Your AI-Powered","line2":"Wealth Engine","line3":"Starts Now"}', 50, true),
  ('hero_headline', 'Turn AI Into Your ATM Machine', '{"line1":"Turn AI Into","line2":"Your ATM","line3":"Machine"}', 50, true),
  ('hero_subtext', 'Get personalized, AI-curated money-making strategies delivered to your inbox every morning. Turn insights into income with AetherHustle AI.', '{}', 50, true),
  ('hero_subtext', 'Every morning, our AI analyzes 10,000+ opportunities and delivers the top money-makers straight to you. Zero guesswork. Pure profit potential.', '{}', 50, true),
  ('hero_badge', 'Trusted by 12,000+ hustlers worldwide', '{}', 50, true),
  ('hero_badge', '🔥 #1 AI Newsletter for Side Hustlers', '{}', 50, true),
  ('hero_badge', 'Join 12K+ members earning $5K+/month', '{}', 50, true),
  ('cta_text', 'Start Making Money', '{}', 50, true),
  ('cta_text', 'Unlock My First Hustle', '{}', 50, true),
  ('cta_text', 'Get Paid Starting Today', '{}', 50, true),
  ('testimonial', 'AetherHustle AI helped me find a niche that now generates $8K/month in passive income. The AI insights are genuinely game-changing.', '{"name":"Sarah Chen","role":"E-commerce Entrepreneur","avatar":"SC","revenue":"$8K/mo"}', 50, true),
  ('testimonial', 'I was skeptical at first, but the personalized hustle recommendations were spot on. Landed 3 new clients in my first week.', '{"name":"Marcus Williams","role":"Freelance Developer","avatar":"MW","revenue":"$12K/mo"}', 50, true),
  ('testimonial', 'The premium tier is worth every penny. The AI-generated strategies are incredibly specific and actionable. My income doubled.', '{"name":"Elena Rodriguez","role":"Content Creator","avatar":"ER","revenue":"$15K/mo"}', 50, true),
  ('pricing_headline', 'Choose Your Hustle Level', '{}', 50, true),
  ('pricing_headline', 'Pick Your Profit Plan', '{}', 50, true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.homepage_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_metrics;
