import { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, getCategory, createCategory, updateCategory as updateCategoryApi, deleteCategory } from "@/api/category.api";
import { useCategoryStore } from "@/features/category.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";

const CategorySection = () => {
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
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [editName, setEditName] = useState("");

  const categories = useCategoryStore((state) => state.categories);
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setSelectedCategory = useCategoryStore((state) => state.setSelectedCategory);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const removeCategory = useCategoryStore((state) => state.removeCategory);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useCategories = (params: any) =>
    useQuery({
      queryKey: ["categories", params],
      queryFn: async () => await getCategories(params),
      placeholderData: keepPreviousData,
    });

  const response = useCategories({
    page,
    limit,
    ...(search ? { search } : {}),
    sort,
    order,
  });

  const categoriesData = response.data?.data?.data ?? [];
  const categoriesMeta = response.data?.data?.meta;

  useEffect(() => {
    if (!response.data?.data?.data) return;
    setCategories(response.data.data.data);
  }, [response.data?.data?.data]);

  const loadCategoryDetails = async (id: string) => {
    try {
      const { data } = await getCategory(id);
      setSelectedCategory(data);
      setEditName(data.name);
      setIsViewOpen(true);
    } catch (error) {
      toast({ title: "Unable to load category", description: "Failed to fetch category details.", variant: "destructive" });
    }
  };

  const loadCategoryForEdit = async (id: string) => {
    try {
      const { data } = await getCategory(id);
      setSelectedCategory(data);
      setEditName(data.name);
      setIsEditOpen(true);
    } catch (error) {
      toast({ title: "Unable to load category", description: "Failed to fetch category details.", variant: "destructive" });
    }
  };

  const handleCreateCategory = async () => {
    if (!createName.trim()) {
      toast({ title: "Validation error", description: "Name is required.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const { data } = await createCategory({ name: createName.trim() });
      addCategory(data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category created" });
      setIsCreateOpen(false);
      setCreateName("");
    } catch (error) {
      toast({ title: "Create failed", description: "Unable to create category.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    if (!editName.trim()) {
      toast({ title: "Validation error", description: "Name is required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateCategoryApi(selectedCategory.id, { name: editName.trim() });
      const { data } = await getCategory(selectedCategory.id);
      updateCategory(data);
      setSelectedCategory(data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category updated" });
      setIsEditOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to update category.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete);
      removeCategory(categoryToDelete);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to delete category.", variant: "destructive" });
    } finally {
      setCategoryToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, sort, order]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <h3 className="font-display font-semibold">Categories</h3>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search categories..." />
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
              <TableHead>Category ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(category.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(category.updated_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadCategoryDetails(category.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadCategoryForEdit(category.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setCategoryToDelete(category.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {categoriesMeta && categoriesMeta.total > categoriesMeta.limit && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Prev</Button>
          <span>Page {categoriesMeta.page} of {Math.ceil(categoriesMeta.total / categoriesMeta.limit)}</span>
          <Button disabled={page * categoriesMeta.limit >= categoriesMeta.total} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </div>
      )}
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} maxWidth="lg">
        <AppDialogHeader title="Add Category" subtitle="Create a new category" />
        <AppDialogSection>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={createName} onChange={(e) => setCreateName(e.target.value)} />
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsCreateOpen(false) }}
          primaryAction={{
            label: "Create",
            onClick: handleCreateCategory,
            disabled: isCreating,
            loading: isCreating
          }}
        />
      </BaseDialog>
      <BaseDialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setSelectedCategory(null); } }} maxWidth="lg">
        <AppDialogHeader title="Edit Category" subtitle="Update category name" />
        <AppDialogSection>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => { setIsEditOpen(false); setSelectedCategory(null); } }}
          primaryAction={{
            label: "Save Changes",
            onClick: handleUpdateCategory,
            disabled: isSaving,
            loading: isSaving
          }}
        />
      </BaseDialog>
      <BaseDialog open={isViewOpen} onOpenChange={(open) => { if (!open) { setIsViewOpen(false); setSelectedCategory(null); } }} maxWidth="lg">
        <AppDialogHeader title="Category Details" subtitle={selectedCategory?.name || ""} />
        {selectedCategory ? (
          <AppDialogSection title="Category Information">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Category ID</p><p className="font-medium">{selectedCategory.id}</p></div>
              <div><p className="text-muted-foreground text-xs">Created At</p><p className="font-medium text-xs">{new Date(selectedCategory.created_at).toLocaleDateString()}</p></div>
              <div className="col-span-2"><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{selectedCategory.name}</p></div>
              <div className="col-span-2"><p className="text-muted-foreground text-xs">Updated At</p><p className="font-medium text-xs">{new Date(selectedCategory.updated_at).toLocaleDateString()}</p></div>
            </div>
          </AppDialogSection>
        ) : (
          <p className="text-sm text-muted-foreground">Loading category...</p>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => { setIsViewOpen(false); setSelectedCategory(null); } }}
          primaryAction={{
            label: "Edit",
            onClick: () => { if (selectedCategory) { setIsViewOpen(false); setIsEditOpen(true); } },
            disabled: !selectedCategory
          }}
        />
      </BaseDialog>
      <BaseDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} maxWidth="lg">
        <AppDialogHeader title="Delete Category" subtitle="This action cannot be undone" />
        <AppDialogSection>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this category?</p>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsDeleteOpen(false) }}
          primaryAction={{
            label: "Delete",
            onClick: handleDeleteCategory,
            variant: "destructive"
          }}
        />
      </BaseDialog>
    </div>
  );
};

export default CategorySection;
