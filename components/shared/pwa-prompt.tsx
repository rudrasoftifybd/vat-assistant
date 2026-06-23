"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[var(--canvas)] rounded-[18px] border border-[var(--hairline)] p-4 shadow-lg">
      <div className="w-[36px] h-[36px] rounded-[10px] bg-[var(--action-blue)]/10 flex items-center justify-center">
        <Download className="h-4 w-4 text-[var(--action-blue)]" />
      </div>
      <span className="text-[14px] font-[500] text-[var(--ink)]">{window.navigator.language?.startsWith("bn") ? "অ্যাপ ইনস্টল করুন" : "Install App"}</span>
      <Button variant="primary" size="sm" onClick={handleInstall}>{window.navigator.language?.startsWith("bn") ? "ইনস্টল" : "Install"}</Button>
    </div>
  );
}
