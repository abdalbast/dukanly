import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useLanguage } from "@/i18n/LanguageContext";
import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
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

  const handleBack = () => {
    setActiveConvo(null);
    setSearchParams({});
  };

  const hasActiveChat = !!activeConvo?.id;

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-xl font-bold mb-4">{t("chat.messages")}</h1>
        <div className="bg-card border border-border rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 16rem)" }}>
          {/* Conversation List */}
          <div className={cn(
            "md:w-80 border-r rtl:border-r-0 rtl:border-l border-border overflow-y-auto shrink-0",
            hasActiveChat ? "hidden md:block" : "w-full"
          )}>
            <ConversationList
              activeId={activeConvo?.id}
              onSelect={handleSelect}
              mode="buyer"
            />
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col",
            hasActiveChat ? "flex" : "hidden md:flex"
          )}>
            {activeConvo?.id ? (
              <ChatWindow
                conversationId={activeConvo.id}
                otherPartyName={activeConvo.name || t("chat.unknownSeller")}
                onBack={handleBack}
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
    </Layout>
  );
}
