import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useLanguage } from "@/i18n/LanguageContext";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SellerMessages() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeConvo, setActiveConvo] = useState<{
    id: string;
    name: string;
  } | null>(() => {
    const chatId = searchParams.get("chat");
    return chatId ? { id: chatId, name: "" } : null;
  });

  const handleSelect = (conversation: { id: string; other_name: string }) => {
    setActiveConvo({ id: conversation.id, name: conversation.other_name });
    setSearchParams({ chat: conversation.id });
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t("chat.messages")}</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 14rem)" }}>
        {/* Conversation List */}
        <div className="w-80 border-r rtl:border-r-0 rtl:border-l border-border overflow-y-auto shrink-0">
          <ConversationList
            activeId={activeConvo?.id}
            onSelect={handleSelect}
            mode="seller"
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConvo?.id ? (
            <ChatWindow
              conversationId={activeConvo.id}
              otherPartyName={activeConvo.name || t("chat.unknownBuyer")}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{t("chat.selectConversation")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
