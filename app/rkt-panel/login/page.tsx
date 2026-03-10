import { Suspense } from "react";

import { RktPanelLoginView } from "@/components/rkt-panel/login-view";

export default function RktPanelLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <RktPanelLoginView />
    </Suspense>
  );
}
