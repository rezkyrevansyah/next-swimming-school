"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserX, UserPlus } from "lucide-react";
import { assignCoach, unassignCoach } from "@/lib/actions/class";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CoachOption {
  id: string;
  coach_id_code: string;
  coach_profiles: { full_name: string } | null;
}

interface AssignedCoach {
  coach_id: string;
  coaches: {
    coach_id_code: string;
    coach_profiles: { full_name: string } | null;
  } | null;
}

interface Props {
  classId: string;
  assignedCoaches: AssignedCoach[];
  availableCoaches: CoachOption[];
}

export function CoachTab({ classId, assignedCoaches, availableCoaches }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");

  const assignedIds = new Set(assignedCoaches.map((c) => c.coach_id));
  const unassigned = availableCoaches.filter((c) => !assignedIds.has(c.id));

  function handleAssign() {
    if (!selectedCoachId) return;
    startTransition(async () => {
      const result = await assignCoach(classId, selectedCoachId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Pelatih berhasil ditugaskan");
      setSelectedCoachId("");
    });
  }

  function handleUnassign(coachId: string) {
    startTransition(async () => {
      const result = await unassignCoach(classId, coachId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Pelatih berhasil dihapus dari kelas");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pelatih Kelas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assigned list */}
        {assignedCoaches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada pelatih ditugaskan.
          </p>
        ) : (
          <ul className="space-y-2">
            {assignedCoaches.map((ac) => {
              const profile = Array.isArray(ac.coaches?.coach_profiles)
                ? ac.coaches?.coach_profiles[0]
                : ac.coaches?.coach_profiles;
              return (
                <li
                  key={ac.coach_id}
                  className="flex items-center justify-between rounded-lg border px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {profile?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {ac.coaches?.coach_id_code}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleUnassign(ac.coach_id)}
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Add coach */}
        {unassigned.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Pilih pelatih..." />
              </SelectTrigger>
              <SelectContent>
                {unassigned.map((c) => {
                  const profile = Array.isArray(c.coach_profiles)
                    ? (c.coach_profiles as { full_name: string }[])[0]
                    : c.coach_profiles;
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {profile?.full_name ?? "—"} ({c.coach_id_code})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssign}
              disabled={!selectedCoachId || isPending}
              size="sm"
            >
              <UserPlus className="h-4 w-4" />
              Tugaskan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
