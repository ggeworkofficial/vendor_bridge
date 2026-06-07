import { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, Trash2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSellers, getSeller, createSeller, updateSeller, deleteSeller } from "@/api/seller.api";
import { useSellerStore } from "@/features/seller.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";

const SellerSection = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "created_at">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null);
  const [createUserId, setCreateUserId] = useState("");
  const [createName, setCreateName] = useState("");
  const [createLocation, setCreateLocation] = useState("");
  const [createContact, setCreateContact] = useState("");
  const [createVerified, setCreateVerified] = useState(false);
  const [editUserId, setEditUserId] = useState("");
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editVerified, setEditVerified] = useState(false);

  const sellers = useSellerStore((state) => state.sellers);
  const selectedSeller = useSellerStore((state) => state.selectedSeller);
  const setSellers = useSellerStore((state) => state.setSellers);
  const setSelectedSeller = useSellerStore((state) => state.setSelectedSeller);
  const addSeller = useSellerStore((state) => state.addSeller);
  const updateSellerInStore = useSellerStore((state) => state.updateSeller);
  const removeSeller = useSellerStore((state) => state.removeSeller);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useSellersQuery = (params: any) =>
    useQuery({
      queryKey: ["sellers", params],
      queryFn: async () => await getSellers(params),
      placeholderData: keepPreviousData,
    });

  const response = useSellersQuery({
    page,
    limit,
    ...(search ? { search } : {}),
    sort,
    order,
  });

  const sellersData = response.data?.data?.data ?? [];
  const sellersMeta = response.data?.data?.meta;

  useEffect(() => {
    if (!response.data?.data?.data) return;
    setSellers(response.data.data.data);
  }, [response.data?.data?.data, setSellers]);

  const loadSellerDetails = async (id: string) => {
    try {
      const { data } = await getSeller(id);
      setSelectedSeller(data);
      setEditUserId(data.user.id);
      setEditName(data.name);
      setEditLocation(data.location);
      setEditContact(data.contact);
      setEditVerified(data.verified);
      setIsViewOpen(true);
    } catch (error) {
      toast({ title: "Unable to load seller", description: "Failed to fetch seller details.", variant: "destructive" });
    }
  };

  const loadSellerForEdit = async (id: string) => {
    try {
      const { data } = await getSeller(id);
      setSelectedSeller(data);
      setEditUserId(data.user.id);
      setEditName(data.name);
      setEditLocation(data.location);
      setEditContact(data.contact);
      setEditVerified(data.verified);
      setIsEditOpen(true);
    } catch (error) {
      toast({ title: "Unable to load seller", description: "Failed to fetch seller details.", variant: "destructive" });
    }
  };

  const handleCreateSeller = async () => {
    if (!createName.trim() || !createLocation.trim() || !createContact.trim() || !createUserId.trim()) {
      toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const { data } = await createSeller({
        user_id: createUserId.trim(),
        name: createName.trim(),
        location: createLocation.trim(),
        contact: createContact.trim(),
        verified: createVerified,
      });
      addSeller(data);
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Seller created" });
      setIsCreateOpen(false);
      setCreateUserId("");
      setCreateName("");
      setCreateLocation("");
      setCreateContact("");
      setCreateVerified(false);
    } catch (error) {
      toast({ title: "Create failed", description: "Unable to create seller.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSeller = async () => {
    if (!selectedSeller) return;
    if (!editName.trim() || !editLocation.trim() || !editContact.trim() || !editUserId.trim()) {
      toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateSeller(selectedSeller.id, {
        user_id: editUserId.trim(),
        name: editName.trim(),
        location: editLocation.trim(),
        contact: editContact.trim(),
        verified: editVerified,
      });
      const { data } = await getSeller(selectedSeller.id);
      updateSellerInStore(data);
      setSelectedSeller(data);
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Seller updated" });
      setIsEditOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to update seller.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;
    try {
      await deleteSeller(sellerToDelete);
      removeSeller(sellerToDelete);
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Seller deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to delete seller.", variant: "destructive" });
    } finally {
      setSellerToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, sort, order]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <h3 className="font-display font-semibold">Sellers</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Seller
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search sellers..." />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as "name" | "created_at")}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="created_at">Sort by created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="font-medium">{seller.name}</TableCell>
                <TableCell>{seller.user.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{seller.location}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{seller.contact}</TableCell>
                <TableCell>{seller.products}</TableCell>
                <TableCell>
                  {seller.verified ? (
                    <Badge className="bg-success/10 text-success text-xs gap-1"><BadgeCheck className="h-3 w-3" /> Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(seller.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSellerDetails(seller.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSellerForEdit(seller.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSellerToDelete(seller.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {sellersMeta && sellersMeta.total > sellersMeta.limit && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Prev</Button>
          <span>Page {sellersMeta.page} of {Math.ceil(sellersMeta.total / sellersMeta.limit)}</span>
          <Button disabled={page * sellersMeta.limit >= sellersMeta.total} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </div>
      )}
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} maxWidth="lg">
        <AppDialogHeader title="Add Seller" subtitle="Create a new seller account" />
        <AppDialogSection title="Seller Information">
          <div className="space-y-4">
            <div className="space-y-1"><Label>User ID</Label><Input value={createUserId} onChange={(e) => setCreateUserId(e.target.value)} placeholder="UUID" /></div>
            <div className="space-y-1"><Label>Name</Label><Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Seller Name" /></div>
            <div className="space-y-1"><Label>Location</Label><Input value={createLocation} onChange={(e) => setCreateLocation(e.target.value)} placeholder="City, Country" /></div>
            <div className="space-y-1"><Label>Contact</Label><Input value={createContact} onChange={(e) => setCreateContact(e.target.value)} placeholder="Phone Number" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={createVerified} onChange={(e) => setCreateVerified(e.target.checked)} className="rounded border-border" />
              <Label className="mb-0">Verified</Label>
            </div>
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsCreateOpen(false) }}
          primaryAction={{
            label: "Create",
            onClick: handleCreateSeller,
            disabled: isCreating,
            loading: isCreating
          }}
        />
      </BaseDialog>
      <BaseDialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setSelectedSeller(null); } }} maxWidth="lg">
        <AppDialogHeader title="Edit Seller" subtitle="Update seller information" />
        <AppDialogSection title="Seller Information">
          <div className="space-y-4">
            <div className="space-y-1"><Label>User ID</Label><Input value={editUserId} onChange={(e) => setEditUserId(e.target.value)} placeholder="UUID" /></div>
            <div className="space-y-1"><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Seller Name" /></div>
            <div className="space-y-1"><Label>Location</Label><Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City, Country" /></div>
            <div className="space-y-1"><Label>Contact</Label><Input value={editContact} onChange={(e) => setEditContact(e.target.value)} placeholder="Phone Number" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={editVerified} onChange={(e) => setEditVerified(e.target.checked)} className="rounded border-border" />
              <Label className="mb-0">Verified</Label>
            </div>
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => { setIsEditOpen(false); setSelectedSeller(null); } }}
          primaryAction={{
            label: "Save Changes",
            onClick: handleUpdateSeller,
            disabled: isSaving,
            loading: isSaving
          }}
        />
      </BaseDialog>
      <BaseDialog open={isViewOpen} onOpenChange={(open) => { if (!open) { setIsViewOpen(false); setSelectedSeller(null); } }} maxWidth="lg">
        <AppDialogHeader title="Seller Details" subtitle={selectedSeller?.name || ""} />
        {selectedSeller ? (
          <AppDialogSection title="Seller Information">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Seller ID</p><p className="font-medium">{selectedSeller.id}</p></div>
              <div><p className="text-muted-foreground text-xs">Owner</p><p className="font-medium">{selectedSeller.user.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Owner ID</p><p className="font-medium text-xs">{selectedSeller.user.id}</p></div>
              <div><p className="text-muted-foreground text-xs">Contact</p><p className="font-medium">{selectedSeller.contact}</p></div>
              <div className="col-span-2"><p className="text-muted-foreground text-xs">Location</p><p className="font-medium">{selectedSeller.location}</p></div>
              <div><p className="text-muted-foreground text-xs">Products</p><p className="font-medium">{selectedSeller.products}</p></div>
              <div><p className="text-muted-foreground text-xs">Verified</p><p className="font-medium">{selectedSeller.verified ? "Yes" : "No"}</p></div>
              <div><p className="text-muted-foreground text-xs">Created Date</p><p className="font-medium text-xs">{new Date(selectedSeller.created_at).toLocaleDateString()}</p></div>
              <div><p className="text-muted-foreground text-xs">Updated Date</p><p className="font-medium text-xs">{new Date(selectedSeller.updated_at).toLocaleDateString()}</p></div>
            </div>
          </AppDialogSection>
        ) : (
          <p className="text-sm text-muted-foreground">Loading seller...</p>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => { setIsViewOpen(false); setSelectedSeller(null); } }}
          primaryAction={{
            label: "Edit",
            onClick: () => { if (selectedSeller) { setIsViewOpen(false); setIsEditOpen(true); } },
            disabled: !selectedSeller
          }}
        />
      </BaseDialog>
      <BaseDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} maxWidth="lg">
        <AppDialogHeader title="Delete Seller" subtitle="This action cannot be undone" />
        <AppDialogSection>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this seller?</p>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsDeleteOpen(false) }}
          primaryAction={{
            label: "Delete",
            onClick: handleDeleteSeller,
            variant: "destructive"
          }}
        />
      </BaseDialog>
    </div>
  );
};

export default SellerSection;
