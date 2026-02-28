import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });

  const resolveRedirectTarget = () => {
    const redirect = searchParams.get("redirect");
    if (!redirect || !redirect.startsWith("/")) return "/";
    return redirect;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    setIsLoading(false);
    if (error) {
      toast({ title: t("auth.signIn"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("auth.welcomeBack"), description: t("auth.signInSuccess") });
    navigate(resolveRedirectTarget(), { replace: true });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-6">{t("auth.signIn")}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t("auth.emailPlaceholder")} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link to="/auth/forgot-password" className="text-xs text-info hover:underline">{t("auth.forgotPassword")}</Link>
                </div>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={t("auth.passwordPlaceholder")} required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.rememberMe} onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })} />
                <span className="text-sm">{t("auth.keepMeSignedIn")}</span>
              </label>
              <Button type="submit" className="w-full btn-cta" disabled={isLoading}>{isLoading ? t("auth.signingIn") : t("auth.signIn")}</Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">{t("auth.newToMarketplace")} <Link to="/auth/signup" className="text-info hover:underline">{t("auth.createAnAccount")}</Link></p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">{t("auth.bySigningIn")} <Link to="/conditions" className="text-info hover:underline">{t("auth.conditionsOfUse")}</Link> {t("common.and")} <Link to="/privacy" className="text-info hover:underline">{t("auth.privacyNotice")}</Link></p>
        </div>
      </div>
    </Layout>
  );
}
