import { Suspense } from "react";
import { IzinClient } from "./izin-client";

export default function MemberIzinPage() {
  return (
    <Suspense>
      <IzinClient />
    </Suspense>
  );
}
