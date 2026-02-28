import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { toast } = useToast();
  const { t } = useLanguage();
  const { resendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast({
        title: t("auth.emailRequired"),
        description: t("auth.emailRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await resendVerificationEmail(email);
    setIsLoading(false);

    if (error) {
      toast({
        title: t("auth.verificationResendFailed"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("auth.verificationResent"),
      description: t("auth.verificationResentDesc"),
    });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">{t("auth.verifyEmailTitle")}</h1>
            <p className="text-sm text-muted-foreground mb-2">{t("auth.verifyEmailDesc")}</p>
            {email && <p className="text-sm font-medium mb-6">{email}</p>}
            <div className="space-y-3">
              <Button onClick={handleResend} variant="outline" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.resending") : t("auth.resendVerificationEmail")}
              </Button>
              <Button asChild className="w-full btn-cta">
                <Link to="/auth/signin">{t("auth.backToSignIn")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
