import { useState } from "react";
import { Search, Eye, Mail, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getUsers, updateUserAdmin } from "@/api/user.api";
import { useUserStore } from "@/features/user/user.store";
import { useToast } from "@/hooks/use-toast";
import type { UserQueryParam } from "@/api/user.api";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    open: "bg-warning/10 text-warning border-warning/20",
    investigating: "bg-primary/10 text-primary border-primary/20",
    resolved: "bg-success/10 text-success border-success/20",
    confirmed: "bg-primary/10 text-primary border-primary/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    delivered: "bg-success/10 text-success border-success/20",
    out_for_delivery: "bg-secondary/10 text-secondary border-secondary/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    in_transit: "bg-primary/10 text-primary border-primary/20",
    processing: "bg-warning/10 text-warning border-warning/20",
    paid: "bg-success/10 text-success border-success/20",
    unpaid: "bg-destructive/10 text-destructive border-destructive/20",
    verified: "bg-success/10 text-success border-success/20",
    pending_review: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <Badge variant="outline" className={`text-xs capitalize ${styles[status] || ""}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

const UsersSection = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const setSelectedUser = useUserStore((state) => state.setSelectedUser);
  const selectedUser = useUserStore((state) => state.selectedUser);
  const [isViewOpen, setIsViewOpen] = useState(false);
  type Role = "admin" | "buyer" | "contributor";
  type Status = "active" | "suspended";
  const [editRole, setEditRole] = useState<Role>("buyer");
  const [editStatus, setEditStatus] = useState<Status>("active");
  const { toast } = useToast();

  const useUsers = (params: UserQueryParam) => {
    return useQuery({ 
      queryKey: ["users", params],
      queryFn: async () => await getUsers(params)
    });
  };
  
  const role = roleFilter === "all" ? undefined : (roleFilter as 'buyer' | 'contributor' | 'admin');
  const response = useUsers({
    page,
    limit,
    search,
    ...(role ? { role } : {}),
  });

  const meta = response.data?.data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
            <SelectItem value="contributor">Contributors</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {response.data?.data?.data.map((u) => (
              <TableRow key={u.id}>
                <TableCell><div><p className="font-medium text-sm">{u.full_name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></TableCell>
                <TableCell><Badge variant="outline" className="text-xs capitalize">{u.role}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.created_at}</TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { 
                      setSelectedUser(u); 
                      setEditRole(u.role);
                      setEditStatus(u.status);
                      setIsViewOpen(true); 
                    }}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-4 w-4" /></Button>
                    {u.status === "active" ? <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><XCircle className="h-4 w-4" /></Button> : <Button variant="ghost" size="icon" className="h-8 w-8 text-success"><CheckCircle className="h-4 w-4" /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {meta && meta.total > meta.limit && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit)}</span>
            <Button disabled={page * meta.limit >= meta.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
      <BaseDialog open={isViewOpen} onOpenChange={setIsViewOpen} maxWidth="lg">
        <AppDialogHeader title="User Details" />
        {selectedUser && (
          <div className="space-y-4">
            <AppDialogSection title="User Information">
              <div className="space-y-2">
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Name:</strong> {selectedUser.full_name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Created:</strong> {selectedUser.created_at}</p>
                <p><strong>Updated:</strong> {selectedUser.updated_at}</p>
              </div>
            </AppDialogSection>
            <AppDialogSection title="Role & Status">
              <div className="space-y-4">
                <div>
                  <Label>Role</Label>
                  <Select value={editRole} onValueChange={(value) => setEditRole(value as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="contributor">Contributor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={(value) => setEditStatus(value as Status)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AppDialogSection>
          </div>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsViewOpen(false) }}
          primaryAction={{
            label: "Save Changes",
            onClick: async () => {
              try {
                await updateUserAdmin(selectedUser.id, {
                  role: editRole,
                  status: editStatus,
                });
              } catch(error) {
                const message = error.data?.message || error.data || "An error occurred while updating the user.";
                toast({ title: "Error", description: message, variant: "destructive" });
              }
              setIsViewOpen(false);
            }
          }}
        />
      </BaseDialog>
    </div>
  );
};

export default UsersSection;
