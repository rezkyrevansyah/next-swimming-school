"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, EyeOff, Eye, GripVertical } from "lucide-react";
import {
  createSkillCriteria,
  updateSkillCriteria,
  deleteSkillCriteria,
  reorderSkillCriteria,
} from "@/lib/actions/rapot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillCriterion {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  branchId: string;
  branchName: string;
  initialCriteria: SkillCriterion[];
}

export function SkillCriteriaSection({ branchId, branchName, initialCriteria }: Props) {
  const [isPending, startTransition] = useTransition();
  const [criteria, setCriteria] = useState(initialCriteria);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function startEdit(c: SkillCriterion) {
    setEditingId(c.id);
    setEditLabel(c.label);
    setEditDescription(c.description ?? "");
  }

  function handleUpdate(id: string) {
    if (!editLabel.trim()) { toast.error("Label wajib diisi"); return; }
    startTransition(async () => {
      const result = await updateSkillCriteria(id, { label: editLabel, description: editDescription });
      if (result.error) { toast.error(result.error); return; }
      setCriteria((prev) => prev.map((c) => c.id === id ? { ...c, label: editLabel, description: editDescription || null } : c));
      setEditingId(null);
      toast.success("Kriteria diperbarui");
    });
  }

  function handleToggleActive(c: SkillCriterion) {
    startTransition(async () => {
      const result = await updateSkillCriteria(c.id, { is_active: !c.is_active });
      if (result.error) { toast.error(result.error); return; }
      setCriteria((prev) => prev.map((x) => x.id === c.id ? { ...x, is_active: !c.is_active } : x));
    });
  }

  function handleDelete(id: string, label: string) {
    if (!confirm(`Hapus kriteria "${label}"? Data skill_scores yang sudah ada tidak akan dihapus.`)) return;
    startTransition(async () => {
      const result = await deleteSkillCriteria(id);
      if (result.error) { toast.error(result.error); return; }
      setCriteria((prev) => prev.filter((c) => c.id !== id));
      toast.success("Kriteria dihapus");
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) { toast.error("Label wajib diisi"); return; }
    const fd = new FormData();
    fd.set("branch_id", branchId);
    fd.set("label", newLabel);
    fd.set("description", newDescription);
    startTransition(async () => {
      const result = await createSkillCriteria(fd);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Kriteria ditambahkan");
      setNewLabel("");
      setNewDescription("");
      setShowAdd(false);
      // Refresh list by re-fetching would require router.refresh()
      // We trigger revalidatePath server-side, so just tell user to refresh if needed
    });
  }

  // Drag-and-drop reorder
  function handleDragStart(id: string) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOverId(id); }
  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const oldIndex = criteria.findIndex((c) => c.id === dragId);
    const newIndex = criteria.findIndex((c) => c.id === targetId);
    const reordered = [...criteria];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const withOrder = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCriteria(withOrder);
    setDragId(null);
    setDragOverId(null);
    startTransition(async () => {
      await reorderSkillCriteria(withOrder.map(({ id, sort_order }) => ({ id, sort_order })));
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Kriteria Penilaian — {branchName}</span>
          <Button size="sm" variant="outline" onClick={() => setShowAdd((v) => !v)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Tambah
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {showAdd && (
          <form onSubmit={handleAdd} className="rounded-lg border p-3 space-y-2 bg-muted/30">
            <div className="space-y-1">
              <Label className="text-xs">Label <span className="text-destructive">*</span></Label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="contoh: Teknik Gaya Bebas"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Deskripsi (opsional)</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Keterangan singkat..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>Simpan</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Batal</Button>
            </div>
          </form>
        )}

        {criteria.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada kriteria. Tambah di atas.</p>
        )}

        {criteria.map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={() => handleDragStart(c.id)}
            onDragOver={(e) => handleDragOver(e, c.id)}
            onDrop={() => handleDrop(c.id)}
            className={cn(
              "rounded-lg border p-3 transition-colors",
              !c.is_active && "opacity-50",
              dragOverId === c.id && dragId !== c.id && "border-primary bg-primary/5"
            )}
          >
            {editingId === c.id ? (
              <div className="space-y-2">
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  autoFocus
                />
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Deskripsi (opsional)"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleUpdate(c.id)} disabled={isPending}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium">{c.label}</p>
                    <code className="text-xs text-muted-foreground font-mono bg-muted px-1 rounded">{c.key}</code>
                    {!c.is_active && <Badge variant="outline" className="text-xs">Nonaktif</Badge>}
                  </div>
                  {c.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(c)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={c.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {c.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.label)}
                    className="p-1.5 rounded hover:bg-muted text-destructive hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
