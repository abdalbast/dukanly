import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Heart, Lock, Globe, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { useWishlists } from "@/hooks/useWishlists";
import { useAuth } from "@/contexts/AuthContext";

export default function ListsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { wishlists, isLoading, createList, deleteList } = useWishlists();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const { data: products = [] } = useProducts();

  // Redirect to sign in if not authenticated
  if (!user) return <Navigate to="/sign-in" replace />;

  const selectedList = wishlists.find((l) => l.id === selectedListId) ?? wishlists[0] ?? null;

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList.mutate(newListName.trim(), {
        onSuccess: () => {
          setNewListName("");
          setIsCreateDialogOpen(false);
        },
      });
    }
  };

  const handleDeleteList = (listId: string) => {
    deleteList.mutate(listId);
    if (selectedListId === listId) setSelectedListId(null);
  };

  const listProducts = selectedList ? products.filter((p) => selectedList.product_ids.includes(p.id)) : [];

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t("lists.title")}</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild><Button className="btn-cta"><Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("lists.createList")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("lists.createNewList")}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label htmlFor="listName">{t("lists.listName")}</Label><Input id="listName" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder={t("lists.listNamePlaceholder")} /></div>
                <Button onClick={handleCreateList} className="w-full" disabled={createList.isPending}>{t("lists.createList")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-3 border-b border-border"><p className="text-sm font-medium text-muted-foreground">{t("lists.yourLists")} ({wishlists.length})</p></div>
              <div className="divide-y divide-border">
                {wishlists.map((list) => (
                  <div key={list.id} className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedList?.id === list.id ? "bg-muted" : ""}`} onClick={() => setSelectedListId(list.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{list.name}</span></div>
                      <div className="flex items-center gap-1">
                        {list.is_private ? <Lock className="w-3 h-3 text-muted-foreground" /> : <Globe className="w-3 h-3 text-muted-foreground" />}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="w-3 h-3" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end"><DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }} className="text-destructive"><Trash2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("lists.deleteList")}</DropdownMenuItem></DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{list.item_count} {t("common.items")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            {selectedList ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedList.name}</h2>
                    <p className="text-sm text-muted-foreground">{listProducts.length} {t("common.items")} • {selectedList.is_private ? t("common.private") : t("common.public")}</p>
                  </div>
                  <Button variant="outline">{t("lists.shareList")}</Button>
                </div>
                {listProducts.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{t("lists.listEmpty")}</h3>
                    <p className="text-muted-foreground mb-4">{t("lists.addItemsWhileShopping")}</p>
                    <Button asChild><Link to="/">{t("common.startShopping")}</Link></Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{listProducts.map((product) => (<ProductCard key={product.id} product={product} />))}</div>
                )}
              </>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{t("lists.noListsYet")}</h3>
                <p className="text-muted-foreground mb-4">{t("lists.createListToSave")}</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}><Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />{t("lists.createFirstList")}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
