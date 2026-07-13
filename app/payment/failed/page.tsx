import { Suspense } from "react";
import PaymentFailedClient from "./PaymentFailedClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailedClient />
    </Suspense>
  );
}