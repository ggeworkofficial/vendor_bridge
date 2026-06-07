import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockSocialLinks, mockContactPhones, type SocialLink, type ContactPhone } from "@/lib/contact-data";

const ContactAdminSection = () => {
  const [socialLinks, setSocialLinks] = useState(mockSocialLinks);
  const [phones, setPhones] = useState(mockContactPhones);
  const [editDialog, setEditDialog] = useState<{ type: "social" | "phone" | null; item?: any }>({ type: null });

  const deleteSocial = (id: string) => setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  const deletePhone = (id: string) => setPhones((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Social Media Links</h3>
          <Button size="sm" onClick={() => setEditDialog({ type: "social" })}><Plus className="h-4 w-4 mr-1" /> Add Link</Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialLinks.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.platform}</TableCell>
                  <TableCell>{l.label}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{l.type}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{l.url}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDialog({ type: "social", item: l })}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSocial(l.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Phone Numbers</h3>
          <Button size="sm" onClick={() => setEditDialog({ type: "phone" })}><Plus className="h-4 w-4 mr-1" /> Add Phone</Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {phones.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div><p className="font-medium text-sm">{p.label}</p><p className="text-muted-foreground text-sm">{p.number}</p></div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDialog({ type: "phone", item: p })}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePhone(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <button onClick={() => setEditDialog({ type: "phone" })} className="border-2 border-dashed rounded-lg p-4 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Phone
          </button>
        </div>
      </div>
      <Dialog open={editDialog.type !== null} onOpenChange={() => setEditDialog({ type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDialog.item ? "Edit" : "Add"} {editDialog.type === "social" ? "Social Link" : "Phone Number"}</DialogTitle>
          </DialogHeader>
          {editDialog.type === "social" ? (
            <div className="space-y-3">
              <div><Label>Platform</Label><Input defaultValue={editDialog.item?.platform} placeholder="e.g. Telegram, Facebook" /></div>
              <div><Label>Label</Label><Input defaultValue={editDialog.item?.label} placeholder="e.g. Follow us on Telegram" /></div>
              <div><Label>URL</Label><Input defaultValue={editDialog.item?.url} placeholder="https://..." /></div>
              <div>
                <Label>Type</Label>
                <Select defaultValue={editDialog.item?.type || "follow"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow">Follow (channels, pages)</SelectItem>
                    <SelectItem value="message">Message (direct chat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div><Label>Label</Label><Input defaultValue={editDialog.item?.label} placeholder="e.g. Main Office" /></div>
              <div><Label>Phone Number</Label><Input defaultValue={editDialog.item?.number} placeholder="+251 ..." /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ type: null })}>Cancel</Button>
            <Button onClick={() => setEditDialog({ type: null })}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactAdminSection;
