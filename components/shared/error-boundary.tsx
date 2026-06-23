"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-lg font-semibold">একটি ত্রুটি হয়েছে</h2>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md">
            {this.state.error?.message || "পৃষ্ঠাটি লোড করতে সমস্যা হয়েছে"}
          </p>
          <Button onClick={() => window.location.reload()}>পুনরায় লোড করুন</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
