import { Header } from "./Header";
import { Footer } from "./Footer";
import { AddressBookDialog } from "@/components/address/AddressBookDialog";
import { CookieConsentBanner } from "./CookieConsentBanner";
import { MobileBottomNav } from "./MobileBottomNav";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AddressBookDialog />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {showFooter && <Footer />}
      <CookieConsentBanner />
      <MobileBottomNav />
    </div>
  );
}
