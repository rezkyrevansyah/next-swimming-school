"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ExternalLink, Pencil, X } from "lucide-react";
import { updateClassProgramUrl } from "@/lib/actions/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  classId: string;
  programUrl?: string | null;
}

export function ProgramUrlSection({ classId, programUrl }: Props) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(programUrl ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateClassProgramUrl(classId, url);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("URL program berhasil disimpan");
      setEditing(false);
    });
  }

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Program Latihan
        </p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3 w-3" />
            {url ? "Edit URL" : "Tambah URL"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/..."
            className="text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setEditing(false); setUrl(programUrl ?? ""); }}
              disabled={isPending}
            >
              <X className="h-3.5 w-3.5" />
              Batal
            </Button>
          </div>
        </div>
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Buka Spreadsheet Program
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada link program. Klik &ldquo;Tambah URL&rdquo; untuk menambahkan.</p>
      )}
    </div>
  );
}
