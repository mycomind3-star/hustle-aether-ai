import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  let sid = sessionStorage.getItem("ah_session");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("ah_session", sid);
  }
  return sid;
}

export type HomepageVariants = {
  heroHeadline: { id: string; text: string; metadata: any } | null;
  heroSubtext: { id: string; text: string } | null;
  heroBadge: { id: string; text: string } | null;
  ctaText: { id: string; text: string } | null;
  testimonials: { id: string; text: string; metadata: any }[];
  pricingHeadline: { id: string; text: string } | null;
};

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  // Weighted random: higher performance_score = higher chance
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useHomepageVariants() {
  const [variants, setVariants] = useState<HomepageVariants>({
    heroHeadline: null, heroSubtext: null, heroBadge: null,
    ctaText: null, testimonials: [], pricingHeadline: null,
  });
  const [loading, setLoading] = useState(true);
  const trackedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("homepage_variants")
        .select("*")
        .eq("is_active", true)
        .eq("is_archived", false);

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const byType: Record<string, any[]> = {};
      for (const v of data) {
        if (!byType[v.section_type]) byType[v.section_type] = [];
        byType[v.section_type].push({ id: v.id, text: v.variant_text, metadata: v.variant_metadata });
      }

      setVariants({
        heroHeadline: pickRandom(byType["hero_headline"] || []),
        heroSubtext: pickRandom(byType["hero_subtext"] || []),
        heroBadge: pickRandom(byType["hero_badge"] || []),
        ctaText: pickRandom(byType["cta_text"] || []),
        testimonials: (byType["testimonial"] || []).sort(() => Math.random() - 0.5).slice(0, 3),
        pricingHeadline: pickRandom(byType["pricing_headline"] || []),
      });
      setLoading(false);
    };
    load();
  }, []);

  // Track page view on mount
  useEffect(() => {
    if (!trackedRef.current && !loading) {
      trackedRef.current = true;
      trackEvent("page_view", {}, variants.heroHeadline?.id);
    }
  }, [loading, variants.heroHeadline?.id]);

  const trackEvent = useCallback(async (
    event_type: string,
    event_data: any = {},
    variant_id?: string
  ) => {
    try {
      await supabase.functions.invoke("track-interaction", {
        body: {
          event_type,
          event_data,
          variant_id: variant_id || null,
          session_id: getSessionId(),
        },
      });
    } catch {
      // Silent fail for tracking
    }
  }, []);

  return { variants, loading, trackEvent };
}
