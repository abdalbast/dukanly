import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string | null;
  created_at: string;
  updated_at: string;
  // joined data
  other_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface ConversationListProps {
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
  mode: "buyer" | "seller";
}

export function ConversationList({ activeId, onSelect, mode }: ConversationListProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);

      // Get conversations
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!convos || convos.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get last message and unread count for each
      const enriched: Conversation[] = await Promise.all(
        convos.map(async (c) => {
          // Get last message
          const { data: lastMsgArr } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", c.id)
            .neq("sender_id", user.id)
            .eq("is_read", false);

          // Get other party name
          let otherName = "";
          if (mode === "buyer") {
            const { data: seller } = await supabase
              .from("sellers_public")
              .select("store_name")
              .eq("id", c.seller_id)
              .single();
            otherName = seller?.store_name || t("chat.unknownSeller");
          } else {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("user_id", c.buyer_id)
              .single();
            otherName = profile?.display_name || t("chat.unknownBuyer");
          }

          const lastMsg = lastMsgArr?.[0];
          return {
            ...c,
            other_name: otherName,
            last_message: lastMsg?.content || null,
            last_message_at: lastMsg?.created_at || null,
            unread_count: count || 0,
          };
        })
      );

      setConversations(enriched);
      setLoading(false);
    };

    fetchConversations();

    // Listen for new messages to refresh list
    const channel = supabase
      .channel("conversation-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mode, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <MessageCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{t("chat.noConversations")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className={cn(
            "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
            activeId === c.id && "bg-muted"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm truncate">{c.other_name}</span>
            {c.last_message_at && (
              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate max-w-[80%]">
              {c.last_message || t("chat.noMessages")}
            </p>
            {c.unread_count > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                {c.unread_count}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
