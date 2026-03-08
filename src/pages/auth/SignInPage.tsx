import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });

  const resolveRedirectTarget = () => {
    const redirect = searchParams.get("redirect");
    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) return "/";
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setIsGoogleLoading(false);
    if (result.error) {
      toast({ title: t("auth.signIn"), description: result.error.message, variant: "destructive" });
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <h1 className="page-title text-center mb-8 !text-2xl">{t("auth.signIn")}</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t("auth.emailPlaceholder")} required className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link to="/auth/forgot-password" className="text-xs text-info hover:underline">{t("auth.forgotPassword")}</Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={t("auth.passwordPlaceholder")} required className="rounded-xl" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.rememberMe} onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })} />
                <span className="text-sm">{t("auth.keepMeSignedIn")}</span>
              </label>
              <Button type="submit" className="w-full btn-cta" disabled={isLoading}>{isLoading ? t("auth.signingIn") : t("auth.signIn")}</Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground uppercase">or</span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {isGoogleLoading ? "Signing in..." : "Continue with Google"}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">{t("auth.newToMarketplace")} <Link to="/auth/signup" className="text-info hover:underline">{t("auth.createAnAccount")}</Link></p>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-5">{t("auth.bySigningIn")} <Link to="/conditions" className="text-info hover:underline">{t("auth.conditionsOfUse")}</Link> {t("common.and")} <Link to="/privacy" className="text-info hover:underline">{t("auth.privacyNotice")}</Link></p>
        </div>
      </div>
    </Layout>
  );
}
