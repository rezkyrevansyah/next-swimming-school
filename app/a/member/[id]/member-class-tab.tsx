"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { enrollMember, unenrollMember } from "@/lib/actions/class";

interface ClassItem {
  id: string;
  name: string;
  status: string;
}

interface EnrolledEntry {
  status: string;
  classes: ClassItem | null;
}

interface AvailableClass {
  id: string;
  name: string;
}

interface Props {
  memberId: string;
  enrolled: EnrolledEntry[];
  availableClasses: AvailableClass[];
}

export function MemberClassTab({ memberId, enrolled, availableClasses }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  // Optimistic: track locally enrolled/unenrolled IDs so UI updates instantly
  // before server re-render completes
  const [localEnrolledIds, setLocalEnrolledIds] = useState<Set<string>>(new Set());
  const [localUnenrolledIds, setLocalUnenrolledIds] = useState<Set<string>>(new Set());

  // Reset local state when server data refreshes
  useEffect(() => {
    setLocalEnrolledIds(new Set());
    setLocalUnenrolledIds(new Set());
  }, [enrolled]);

  const serverEnrolledIds = new Set(
    enrolled.filter((e) => e.status === "enrolled").map((e) => e.classes?.id).filter(Boolean) as string[]
  );
  // Merge: server + local additions, minus local removals
  const effectiveEnrolledIds = new Set([
    ...serverEnrolledIds,
    ...localEnrolledIds,
  ]);
  localUnenrolledIds.forEach((id) => effectiveEnrolledIds.delete(id));

  const unenrolledClasses = availableClasses.filter((c) => !effectiveEnrolledIds.has(c.id));

  // Active enrollments: server data minus local removals, plus local additions
  const serverActive = enrolled.filter((e) => {
    if (e.status !== "enrolled") return false;
    const classId = e.classes?.id;
    return classId && !localUnenrolledIds.has(classId);
  });
  const locallyAdded = [...localEnrolledIds]
    .filter((id) => !serverEnrolledIds.has(id))
    .map((id) => {
      const cls = availableClasses.find((c) => c.id === id);
      if (!cls) return null;
      return { status: "enrolled", classes: { id: cls.id, name: cls.name, status: "active" } } as EnrolledEntry;
    })
    .filter(Boolean) as EnrolledEntry[];
  const activeEnrollments = [...serverActive, ...locallyAdded];

  function handleEnroll() {
    if (!selectedClassId) return;
    setError(null);
    startTransition(async () => {
      const res = await enrollMember(selectedClassId, memberId);
      if (res.error) { setError(res.error); return; }
      setLocalEnrolledIds((prev) => new Set([...prev, selectedClassId]));
      setSelectedClassId("");
      router.refresh();
    });
  }

  function handleUnenroll(classId: string) {
    setError(null);
    startTransition(async () => {
      const res = await unenrollMember(classId, memberId);
      if (res.error) { setError(res.error); return; }
      setLocalUnenrolledIds((prev) => new Set([...prev, classId]));
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Enrolled classes */}
      <div>
        <h3 className="text-sm font-medium mb-3">Kelas Terdaftar</h3>
        {activeEnrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
            Belum terdaftar di kelas manapun.
          </p>
        ) : (
          <div className="space-y-2">
            {activeEnrollments.map((e, i) => {
              const cls = e.classes;
              if (!cls) return null;
              return (
                <div key={cls.id ?? i} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <Link href={`/a/kelas/${cls.id}`} className="text-sm font-medium hover:underline">
                        {cls.name}
                      </Link>
                      <Badge variant={cls.status === "active" ? "default" : "outline"} className="ml-2 text-xs">
                        {cls.status === "active" ? "Aktif" : cls.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => handleUnenroll(cls.id)}
                    aria-label="Keluarkan dari kelas"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enroll to new class */}
      <div>
        <h3 className="text-sm font-medium mb-3">Daftarkan ke Kelas</h3>
        {unenrolledClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
            Semua kelas aktif sudah didaftarkan.
          </p>
        ) : (
          <div className="flex gap-2">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Pilih kelas...</option>
              {unenrolledClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button size="sm" disabled={!selectedClassId || isPending} onClick={handleEnroll}>
              <Plus className="h-4 w-4 mr-1" />
              Daftarkan
            </Button>
          </div>
        )}
      </div>

      {/* Withdrawn/history */}
      {enrolled.filter((e) => e.status !== "enrolled").length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Riwayat</h3>
          <div className="space-y-1">
            {enrolled.filter((e) => e.status !== "enrolled").map((e, i) => {
              const cls = e.classes;
              if (!cls) return null;
              return (
                <div key={cls.id ?? i} className="flex items-center justify-between rounded-lg border px-4 py-2 opacity-60">
                  <span className="text-sm">{cls.name}</span>
                  <Badge variant="outline" className="text-xs">{e.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
