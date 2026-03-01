import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", agreeToTerms: false, subscribeToNews: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: t("auth.passwordsDontMatch"), description: t("auth.passwordsDontMatchDesc"), variant: "destructive" });
      return;
    }
    if (!formData.agreeToTerms) {
      toast({ title: t("auth.termsRequired"), description: t("auth.termsRequiredDesc"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error, needsEmailVerification } = await signUp(formData.email, formData.password, formData.name);
    setIsLoading(false);
    if (error) {
      toast({ title: t("auth.signUp"), description: error.message, variant: "destructive" });
      return;
    }

    if (needsEmailVerification) {
      toast({ title: t("auth.accountCreated"), description: t("auth.verifyEmailAfterSignUp") });
      navigate(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      return;
    }

    toast({ title: t("auth.accountCreated"), description: t("auth.accountCreatedDesc") });
    navigate("/", { replace: true });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-6">{t("auth.signUp")}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("auth.yourName")}</Label>
                <Input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("auth.firstAndLastName")} required />
              </div>
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t("auth.emailPlaceholder")} required />
              </div>
              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={t("auth.atLeast8Chars")} required minLength={8} />
                <p className="text-xs text-muted-foreground mt-1">{t("auth.passwordHint")}</p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder={t("auth.reenterPassword")} required />
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={formData.agreeToTerms} onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: !!checked })} className="mt-0.5" />
                <span className="text-sm">{t("auth.agreeToTerms")} <Link to="/conditions" className="text-info hover:underline">{t("auth.conditionsOfUse")}</Link> {t("common.and")} <Link to="/privacy" className="text-info hover:underline">{t("auth.privacyNotice")}</Link></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.subscribeToNews} onCheckedChange={(checked) => setFormData({ ...formData, subscribeToNews: !!checked })} />
                <span className="text-sm">{t("auth.sendDeals")}</span>
              </label>
              <Button type="submit" className="w-full btn-cta" disabled={isLoading}>{isLoading ? t("auth.creatingAccount") : t("auth.signUp")}</Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">{t("auth.alreadyHaveAccount")} <Link to="/auth/signin" className="text-info hover:underline">{t("auth.signInLink")}</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
