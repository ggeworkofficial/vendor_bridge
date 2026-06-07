import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseDialog, AppDialogHeader, AppDialogFooter, AppDialogSection } from "@/components/ui/app-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaymentAccounts, getPaymentAccount, createPaymentAccount, updatePaymentAccount, deletePaymentAccount } from "@/api/payment-account.api";
import { usePaymentAccountStore } from "@/features/payment-account.store";
import { useToast } from "@/hooks/use-toast";
import { keepPreviousData } from "@tanstack/react-query";

const PaymentAccountsSection = () => {
  const [accountSearch, setAccountSearch] = useState("");
  const [accountPage, setAccountPage] = useState(1);
  const [accountLimit] = useState(10);
  const [isAccountCreateOpen, setIsAccountCreateOpen] = useState(false);
  const [isAccountEditOpen, setIsAccountEditOpen] = useState(false);
  const [isAccountDeleteOpen, setIsAccountDeleteOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [accountCreateType, setAccountCreateType] = useState<"bank" | "telebirr" | "cbe_birr">("bank");
  const [accountCreateLabel, setAccountCreateLabel] = useState("");
  const [accountCreateName, setAccountCreateName] = useState("");
  const [accountCreateNumber, setAccountCreateNumber] = useState("");
  const [accountCreateDetails, setAccountCreateDetails] = useState("");
  const [accountEditType, setAccountEditType] = useState<"bank" | "telebirr" | "cbe_birr">("bank");
  const [accountEditLabel, setAccountEditLabel] = useState("");
  const [accountEditName, setAccountEditName] = useState("");
  const [accountEditNumber, setAccountEditNumber] = useState("");
  const [accountEditDetails, setAccountEditDetails] = useState("");
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const [isAccountCreating, setIsAccountCreating] = useState(false);

  const selectedPaymentAccount = usePaymentAccountStore((state) => state.selectedPaymentAccount);
  const setPaymentAccounts = usePaymentAccountStore((state) => state.setPaymentAccounts);
  const setSelectedPaymentAccount = usePaymentAccountStore((state) => state.setSelectedPaymentAccount);
  const addPaymentAccount = usePaymentAccountStore((state) => state.addPaymentAccount);
  const updatePaymentAccountInStore = usePaymentAccountStore((state) => state.updatePaymentAccount);
  const removePaymentAccount = usePaymentAccountStore((state) => state.removePaymentAccount);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usePaymentAccountsQuery = (params: any) =>
    useQuery({
      queryKey: ["payment-accounts", params],
      queryFn: async () => await getPaymentAccounts(params),
      placeholderData: keepPreviousData,
    });

  const paymentAccountsResponse = usePaymentAccountsQuery({
    page: accountPage,
    limit: accountLimit,
    ...(accountSearch ? { search: accountSearch } : {}),
    order: "asc",
  });
  const paymentAccounts = paymentAccountsResponse.data?.data?.data ?? [];
  const accountMeta = paymentAccountsResponse.data?.data?.meta;

  const loadPaymentAccount = async (id: string) => {
    try {
      const { data } = await getPaymentAccount(id);
      setSelectedPaymentAccount(data);
      setAccountEditType(data.type);
      setAccountEditLabel(data.label);
      setAccountEditName(data.account_name);
      setAccountEditNumber(data.account_number);
      setAccountEditDetails(data.details ?? "");
      setIsAccountEditOpen(true);
    } catch (error) {
      toast({ title: "Unable to load account", description: "Failed to retrieve payment account details.", variant: "destructive" });
    }
  };

  const handleCreatePaymentAccount = async () => {
    if (!accountCreateLabel || !accountCreateName || !accountCreateNumber) {
      toast({ title: "Validation error", description: "Fill in all required fields.", variant: "destructive" });
      return;
    }
    setIsAccountCreating(true);
    try {
      const { data } = await createPaymentAccount({
        type: accountCreateType,
        label: accountCreateLabel,
        account_name: accountCreateName,
        account_number: accountCreateNumber,
        details: accountCreateDetails || undefined,
      });
      addPaymentAccount(data);
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      toast({ title: "Payment account created" });
      setIsAccountCreateOpen(false);
      setAccountCreateType("bank");
      setAccountCreateLabel("");
      setAccountCreateName("");
      setAccountCreateNumber("");
      setAccountCreateDetails("");
    } catch (error) {
      toast({ title: "Create failed", description: "Unable to create payment account.", variant: "destructive" });
    } finally {
      setIsAccountCreating(false);
    }
  };

  const handleUpdatePaymentAccount = async () => {
    if (!selectedPaymentAccount) return;
    setIsAccountSaving(true);
    try {
      const { data } = await updatePaymentAccount(selectedPaymentAccount.id, {
        type: accountEditType,
        label: accountEditLabel,
        account_name: accountEditName,
        account_number: accountEditNumber,
        details: accountEditDetails || undefined,
      });
      updatePaymentAccountInStore(data);
      setSelectedPaymentAccount(data);
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      toast({ title: "Payment account updated" });
      setIsAccountEditOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to save payment account.", variant: "destructive" });
    } finally {
      setIsAccountSaving(false);
    }
  };

  const handleDeletePaymentAccount = async () => {
    if (!accountToDelete) return;
    try {
      await deletePaymentAccount(accountToDelete);
      removePaymentAccount(accountToDelete);
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      toast({ title: "Payment account deleted" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to remove payment account.", variant: "destructive" });
    } finally {
      setAccountToDelete(null);
      setIsAccountDeleteOpen(false);
    }
  };

  useEffect(() => setAccountPage(1), [accountSearch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <h3 className="font-display font-semibold">Payment Accounts</h3>
        <Button onClick={() => setIsAccountCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Account
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)} className="pl-9" placeholder="Search accounts..." />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {paymentAccounts.map((account) => (
          <div key={account.id} className="border rounded-lg p-4 flex flex-col justify-between gap-3">
            <div>
              <p className="font-medium text-sm">{account.label}</p>
              <p className="text-xs text-muted-foreground">{account.account_name} · {account.account_number}</p>
              <Badge variant="outline" className="text-xs capitalize mt-2">{account.type.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadPaymentAccount(account.id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setAccountToDelete(account.id); setIsAccountDeleteOpen(true); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {accountMeta && accountMeta.total > accountMeta.limit && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <Button disabled={accountPage === 1} onClick={() => setAccountPage((current) => current - 1)}>Prev</Button>
          <span>Page {accountMeta.page} of {Math.ceil(accountMeta.total / accountMeta.limit)}</span>
          <Button disabled={accountPage * accountMeta.limit >= accountMeta.total} onClick={() => setAccountPage((current) => current + 1)}>Next</Button>
        </div>
      )}
      <BaseDialog open={isAccountCreateOpen} onOpenChange={setIsAccountCreateOpen} maxWidth="2xl">
        <AppDialogHeader title="Add Payment Account" subtitle="Create a new payment account for transfers" />
        <AppDialogSection title="Account Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={accountCreateType} onValueChange={(v: any) => setAccountCreateType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                  <SelectItem value="cbe_birr">CBE Birr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Label</Label><Input value={accountCreateLabel} onChange={(e) => setAccountCreateLabel(e.target.value)} /></div>
            <div className="space-y-1"><Label>Account Name</Label><Input value={accountCreateName} onChange={(e) => setAccountCreateName(e.target.value)} /></div>
            <div className="space-y-1"><Label>Account Number</Label><Input value={accountCreateNumber} onChange={(e) => setAccountCreateNumber(e.target.value)} /></div>
            <div className="col-span-2 space-y-1"><Label>Details</Label><Textarea value={accountCreateDetails} onChange={(e) => setAccountCreateDetails(e.target.value)} rows={3} /></div>
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsAccountCreateOpen(false) }}
          primaryAction={{
            label: "Create",
            onClick: handleCreatePaymentAccount,
            disabled: isAccountCreating,
            loading: isAccountCreating
          }}
        />
      </BaseDialog>
      <BaseDialog open={isAccountEditOpen} onOpenChange={(open) => { if (!open) { setIsAccountEditOpen(false); setSelectedPaymentAccount(null); } }} maxWidth="2xl">
        <AppDialogHeader title="Edit Payment Account" subtitle="Update payment account details" />
        <AppDialogSection title="Account Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={accountEditType} onValueChange={(v: any) => setAccountEditType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                  <SelectItem value="cbe_birr">CBE Birr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Label</Label><Input value={accountEditLabel} onChange={(e) => setAccountEditLabel(e.target.value)} /></div>
            <div className="space-y-1"><Label>Account Name</Label><Input value={accountEditName} onChange={(e) => setAccountEditName(e.target.value)} /></div>
            <div className="space-y-1"><Label>Account Number</Label><Input value={accountEditNumber} onChange={(e) => setAccountEditNumber(e.target.value)} /></div>
            <div className="col-span-2 space-y-1"><Label>Details</Label><Textarea value={accountEditDetails} onChange={(e) => setAccountEditDetails(e.target.value)} rows={3} /></div>
          </div>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => { setIsAccountEditOpen(false); setSelectedPaymentAccount(null); } }}
          primaryAction={{
            label: "Save Changes",
            onClick: handleUpdatePaymentAccount,
            disabled: isAccountSaving,
            loading: isAccountSaving
          }}
        />
      </BaseDialog>
      <BaseDialog open={isAccountDeleteOpen} onOpenChange={setIsAccountDeleteOpen} maxWidth="lg">
        <AppDialogHeader title="Delete Payment Account" subtitle="This action cannot be undone" />
        <AppDialogSection>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this payment account?</p>
        </AppDialogSection>
        <AppDialogFooter
          secondaryAction={{ label: "Cancel", onClick: () => setIsAccountDeleteOpen(false) }}
          primaryAction={{
            label: "Delete",
            onClick: handleDeletePaymentAccount,
            variant: "destructive"
          }}
        />
      </BaseDialog>
    </div>
  );
};

export default PaymentAccountsSection;
