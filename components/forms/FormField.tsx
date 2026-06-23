"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useLanguageStore } from "@/store/use-language";
import type { FormField as FormFieldType } from "@/lib/forms/schema";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  field: FormFieldType;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  const { language } = useLanguageStore();
  const label = language === "bn" ? field.labelBn : field.labelEn;
  const placeholder = language === "bn" ? field.placeholderBn : field.placeholderEn;

  if (field.type === "section") {
    return (
      <div className="col-span-full border-b pb-2 mb-2">
        <h3 className="font-semibold text-sm text-[var(--primary)]">{label}</h3>
      </div>
    );
  }

  if (field.type === "readonly") {
    return (
      <div className="space-y-1">
        <Label className="text-xs text-[var(--muted-foreground)]">{label}</Label>
        <div className="h-10 px-3 flex items-center rounded-md border border-[var(--input)] bg-[var(--muted)] text-sm">
          {String(value ?? field.defaultValue ?? "-")}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}{field.validation?.required && <span className="text-red-500 ml-1">*</span>}</Label>
        <Select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          options={(field.options || []).map((o) => ({
            value: o.value,
            label: language === "bn" ? o.labelBn : o.labelEn,
          }))}
          placeholder={placeholder || (language === "bn" ? "নির্বাচন করুন" : "Select")}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}{field.validation?.required && <span className="text-red-500 ml-1">*</span>}</Label>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm ring-offset-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            error && "border-red-500"
          )}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}{field.validation?.required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
