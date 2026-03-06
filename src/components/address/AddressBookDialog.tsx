import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAddressBook } from "@/contexts/AddressBookContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/i18n/LanguageContext";
import { AddressBookManager } from "@/components/address/AddressBookManager";

export function AddressBookDialog() {
  const { isManagerOpen, closeAddressManager } = useAddressBook();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isManagerOpen} onOpenChange={(open) => !open && closeAddressManager()}>
        <DrawerContent className="max-h-[94dvh] px-0">
          <DrawerHeader className="border-b px-4 pb-4">
            <DrawerTitle>{t("account.yourAddresses")}</DrawerTitle>
            <DrawerDescription>{t("checkout.kurdistanAddressHint")}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-4">
            <AddressBookManager onSelectComplete={closeAddressManager} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isManagerOpen} onOpenChange={(open) => !open && closeAddressManager()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-5xl overflow-hidden p-0 sm:rounded-3xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>{t("account.yourAddresses")}</DialogTitle>
          <DialogDescription>{t("checkout.kurdistanAddressHint")}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          <AddressBookManager onSelectComplete={closeAddressManager} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
