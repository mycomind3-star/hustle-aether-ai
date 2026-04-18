import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Sparkles, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface SalesPage {
  headline: string;
  subheadline: string;
  lead_paragraph: string;
  problem_section: { title: string; pain_points: string[] };
  solution_section: { title: string; intro: string; mechanism: string };
  benefits: { feature: string; benefit: string; emotion: string }[];
  social_proof_angles: string[];
  objection_crushers: { objection: string; response: string }[];
  guarantee: string;
  scarcity_urgency: string;
  cta_buttons: string[];
  faq: { q: string; a: string }[];
  ps_line: string;
}

const SalesPageGenerator = () => {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");
  const [transformation, setTransformation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalesPage | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!product.trim()) { toast.error("Describe your product"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-page", {
        body: { product, audience, price, transformation },
      });
      if (error) throw error;
      setResult(data.data);
      toast.success("Sales page ready 🔥");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = `${result.headline}\n${result.subheadline}\n\n${result.lead_paragraph}\n\n${result.problem_section.title}\n${result.problem_section.pain_points.map(p => "• " + p).join("\n")}\n\n${result.solution_section.title}\n${result.solution_section.intro}\n\n${result.benefits.map(b => `• ${b.feature}: ${b.benefit}`).join("\n")}\n\nGuarantee: ${result.guarantee}\nUrgency: ${result.scarcity_urgency}\n\nP.S. ${result.ps_line}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Full sales page copied");
  };

  const downloadPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    let y = 15;
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const wrap = (text: string, size = 11, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, pageW - margin * 2);
      lines.forEach((line: string) => {
        if (y > 280) { doc.addPage(); y = 15; }
        doc.text(line, margin, y);
        y += size * 0.45;
      });
      y += 3;
    };
    wrap(result.headline, 18, true);
    wrap(result.subheadline, 12);
    wrap(result.lead_paragraph);
    wrap(result.problem_section.title, 14, true);
    result.problem_section.pain_points.forEach(p => wrap("• " + p));
    wrap(result.solution_section.title, 14, true);
    wrap(result.solution_section.intro);
    wrap("Mechanism: " + result.solution_section.mechanism);
    wrap("Benefits", 14, true);
    result.benefits.forEach(b => wrap(`• ${b.feature} → ${b.benefit} (${b.emotion})`));
    wrap("Objections", 14, true);
    result.objection_crushers.forEach(o => wrap(`Q: ${o.objection}\nA: ${o.response}`));
    wrap("Guarantee: " + result.guarantee, 11, true);
    wrap("Urgency: " + result.scarcity_urgency);
    wrap("P.S. " + result.ps_line);
    doc.save("sales-page.pdf");
    toast.success("PDF downloaded");
  };

  return (
    <div className="glass-premium rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">AI Sales Page Generator</h3>
          <p className="text-xs text-muted-foreground">Conversion-optimized copy in seconds — direct-response style</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <Input placeholder="Product / offer" value={product} onChange={(e) => setProduct(e.target.value)} className="bg-background/50" />
        <Input placeholder="Target audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="bg-background/50" />
        <Input placeholder="Price (e.g. $97)" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-background/50" />
        <Input placeholder="Transformation promised" value={transformation} onChange={(e) => setTransformation(e.target.value)} className="bg-background/50" />
      </div>

      <Button onClick={handleGenerate} disabled={loading} className="w-full gradient-primary text-primary-foreground">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Writing copy…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Sales Page</>}
      </Button>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={copyAll}>
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />} Copy All
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPdf}>
                <Download className="w-3 h-3 mr-1" /> PDF
              </Button>
            </div>

            {/* Hero */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/30">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">{result.headline}</h2>
              <p className="text-base text-muted-foreground mb-4">{result.subheadline}</p>
              <p className="text-sm text-foreground leading-relaxed">{result.lead_paragraph}</p>
            </div>

            {/* Problem */}
            <div className="glass rounded-xl p-5">
              <p className="text-sm font-heading font-bold text-destructive mb-3">⚠ {result.problem_section.title}</p>
              <ul className="space-y-1.5">
                {result.problem_section.pain_points?.map((p, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-destructive">→</span> {p}</li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="glass rounded-xl p-5 border border-primary/30">
              <p className="text-sm font-heading font-bold text-primary mb-2">✓ {result.solution_section.title}</p>
              <p className="text-sm text-foreground mb-3">{result.solution_section.intro}</p>
              <p className="text-xs text-muted-foreground italic"><span className="text-primary font-semibold">The Mechanism:</span> {result.solution_section.mechanism}</p>
            </div>

            {/* Benefits */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">What You Get</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {result.benefits?.map((b, i) => (
                  <div key={i} className="glass rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary">{b.feature}</p>
                    <p className="text-sm text-foreground mt-0.5">{b.benefit}</p>
                    <p className="text-[10px] text-muted-foreground italic mt-1">→ {b.emotion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Objections */}
            <div className="glass rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Objection Crushers</p>
              <div className="space-y-3">
                {result.objection_crushers?.map((o, i) => (
                  <div key={i} className="border-l-2 border-primary/40 pl-3">
                    <p className="text-xs font-semibold text-muted-foreground">"{o.objection}"</p>
                    <p className="text-xs text-foreground mt-1">{o.response}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee + urgency + CTAs */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="glass rounded-lg p-4 border border-primary/30">
                <p className="text-xs font-semibold text-primary mb-1">🛡 Guarantee</p>
                <p className="text-sm text-foreground">{result.guarantee}</p>
              </div>
              <div className="glass rounded-lg p-4 border border-amber-500/30">
                <p className="text-xs font-semibold text-amber-400 mb-1">⏰ Urgency</p>
                <p className="text-sm text-foreground">{result.scarcity_urgency}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-2">CTA Buttons (A/B test these)</p>
              <div className="flex flex-wrap gap-2">
                {result.cta_buttons?.map((c, i) => (
                  <span key={i} className="text-xs px-4 py-2 rounded-full gradient-primary text-primary-foreground font-semibold">{c}</span>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="glass rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">FAQ</p>
              <div className="space-y-3">
                {result.faq?.map((f, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-foreground">Q: {f.q}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">A: {f.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground italic"><span className="font-bold">P.S.</span> {result.ps_line}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesPageGenerator;
