"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserX, UserPlus, Search } from "lucide-react";
import { enrollMember, unenrollMember } from "@/lib/actions/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnrolledMember {
  member_id: string;
  status: string;
  joined_at: string;
  members: {
    member_id_code: string;
    member_profiles: { full_name: string } | null;
  } | null;
}

interface MemberOption {
  id: string;
  member_id_code: string;
  member_profiles: { full_name: string } | null;
}

interface Props {
  classId: string;
  capacity: number;
  enrolled: EnrolledMember[];
  availableMembers: MemberOption[];
}

const STATUS_LABEL: Record<string, string> = {
  enrolled: "Aktif",
  withdrawn: "Keluar",
  completed: "Selesai",
};
const STATUS_VARIANT: Record<string, "default" | "outline" | "secondary"> = {
  enrolled: "default",
  withdrawn: "outline",
  completed: "secondary",
};

export function MemberRosterTab({
  classId,
  capacity,
  enrolled,
  availableMembers,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const activeCount = enrolled.filter((e) => e.status === "enrolled").length;
  const enrolledIds = new Set(
    enrolled.filter((e) => e.status === "enrolled").map((e) => e.member_id)
  );
  const available = availableMembers.filter((m) => !enrolledIds.has(m.id));

  const filteredEnrolled = enrolled.filter((e) => {
    const profile = Array.isArray(e.members?.member_profiles)
      ? (e.members?.member_profiles as { full_name: string }[])[0]
      : e.members?.member_profiles;
    const name = profile?.full_name?.toLowerCase() ?? "";
    const code = e.members?.member_id_code?.toLowerCase() ?? "";
    const q = search.toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  const filteredAvailable = available.filter((m) => {
    const profile = Array.isArray(m.member_profiles)
      ? (m.member_profiles as { full_name: string }[])[0]
      : m.member_profiles;
    const name = profile?.full_name?.toLowerCase() ?? "";
    const code = m.member_id_code.toLowerCase();
    const q = memberSearch.toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  function handleEnroll(memberId: string) {
    startTransition(async () => {
      const result = await enrollMember(classId, memberId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Anggota berhasil didaftarkan");
      setMemberSearch("");
    });
  }

  function handleUnenroll(memberId: string) {
    if (!confirm("Keluarkan anggota dari kelas ini?")) return;
    startTransition(async () => {
      const result = await unenrollMember(classId, memberId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Anggota berhasil dikeluarkan");
    });
  }

  return (
    <div className="space-y-4">
      {/* Roster */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Roster Anggota</span>
            <span className="text-sm font-normal text-muted-foreground">
              {activeCount} / {capacity} peserta
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {enrolled.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari anggota dalam roster..."
                className="pl-8"
              />
            </div>
          )}

          {filteredEnrolled.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? "Tidak ada anggota yang cocok." : "Belum ada anggota terdaftar."}
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredEnrolled.map((e) => {
                const profile = Array.isArray(e.members?.member_profiles)
                  ? (e.members?.member_profiles as { full_name: string }[])[0]
                  : e.members?.member_profiles;
                return (
                  <li
                    key={e.member_id}
                    className="flex items-center justify-between rounded-lg border px-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {profile?.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {e.members?.member_id_code}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[e.status] ?? "outline"}>
                        {STATUS_LABEL[e.status] ?? e.status}
                      </Badge>
                      {e.status === "enrolled" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleUnenroll(e.member_id)}
                          disabled={isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add member */}
      {activeCount < capacity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Daftarkan Anggota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Cari anggota aktif..."
                className="pl-8"
              />
            </div>

            {memberSearch && (
              <ul className="space-y-1 max-h-60 overflow-y-auto border rounded-lg divide-y">
                {filteredAvailable.length === 0 ? (
                  <li className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada anggota yang cocok.
                  </li>
                ) : (
                  filteredAvailable.slice(0, 20).map((m) => {
                    const profile = Array.isArray(m.member_profiles)
                      ? (m.member_profiles as { full_name: string }[])[0]
                      : m.member_profiles;
                    return (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-muted/50"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {profile?.full_name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {m.member_id_code}
                          </p>
                        </div>
                        <Button
                          size="xs"
                          onClick={() => handleEnroll(m.id)}
                          disabled={isPending}
                        >
                          <UserPlus className="h-3 w-3" />
                          Daftarkan
                        </Button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {activeCount >= capacity && (
        <p className="text-sm text-center text-muted-foreground border rounded-lg py-4">
          Kapasitas kelas penuh ({capacity} peserta).
        </p>
      )}
    </div>
  );
}
