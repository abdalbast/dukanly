import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Heart, Lock, Globe, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockProducts } from "@/data/mockData";
import { ProductCard } from "@/components/ProductCard";

interface WishList {
  id: string;
  name: string;
  isPrivate: boolean;
  items: string[];
  createdAt: string;
}

const mockLists: WishList[] = [
  {
    id: "1",
    name: "Wish List",
    isPrivate: true,
    items: ["1", "2", "3"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Birthday Ideas",
    isPrivate: false,
    items: ["4", "5"],
    createdAt: "2024-01-20",
  },
];

export default function ListsPage() {
  const [lists, setLists] = useState(mockLists);
  const [selectedList, setSelectedList] = useState<WishList | null>(lists[0] || null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList: WishList = {
        id: Date.now().toString(),
        name: newListName,
        isPrivate: true,
        items: [],
        createdAt: new Date().toISOString(),
      };
      setLists([...lists, newList]);
      setNewListName("");
      setIsCreateDialogOpen(false);
      setSelectedList(newList);
    }
  };

  const handleDeleteList = (listId: string) => {
    setLists(lists.filter((l) => l.id !== listId));
    if (selectedList?.id === listId) {
      setSelectedList(lists[0] || null);
    }
  };

  const listProducts = selectedList
    ? mockProducts.filter((p) => selectedList.items.includes(p.id))
    : [];

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Lists</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-cta">
                <Plus className="w-4 h-4 mr-2" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new list</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="listName">List Name</Label>
                  <Input
                    id="listName"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Birthday Ideas"
                  />
                </div>
                <Button onClick={handleCreateList} className="w-full">
                  Create List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lists Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-muted-foreground">
                  Your Lists ({lists.length})
                </p>
              </div>
              <div className="divide-y divide-border">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedList?.id === list.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedList(list)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{list.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {list.isPrivate ? (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Globe className="w-3 h-3 text-muted-foreground" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete List
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {list.items.length} items
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="lg:col-span-3">
            {selectedList ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedList.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {listProducts.length} items •{" "}
                      {selectedList.isPrivate ? "Private" : "Public"}
                    </p>
                  </div>
                  <Button variant="outline">Share List</Button>
                </div>

                {listProducts.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">This list is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Add items to your list while shopping.
                    </p>
                    <Button asChild>
                      <Link to="/">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No lists yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a list to save items for later.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First List
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
