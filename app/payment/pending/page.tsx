import { Suspense } from "react";
import PaymentPendingClient from "./PaymentPendingClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPendingClient />
    </Suspense>
  );
}