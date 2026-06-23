"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguageStore } from "@/store/use-language";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Plus, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import { formatCurrency, calculateVAT, getFinancialYear } from "@/lib/utils";
import type { Client } from "@/types/database";

interface LineItem {
  name: string;
  quantity: number;
  unit_price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    client_id: "",
    customer_name: "",
    customer_bin: "",
    billing_address: "",
    invoice_date: new Date().toISOString().split("T")[0],
    vat_rate: "15",
  });
  const [items, setItems] = useState<LineItem[]>([
    { name: "", quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.user.id)
      .single();

    if (!profile?.org_id) return;

    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", profile.org_id);

    if (data) setClients(data);
  }

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setForm({
      ...form,
      client_id: clientId,
      customer_name: client?.name || "",
      customer_bin: client?.bin || "",
      billing_address: client?.address || "",
    });
  };

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const vatRate = parseFloat(form.vat_rate) || 15;
  const vatAmount = calculateVAT(subtotal, vatRate);
  const total = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) {
      setError("গ্রাহকের নাম আবশ্যক");
      return;
    }
    if (items.length === 0 || !items[0].name) {
      setError("কমপক্ষে একটি পণ্য যোগ করুন");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.user.id)
      .single();

    if (!profile?.org_id) return;

    const financialYear = getFinancialYear(new Date(form.invoice_date));

    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let seq = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.invoice_number.split("/")[1] || "0");
      seq = lastSeq + 1;
    }

    const invoiceNumber = `M-${financialYear.slice(-2)}/${seq.toString().padStart(6, "0")}`;

    const { error: saveError } = await supabase.from("invoices").insert({
      org_id: profile.org_id,
      client_id: form.client_id || null,
      invoice_number: invoiceNumber,
      invoice_date: form.invoice_date,
      customer_name: form.customer_name,
      customer_bin: form.customer_bin || null,
      billing_address: form.billing_address || null,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      })),
      subtotal,
      vat_amount: vatAmount,
      vat_rate: vatRate,
      total_amount: total,
      status: "issued",
    });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/dashboard/vat/invoices");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vat/invoices">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-[34px] font-[600] tracking-[-0.374px]">{t("invoices.new_invoice", language)}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px]">
              <CardHeader className="p-[24px] pb-0">
                <CardTitle className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">{t("invoices.customer", language)}</CardTitle>
              </CardHeader>
              <CardContent className="p-[24px] space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.select_customer", language)}</Label>
                  <Select
                    id="client"
                    value={form.client_id}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    placeholder={t("common.search", language) + "..."}
                    options={clients.map((c) => ({
                      value: c.id,
                      label: `${c.name} ${c.bin ? `(${c.bin})` : ""}`,
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">
                      {t("invoices.customer", language)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_name"
                      value={form.customer_name}
                      onChange={(e) =>
                        setForm({ ...form, customer_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_bin" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.customer_bin", language)}</Label>
                    <Input
                      id="customer_bin"
                      value={form.customer_bin}
                      onChange={(e) =>
                        setForm({ ...form, customer_bin: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_address" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.billing_address", language)}</Label>
                  <Input
                    id="billing_address"
                    value={form.billing_address}
                    onChange={(e) =>
                      setForm({ ...form, billing_address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_date" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.invoice_date", language)}</Label>
                    <Input
                      id="invoice_date"
                      type="date"
                      value={form.invoice_date}
                      onChange={(e) =>
                        setForm({ ...form, invoice_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat_rate" className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.vat_rate", language)} (%)</Label>
                    <Input
                      id="vat_rate"
                      type="number"
                      value={form.vat_rate}
                      onChange={(e) =>
                        setForm({ ...form, vat_rate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <p className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">{t("invoices.items", language)}</p>
              {items.map((item, index) => (
                <div key={index} className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px] space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`item-name-${index}`} className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.item_name", language)}</Label>
                        <Input
                          id={`item-name-${index}`}
                          value={item.name}
                          onChange={(e) => updateItem(index, "name", e.target.value)}
                          placeholder={t("invoices.item_name", language)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`item-qty-${index}`} className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.quantity", language)}</Label>
                          <Input
                            id={`item-qty-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`item-price-${index}`} className="text-[13px] font-[500] tracking-[-0.224px] text-[var(--ink-muted-80)]">{t("invoices.unit_price", language)}</Label>
                          <Input
                            id={`item-price-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(index, "unit_price", parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="mt-6 shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="text-right text-[17px] font-[600] tracking-[-0.374px]">
                    {t("invoices.total", language)}: {formatCurrency(item.quantity * item.unit_price, language)}
                  </div>
                </div>
              ))}
              <Button type="button" variant="secondary-pill" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                {t("invoices.add_item", language)}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[18px] p-[24px] space-y-4">
              <p className="text-[11px] font-[600] uppercase tracking-[0.5px] text-[var(--ink-muted-48)]">{t("invoices.total", language)}</p>
              <div className="flex justify-between py-3 border-b border-[var(--hairline)]">
                <span className="text-[17px] text-[var(--ink-muted-48)] tracking-[-0.374px]">{t("invoices.subtotal", language)}</span>
                <span className="text-[17px] font-[600] tracking-[-0.374px]">{formatCurrency(subtotal, language)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[var(--hairline)]">
                <span className="text-[17px] text-[var(--ink-muted-48)] tracking-[-0.374px]">{t("invoices.vat_amount", language)} ({vatRate}%)</span>
                <span className="text-[17px] font-[600] tracking-[-0.374px]">{formatCurrency(vatAmount, language)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-[20px] font-[700] tracking-[-0.374px] text-[var(--primary)]">{t("invoices.total", language)}</span>
                <span className="text-[20px] font-[700] tracking-[-0.374px] text-[var(--primary)]">{formatCurrency(total, language)}</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? t("common.saving", language) : t("common.save", language)}
              </Button>
              <Button type="button" variant="outline" className="w-full gap-2">
                <Printer className="h-4 w-4" />
                {t("invoices.print", language)}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
