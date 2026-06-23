import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("বৈধ ইমেইল ঠিকানা দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

export const signupSchema = z
  .object({
    email: z.string().email("বৈধ ইমেইল ঠিকানা দিন"),
    password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
    confirmPassword: z.string(),
    fullName: z.string().min(1, "পূর্ণ নাম আবশ্যক"),
    orgName: z.string().min(1, "প্রতিষ্ঠানের নাম আবশ্যক"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড মিলছে না",
    path: ["confirmPassword"],
  });

export const clientSchema = z.object({
  name: z.string().min(1, "নাম আবশ্যক"),
  bin: z.string().optional().nullable(),
  tin: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("বৈধ ইমেইল দিন").optional().or(z.literal("")).nullable(),
  business_type: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  annual_turnover: z.number().positive().optional().nullable(),
  registration_date: z.string().optional().nullable(),
  vat_registered: z.boolean().default(true),
});

export const vatReturnSchema = z.object({
  client_id: z.string().min(1, "ক্লায়েন্ট নির্বাচন করুন"),
  period_month: z.number().min(1).max(12),
  period_year: z.number().min(2020).max(2100),
  total_sales: z.number().min(0, "বিক্রয়ের পরিমাণ ধনাত্মক হতে হবে"),
  total_purchases: z.number().min(0, "ক্রয়ের পরিমাণ ধনাত্মক হতে হবে"),
  adjustments: z.number().default(0),
});

export const invoiceItemSchema = z.object({
  name: z.string().min(1, "পণ্যের নাম আবশ্যক"),
  quantity: z.number().positive("পরিমাণ ধনাত্মক হতে হবে"),
  unit_price: z.number().positive("একক মূল্য ধনাত্মক হতে হবে"),
});

export const invoiceSchema = z.object({
  client_id: z.string().optional().nullable(),
  customer_name: z.string().min(1, "গ্রাহকের নাম আবশ্যক"),
  customer_bin: z.string().optional().nullable(),
  billing_address: z.string().optional().nullable(),
  invoice_date: z.string().min(1, "চালানের তারিখ আবশ্যক"),
  vat_rate: z.number().default(15),
  items: z.array(invoiceItemSchema).min(1, "কমপক্ষে একটি পণ্য যোগ করুন"),
});

export const complianceTaskSchema = z.object({
  client_id: z.string().optional().nullable(),
  title: z.string().min(1, "শিরোনাম আবশ্যক"),
  description: z.string().optional().nullable(),
  due_date: z.string().min(1, "তারিখ আবশ্যক"),
  type: z.string().min(1, "ধরন নির্বাচন করুন"),
});

export const registerEntrySchema = z.object({
  client_id: z.string().optional().nullable(),
  type: z.enum(["purchase", "sales"]),
  entry_date: z.string().min(1, "তারিখ আবশ্যক"),
  party_name: z.string().min(1, "পক্ষের নাম আবশ্যক"),
  party_bin: z.string().optional().nullable(),
  product_name: z.string().min(1, "পণ্যের নাম আবশ্যক"),
  quantity: z.number().positive("পরিমাণ ধনাত্মক হতে হবে"),
  unit_price: z.number().positive("একক মূল্য ধনাত্মক হতে হবে"),
  vat_amount: z.number().min(0).default(0),
  invoice_ref: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type VatReturnInput = z.infer<typeof vatReturnSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type ComplianceTaskInput = z.infer<typeof complianceTaskSchema>;
export type RegisterEntryInput = z.infer<typeof registerEntrySchema>;
