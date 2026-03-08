import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Hand, Shield, Palette, Globe, Send, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const applicationSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(100),
  craftCategory: z.string().min(1, "Please select a craft category"),
  craftDescription: z.string().trim().min(20, "Please describe your craft in at least 20 characters").max(2000),
  productionMethod: z.string().min(1, "Please select a production method"),
  yearsExperience: z.number().int().min(0).max(100),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  socialMediaUrl: z.string().url().optional().or(z.literal("")),
});

const CRAFT_CATEGORIES = [
  "pottery_ceramics",
  "textiles_weaving",
  "jewelry",
  "woodworking",
  "leatherwork",
  "calligraphy_art",
  "metalwork",
  "soap_candles",
  "food_preserves",
  "other",
] as const;

const PRODUCTION_METHODS = [
  "handmade",
  "hand_altered",
  "hand_assembled",
] as const;

export default function ArtisanApplicationPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    businessName: "",
    craftCategory: "",
    craftDescription: "",
    productionMethod: "handmade",
    yearsExperience: 0,
    websiteUrl: "",
    socialMediaUrl: "",
  });

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = applicationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      navigate("/auth/signin");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("artisan_applications" as any).insert({
        user_id: user.id,
        business_name: result.data.businessName,
        craft_category: result.data.craftCategory,
        craft_description: result.data.craftDescription,
        production_method: result.data.productionMethod,
        years_experience: result.data.yearsExperience,
        website_url: result.data.websiteUrl || null,
        social_media_url: result.data.socialMediaUrl || null,
      } as any);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: t("artisanApply.successTitle"),
        description: t("artisanApply.successDesc"),
      });
    } catch (err: any) {
      toast({
        title: t("common.error") || "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <Helmet>
          <title>{t("artisanApply.title")} | Dukanly</title>
        </Helmet>
        <section className="container py-20 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {t("artisanApply.successTitle")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("artisanApply.successDesc")}
          </p>
          <Button onClick={() => navigate("/handmade")}>
            {t("artisanApply.backToHandmade")}
          </Button>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{t("artisanApply.title")} | Dukanly</title>
        <meta name="description" content={t("artisanApply.subtitle")} />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-600">
        <div className="container relative py-14 md:py-20">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium">
              <Hand className="h-4 w-4" />
              {t("artisanApply.badge")}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {t("artisanApply.title")}
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              {t("artisanApply.subtitle")}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 60L1440 60L1440 30C1200 0 960 60 720 30C480 0 240 60 0 30L0 60Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Benefits quick strip */}
      <section className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Shield, label: t("artisanApply.benefit1") },
            { icon: Palette, label: t("artisanApply.benefit2") },
            { icon: Globe, label: t("artisanApply.benefit3") },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-amber-700" />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">{t("artisanApply.formTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">{t("artisanApply.businessName")} *</Label>
                <Input
                  id="businessName"
                  value={form.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder={t("artisanApply.businessNamePlaceholder")}
                  maxLength={100}
                />
                {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
              </div>

              {/* Craft Category */}
              <div className="space-y-2">
                <Label>{t("artisanApply.craftCategory")} *</Label>
                <Select value={form.craftCategory} onValueChange={(v) => updateField("craftCategory", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("artisanApply.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CRAFT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`artisanApply.cat.${cat}` as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.craftCategory && <p className="text-sm text-destructive">{errors.craftCategory}</p>}
              </div>

              {/* Production Method */}
              <div className="space-y-2">
                <Label>{t("artisanApply.productionMethod")} *</Label>
                <Select value={form.productionMethod} onValueChange={(v) => updateField("productionMethod", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTION_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {t(`artisanApply.method.${m}` as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productionMethod && <p className="text-sm text-destructive">{errors.productionMethod}</p>}
              </div>

              {/* Craft Description */}
              <div className="space-y-2">
                <Label htmlFor="craftDescription">{t("artisanApply.craftDescription")} *</Label>
                <Textarea
                  id="craftDescription"
                  value={form.craftDescription}
                  onChange={(e) => updateField("craftDescription", e.target.value)}
                  placeholder={t("artisanApply.craftDescriptionPlaceholder")}
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">{form.craftDescription.length}/2000</p>
                {errors.craftDescription && <p className="text-sm text-destructive">{errors.craftDescription}</p>}
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">{t("artisanApply.yearsExperience")}</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min={0}
                  max={100}
                  value={form.yearsExperience}
                  onChange={(e) => updateField("yearsExperience", parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">{t("artisanApply.website")}</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => updateField("websiteUrl", e.target.value)}
                  placeholder="https://..."
                />
                {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl}</p>}
              </div>

              {/* Social Media */}
              <div className="space-y-2">
                <Label htmlFor="socialMediaUrl">{t("artisanApply.socialMedia")}</Label>
                <Input
                  id="socialMediaUrl"
                  type="url"
                  value={form.socialMediaUrl}
                  onChange={(e) => updateField("socialMediaUrl", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
                {errors.socialMediaUrl && <p className="text-sm text-destructive">{errors.socialMediaUrl}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? t("common.loading") : t("artisanApply.submitApplication")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
