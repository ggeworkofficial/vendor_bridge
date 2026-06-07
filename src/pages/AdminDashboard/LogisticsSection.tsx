import { useState, useEffect } from "react";
import { Truck, Package, CheckCircle, Search, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLogistics, getLogisticsItem, createLogistics, updateLogistics } from "@/api/logistics.api";
import { useLogisticsStore } from "@/features/logistics/logistics.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";

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
    <Button variant="outline" className={`text-xs capitalize ${styles[status] || ""}`}>
      {status.replace(/_/g, " ")}
    </Button>
  );
};

const StatCard = ({ label, value, change, positive = true, icon: Icon }: { label: string; value: string; change: string; positive?: boolean; icon?: React.ElementType }) => (
  <div className="bg-card border rounded-lg p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </div>
    <p className="text-2xl font-display font-bold mt-1">{value}</p>
    <p className={`text-xs mt-1 flex items-center gap-1 ${positive ? "text-success" : "text-destructive"}`}>
      {positive ? <span className="text-success">▲</span> : <span className="text-destructive">▼</span>}
      {change}
    </p>
  </div>
);

const LogisticsSection = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [createOrderId, setCreateOrderId] = useState("");
  const [createCarrier, setCreateCarrier] = useState("");
  const [createTrackingNumber, setCreateTrackingNumber] = useState("");
  const [createStatus, setCreateStatus] = useState<"processing" | "in_transit" | "out_for_delivery" | "delivered">("processing");
  const [createOrigin, setCreateOrigin] = useState("");
  const [createDestination, setCreateDestination] = useState("");
  const [createEstimatedEta, setCreateEstimatedEta] = useState("");

  const [editCarrier, setEditCarrier] = useState("");
  const [editTrackingNumber, setEditTrackingNumber] = useState("");
  const [editStatus, setEditStatus] = useState<"processing" | "in_transit" | "out_for_delivery" | "delivered">("processing");
  const [editOrigin, setEditOrigin] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editEstimatedEta, setEditEstimatedEta] = useState("");

  const setLogistics = useLogisticsStore((s) => s.setLogistics);
  const selectedLogistics = useLogisticsStore((s) => s.selectedLogistics);
  const setSelectedLogistics = useLogisticsStore((s) => s.setSelectedLogistics);
  const addLogisticsToStore = useLogisticsStore((s) => s.addLogistics);
  const updateLogisticsInStore = useLogisticsStore((s) => s.updateLogistics);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useLogisticsQuery = (params: any) =>
    useQuery({
      queryKey: ["logistics", params],
      queryFn: async () => await getLogistics(params),
      placeholderData: keepPreviousData,
    });

  const statusParam = statusFilter === "all" ? undefined : statusFilter;
  const response = useLogisticsQuery({
    page,
    limit,
    ...(search ? { search } : {}),
    ...(statusParam ? { status: statusParam } : {}),
  });

  const logistics = response.data?.data?.data ?? [];
  const meta = response.data?.data?.meta;

  const inTransitCount = logistics.filter((l) => l.status === "in_transit").length;
  const outForDeliveryCount = logistics.filter((l) => l.status === "out_for_delivery").length;
  const deliveredCount = logistics.filter((l) => l.status === "delivered").length;

  const loadSelected = async (id: string) => {
    try {
      const { data } = await getLogisticsItem(id);
      setSelectedLogistics(data);
      setEditCarrier(data.carrier);
      setEditTrackingNumber(data.tracking_number);
      setEditStatus(data.status);
      setEditOrigin(data.origin);
      setEditDestination(data.destination);
      setEditEstimatedEta(data.estimated_eta);
      setIsViewOpen(true);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load logistics details.", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    if (!createOrderId || !createCarrier || !createTrackingNumber || !createOrigin || !createDestination || !createEstimatedEta) {
      toast({ title: "Validation error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const { data } = await createLogistics({
        order_id: createOrderId,
        carrier: createCarrier,
        tracking_number: createTrackingNumber,
        status: createStatus,
        origin: createOrigin,
        destination: createDestination,
        estimated_eta: createEstimatedEta,
      });
      addLogisticsToStore(data);
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
      toast({ title: "Logistics created", description: "New shipment record added." });
      setCreateOrderId("");
      setCreateCarrier("");
      setCreateTrackingNumber("");
      setCreateStatus("processing");
      setCreateOrigin("");
      setCreateDestination("");
      setCreateEstimatedEta("");
      setIsCreateOpen(false);
    } catch (err) {
      toast({ title: "Create failed", description: "Unable to create logistics record.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedLogistics) return;
    setIsSaving(true);
    try {
      await updateLogistics(selectedLogistics.id, {
        carrier: editCarrier,
        tracking_number: editTrackingNumber,
        status: editStatus,
        origin: editOrigin,
        destination: editDestination,
        estimated_eta: editEstimatedEta,
      });
      const { data } = await getLogisticsItem(selectedLogistics.id);
      updateLogisticsInStore(data);
      setSelectedLogistics(data);
      queryClient.invalidateQueries({ queryKey: ["logistics"] });
      toast({ title: "Logistics updated", description: "Shipment record saved." });
      setIsViewOpen(false);
    } catch (err) {
      toast({ title: "Update failed", description: "Unable to update logistics record.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => setPage(1), [search, statusFilter]);
  useEffect(() => setLogistics(logistics), [logistics, setLogistics]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="In Transit" value={String(inTransitCount)} change="Current shipments" icon={Truck} />
        <StatCard label="Out for Delivery" value={String(outForDeliveryCount)} change="Being delivered" icon={Package} />
        <StatCard label="Delivered" value={String(deliveredCount)} change="Completed" icon={CheckCircle} />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Logistics
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order ID or tracking..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logistics ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logistics.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium text-sm">{l.id}</TableCell>
                <TableCell className="font-medium text-sm">{l.order_id}</TableCell>
                <TableCell className="text-sm">{l.order?.user?.full_name}</TableCell>
                <TableCell className="text-sm">{l.carrier}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{l.tracking_number}</TableCell>
                <TableCell><StatusBadge status={l.status} /></TableCell>
                <TableCell className="text-sm">{l.origin}</TableCell>
                <TableCell className="text-sm">{l.destination}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.estimated_eta}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadSelected(l.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
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
      <BaseDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} maxWidth="2xl">
        <AppDialogHeader title="Add Logistics Record" subtitle="Create a new shipment tracking record" />
        <AppDialogSection title="Logistics Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1"><Label>Order ID</Label><Input value={createOrderId} onChange={(e) => setCreateOrderId(e.target.value)} placeholder="e.g., ORD-001" /></div>
            <div className="space-y-1"><Label>Carrier</Label><Input value={createCarrier} onChange={(e) => setCreateCarrier(e.target.value)} placeholder="e.g., DHL Express" /></div>
            <div className="space-y-1"><Label>Tracking Number</Label><Input value={createTrackingNumber} onChange={(e) => setCreateTrackingNumber(e.target.value)} placeholder="e.g., DHL29293946" /></div>
            <div className="space-y-1"><Label>Status</Label><Select value={createStatus} onValueChange={(v: any) => setCreateStatus(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="processing">Processing</SelectItem><SelectItem value="in_transit">In Transit</SelectItem><SelectItem value="out_for_delivery">Out for Delivery</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label>Estimated ETA</Label><Input type="date" value={createEstimatedEta} onChange={(e) => setCreateEstimatedEta(e.target.value)} /></div>
            <div className="space-y-1"><Label>Origin</Label><Input value={createOrigin} onChange={(e) => setCreateOrigin(e.target.value)} placeholder="e.g., Kerala" /></div>
            <div className="col-span-2 space-y-1"><Label>Destination</Label><Input value={createDestination} onChange={(e) => setCreateDestination(e.target.value)} placeholder="e.g., Portland, OR" /></div>
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsCreateOpen(false) }}
          primaryAction={{
            label: "Create",
            onClick: handleCreate,
            disabled: isCreating,
            loading: isCreating
          }}
        />
      </BaseDialog>
      <BaseDialog open={isViewOpen} onOpenChange={setIsViewOpen} maxWidth="2xl">
        <AppDialogHeader title="Logistics Details" subtitle={selectedLogistics?.id || ""} />
        {selectedLogistics ? (
          <div className="space-y-4">
            <AppDialogSection title="Logistics Information">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Logistics ID</p><p className="font-medium">{selectedLogistics.id}</p></div>
                <div><p className="text-muted-foreground text-xs">Order ID</p><p className="font-medium">{selectedLogistics.order_id}</p></div>
                <div><p className="text-muted-foreground text-xs">Customer</p><p className="font-medium">{selectedLogistics.order?.user?.full_name}</p></div>
                <div><p className="text-muted-foreground text-xs">Customer ID</p><p className="font-medium text-xs">{selectedLogistics.order?.user?.id}</p></div>
                <div><p className="text-muted-foreground text-xs">Created At</p><p className="font-medium text-xs">{selectedLogistics.created_at}</p></div>
                <div><p className="text-muted-foreground text-xs">Updated At</p><p className="font-medium text-xs">{selectedLogistics.updated_at}</p></div>
              </div>
            </AppDialogSection>
            <AppDialogSection title="Shipment Details">
              <div className="space-y-3">
                <div className="space-y-1"><Label>Carrier</Label><Input value={editCarrier} onChange={(e) => setEditCarrier(e.target.value)} /></div>
                <div className="space-y-1"><Label>Tracking Number</Label><Input value={editTrackingNumber} onChange={(e) => setEditTrackingNumber(e.target.value)} /></div>
                <div className="space-y-1"><Label>Status</Label><Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="processing">Processing</SelectItem><SelectItem value="in_transit">In Transit</SelectItem><SelectItem value="out_for_delivery">Out for Delivery</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label>Origin</Label><Input value={editOrigin} onChange={(e) => setEditOrigin(e.target.value)} /></div>
                <div className="space-y-1"><Label>Destination</Label><Input value={editDestination} onChange={(e) => setEditDestination(e.target.value)} /></div>
                <div className="space-y-1"><Label>Estimated ETA</Label><Input type="date" value={editEstimatedEta} onChange={(e) => setEditEstimatedEta(e.target.value)} /></div>
              </div>
            </AppDialogSection>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        <AppDialogFooter
          secondaryAction={{ label: "Close", onClick: () => setIsViewOpen(false) }}
          primaryAction={{
            label: "Save Changes",
            onClick: handleSave,
            disabled: isSaving || !selectedLogistics,
            loading: isSaving
          }}
        />
      </BaseDialog>
    </div>
  );
};

export default LogisticsSection;
