import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatButtonProps {
  sellerId: string;
  productId?: string;
  sellerName: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
  className?: string;
}

export function ChatButton({
  sellerId,
  productId,
  sellerName,
  variant = "outline",
  size = "sm",
  className,
}: ChatButtonProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      navigate("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      // Check if conversation already exists
      let query = supabase
        .from("conversations")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("seller_id", sellerId);

      if (productId) {
        query = query.eq("product_id", productId);
      } else {
        query = query.is("product_id", null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        navigate(`/messages?chat=${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          ...(productId ? { product_id: productId } : {}),
        })
        .select("id")
        .single();

      if (error) throw error;
      navigate(`/messages?chat=${created.id}`);
    } catch {
      toast({
        title: t("common.error"),
        description: t("chat.errorStarting"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1 rtl:ml-1 rtl:mr-0" />
      ) : (
        <MessageCircle className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
      )}
      {t("chat.messageSeller")}
    </Button>
  );
}
