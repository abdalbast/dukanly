import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await requestPasswordReset(email);
    setIsLoading(false);

    if (error) {
      toast({
        title: t("auth.resetEmailFailed"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("auth.resetEmailSent"),
      description: t("auth.resetEmailSentDesc"),
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-2">{t("auth.forgotPasswordTitle")}</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">{t("auth.forgotPasswordDesc")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-cta" disabled={isLoading}>
                {isLoading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/auth/signin" className="text-info hover:underline">
                {t("auth.backToSignIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
