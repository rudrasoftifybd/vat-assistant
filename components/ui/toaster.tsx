"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--canvas)",
          color: "var(--ink)",
          border: "1px solid var(--hairline)",
          borderRadius: "14px",
          fontSize: "15px",
          boxShadow: "none",
        },
      }}
    />
  );
}
