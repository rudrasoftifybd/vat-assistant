"use client";

import { useCallback } from "react";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { useLanguageStore } from "@/store/use-language";
import type { FormSchema } from "@/lib/forms/schema";

interface FormBuilderProps {
  schema: FormSchema;
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  errors: Record<string, string>;
  onAutoFill?: () => void;
  readOnly?: boolean;
}

export function FormBuilder({ schema, formData, onChange, errors, onAutoFill, readOnly }: FormBuilderProps) {
  const { language } = useLanguageStore();

  const setField = useCallback((fieldId: string, value: unknown) => {
    onChange({ ...formData, [fieldId]: value });
  }, [formData, onChange]);

  const handleArrayAdd = (fieldId: string) => {
    const arr = (formData[fieldId] as Record<string, unknown>[]) || [];
    onChange({ ...formData, [fieldId]: [...arr, {}] });
  };

  const handleArrayRemove = (fieldId: string, index: number) => {
    const arr = (formData[fieldId] as Record<string, unknown>[]) || [];
    onChange({ ...formData, [fieldId]: arr.filter((_, i) => i !== index) });
  };

  const handleArrayFieldChange = (fieldId: string, index: number, subFieldId: string, value: unknown) => {
    const arr = [...((formData[fieldId] as Record<string, unknown>[]) || [])];
    arr[index] = { ...arr[index], [subFieldId]: value };
    onChange({ ...formData, [fieldId]: arr });
  };

  return (
    <div className="space-y-6">
      {schema.sections.map((section) => (
        <div key={section.id} className="space-y-3 rounded-lg border p-4">
          <h3 className="font-semibold text-sm text-[var(--primary)] uppercase tracking-wide">
            {language === "bn" ? section.titleBn : section.titleEn}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.fields.map((field) => {
              if (field.type === "array") {
                const items = (formData[field.id] as Record<string, unknown>[]) || [];
                return (
                  <div key={field.id} className="col-span-full space-y-2">
                    <Label className="text-xs font-medium">
                      {language === "bn" ? field.labelBn : field.labelEn}
                    </Label>
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-2 items-start rounded-md border p-3 bg-[var(--background)]">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          {field.fields?.map((sf) => (
                            <FormField
                              key={sf.id}
                              field={sf}
                              value={item[sf.id]}
                              onChange={(v) => handleArrayFieldChange(field.id, i, sf.id, v)}
                            />
                          ))}
                        </div>
                        <Button variant="ghost" size="icon" className="mt-6 shrink-0" onClick={() => handleArrayRemove(field.id, i)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleArrayAdd(field.id)}>
                      <Plus className="h-3 w-3" /> {language === "bn" ? "যোগ করুন" : "Add"}
                    </Button>
                    {errors[field.id] && <p className="text-xs text-red-500">{errors[field.id]}</p>}
                  </div>
                );
              }

              return (
                <FormField
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(v) => setField(field.id, v)}
                  error={errors[field.id]}
                />
              );
            })}
          </div>
        </div>
      ))}
      {onAutoFill && !readOnly && (
        <Button variant="outline" size="sm" className="gap-1" onClick={onAutoFill}>
          <Sparkles className="h-3 w-3" /> {language === "bn" ? "স্বয়ং-পূরণ" : "Auto-Fill"}
        </Button>
      )}
    </div>
  );
}

export function validateForm(schema: FormSchema, data: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.validation?.required) {
        const val = data[field.id];
        if (val == null || val === "" || (typeof val === "number" && val === 0)) {
          errors[field.id] = `${field.labelBn} আবশ্যক`;
        }
      }
      if (field.type === "number" && field.validation) {
        const num = Number(data[field.id]);
        if (field.validation.min != null && num < field.validation.min) {
          errors[field.id] = `সর্বনিম্ন ${field.validation.min}`;
        }
        if (field.validation.max != null && num > field.validation.max) {
          errors[field.id] = `সর্বোচ্চ ${field.validation.max}`;
        }
      }
    }
  }
  return errors;
}
