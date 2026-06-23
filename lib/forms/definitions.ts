import { getAllFormIds, getFormSchema } from "./schema";

export interface FormDefinition {
  id: string;
  titleBn: string;
  titleEn: string;
  description: string;
  category: FormCategory;
  adminOnly: boolean;
}

export type FormCategory =
  | "registration"
  | "invoices"
  | "returns"
  | "refunds"
  | "agents"
  | "adr"
  | "adjustments"
  | "enforcement"
  | "misc";

export const FORM_DEFINITIONS: FormDefinition[] = [
  // Registration
  { id: "mushak-2.1", titleBn: "নিবন্ধন/তালিকাভুক্তির আবেদনপত্র", titleEn: "Registration/Enlistment Application", description: "Mushak 2.1 — VAT or Turnover Tax registration", category: "registration", adminOnly: false },
  { id: "mushak-2.2", titleBn: "শাখা ইউনিট নিবন্ধন আবেদন", titleEn: "Branch Unit Registration", description: "Mushak 2.2 — Register a branch/unit", category: "registration", adminOnly: false },
  { id: "mushak-2.4", titleBn: "নিবন্ধন বাতিলের আবেদন", titleEn: "Cancellation of Registration", description: "Mushak 2.4 — Cancel VAT/TT registration", category: "registration", adminOnly: false },
  { id: "mushak-2.5", titleBn: "নিবন্ধন বাতিলের চূড়ান্ত রিটার্ন", titleEn: "Final Return for Cancellation", description: "Mushak 2.5 — Final return upon cancellation", category: "registration", adminOnly: false },
  { id: "mushak-2.6", titleBn: "তথ্য পরিবর্তনের নোটিফিকেশন", titleEn: "Information Change Notification", description: "Mushak 2.6 — Notify change of business info", category: "registration", adminOnly: false },
  { id: "mushak-2.7", titleBn: "ব্যবসা স্থান পরিবর্তন আবেদন", titleEn: "Business Place Change", description: "Mushak 2.7 — Change business location", category: "registration", adminOnly: false },
  // Agents
  { id: "mushak-3.1", titleBn: "ভ্যাট এজেন্ট সনদ আবেদন", titleEn: "VAT Agent Certificate Application", description: "Mushak 3.1 — Apply for agent license", category: "agents", adminOnly: false },
  { id: "mushak-3.3", titleBn: "এজেন্ট তথ্য পরিবর্তন", titleEn: "Agent Information Change", description: "Mushak 3.3 — Update agent details", category: "agents", adminOnly: false },
  { id: "mushak-3.4", titleBn: "অনিবাসী এজেন্ট অনুমোদন", titleEn: "Non-Resident Agent Authorization", description: "Mushak 3.4 — Authorize non-resident agent", category: "agents", adminOnly: false },
  // Adjustments
  { id: "mushak-4.1", titleBn: "অগ্রিম কর সমন্বয় আবেদন", titleEn: "Advance Tax Adjustment", description: "Mushak 4.1 — Adjust advance tax paid on imports", category: "adjustments", adminOnly: false },
  { id: "mushak-4.2", titleBn: "চলমান ব্যবসা ক্রয়/বিক্রয় যৌথ আবেদন", titleEn: "Business Sale/Purchase Joint Application", description: "Mushak 4.2 — Joint application for business transfer", category: "adjustments", adminOnly: false },
  { id: "mushak-7.1", titleBn: "রপ্তানি সমন্বয় আবেদন", titleEn: "Export Adjustment Application", description: "Mushak 7.1 — Adjust export-related tax", category: "adjustments", adminOnly: false },
  // Invoices & Registers
  { id: "mushak-6.1", titleBn: "ক্রয় রেজিস্টার", titleEn: "Purchase Register", description: "Mushak 6.1 — Record purchases", category: "invoices", adminOnly: false },
  { id: "mushak-6.2", titleBn: "বিক্রয় রেজিস্টার", titleEn: "Sales Register", description: "Mushak 6.2 — Record sales", category: "invoices", adminOnly: false },
  { id: "mushak-6.3", titleBn: "ট্যাক্স চালানপত্র", titleEn: "Tax Invoice", description: "Mushak 6.3 — Standard tax invoice", category: "invoices", adminOnly: false },
  { id: "mushak-6.4", titleBn: "চুক্তিভিত্তিক উৎপাদন চালান", titleEn: "Contract Manufacturing Invoice", description: "Mushak 6.4 — Manufacturing contract invoice", category: "invoices", adminOnly: false },
  { id: "mushak-6.5", titleBn: "পণ্য স্থানান্তর চালান", titleEn: "Goods Transfer Invoice", description: "Mushak 6.5 — Inter-branch goods transfer", category: "invoices", adminOnly: false },
  { id: "mushak-6.6", titleBn: "উৎসে কর কর্তন সনদ", titleEn: "TDS Certificate", description: "Mushak 6.6 — Source tax deduction certificate", category: "adjustments", adminOnly: false },
  { id: "mushak-6.7", titleBn: "ক্রেডিট নোট", titleEn: "Credit Note", description: "Mushak 6.7 — Credit note for returned goods", category: "invoices", adminOnly: false },
  { id: "mushak-6.8", titleBn: "ডেবিট নোট", titleEn: "Debit Note", description: "Mushak 6.8 — Debit note for additional charges", category: "invoices", adminOnly: false },
  { id: "mushak-6.9", titleBn: "টার্নওভার ট্যাক্স চালান", titleEn: "Turnover Tax Invoice", description: "Mushak 6.9 — Invoice for turnover tax", category: "invoices", adminOnly: false },
  // Returns
  { id: "mushak-9.1", titleBn: "ভ্যাট রিটার্ন (মাসিক)", titleEn: "VAT Return (Monthly)", description: "Mushak 9.1 — Monthly VAT return", category: "returns", adminOnly: false },
  { id: "mushak-9.2", titleBn: "টার্নওভার ট্যাক্স রিটার্ন", titleEn: "Turnover Tax Return", description: "Mushak 9.2 — Turnover tax return", category: "returns", adminOnly: false },
  { id: "mushak-9.3", titleBn: "বিলম্বে রিটার্ন জমার আবেদন", titleEn: "Late Return Application", description: "Mushak 9.3 — Apply to file late return", category: "returns", adminOnly: false },
  { id: "mushak-9.4", titleBn: "সংশোধিত রিটার্ন আবেদন", titleEn: "Amended Return Application", description: "Mushak 9.4 — Correct a filed return", category: "returns", adminOnly: false },
  // Refunds
  { id: "mushak-10.1", titleBn: "কূটনৈতিক রিফান্ড আবেদন", titleEn: "Diplomatic Refund Application", description: "Mushak 10.1 — VAT refund for diplomatic missions", category: "refunds", adminOnly: false },
  { id: "mushak-10.2", titleBn: "পর্যটক ভ্যাট রিফান্ড সনদ", titleEn: "Tourist VAT Refund Certificate", description: "Mushak 10.2 — VAT refund for tourists", category: "refunds", adminOnly: false },
  { id: "mushak-10.3", titleBn: "পর্যটক রিফান্ড অনুমোদন আবেদন", titleEn: "Tourist Refund Authorization", description: "Mushak 10.3 — Shop authorization for tourist refunds", category: "refunds", adminOnly: false },
  // Enforcement (Admin)
  { id: "mushak-12.1", titleBn: "প্রবেশ/তল্লাশি/জব্দ কর্তৃত্বপত্র", titleEn: "Entry/Search/Seizure Authority", description: "Mushak 12.1 — Admin: search warrant", category: "enforcement", adminOnly: true },
  { id: "mushak-12.2", titleBn: "আবাসস্থলে প্রবেশের নোটিশ", titleEn: "Residence Entry Notice", description: "Mushak 12.2 — Admin: entry notice", category: "enforcement", adminOnly: true },
  { id: "mushak-12.3", titleBn: "জব্দ তালিকা", titleEn: "Seizure List", description: "Mushak 12.3 — Admin: list of seized items", category: "enforcement", adminOnly: true },
  { id: "mushak-12.4", titleBn: "প্রাথমিক তদন্ত প্রতিবেদন", titleEn: "Preliminary Investigation Report", description: "Mushak 12.4 — Admin: preliminary report", category: "enforcement", adminOnly: true },
  { id: "mushak-12.5", titleBn: "চূড়ান্ত তদন্ত প্রতিবেদন", titleEn: "Final Investigation Report", description: "Mushak 12.5 — Admin: final report", category: "enforcement", adminOnly: true },
  { id: "mushak-12.6", titleBn: "অনিয়ম/কর ফাঁকি মামলা", titleEn: "Irregularity/Tax Evasion Case", description: "Mushak 12.6 — Admin: evasion case", category: "enforcement", adminOnly: true },
  { id: "mushak-12.7", titleBn: "আটককৃত যানবাহন মুক্তির আবেদন", titleEn: "Seized Vehicle Release Application", description: "Mushak 12.7 — Apply for vehicle release", category: "enforcement", adminOnly: false },
  { id: "mushak-12.8", titleBn: "যানবাহন মুক্তির জামিন/জামানত", titleEn: "Guarantee for Vehicle Release", description: "Mushak 12.8 — Guarantee for seized vehicle", category: "enforcement", adminOnly: false },
  { id: "mushak-12.9", titleBn: "ব্যাংক অ্যাকাউন্ট冻结 আদেশ", titleEn: "Bank Account Freeze Order", description: "Mushak 12.9 — Admin: freeze order", category: "enforcement", adminOnly: true },
  { id: "mushak-12.10", titleBn: "冻结 সম্মতি প্রতিবেদন", titleEn: "Freeze Compliance Report", description: "Mushak 12.10 — Admin: freeze report", category: "enforcement", adminOnly: true },
  { id: "mushak-12.11", titleBn: "冻结মুক্তির আদেশ", titleEn: "Bank Account Unfreeze Order", description: "Mushak 12.11 — Admin: unfreeze order", category: "enforcement", adminOnly: true },
  { id: "mushak-12.12", titleBn: "কারণ দর্শাও নোটিশ", titleEn: "Show Cause Notice", description: "Mushak 12.12 — Admin: show cause", category: "enforcement", adminOnly: true },
  { id: "mushak-12.13", titleBn: "নিষ্পত্তি আদেশ", titleEn: "Adjudication Order", description: "Mushak 12.13 — Admin: adjudication order", category: "enforcement", adminOnly: true },
  // Recovery (Admin)
  { id: "mushak-14.1", titleBn: "ঋণ আদায় সনদ", titleEn: "Debt Recovery Certificate", description: "Mushak 14.1 — Admin: debt recovery", category: "enforcement", adminOnly: true },
  { id: "mushak-14.2", titleBn: "সরকারি প্রাপ্য আদায় নোটিশ", titleEn: "Government Dues Recovery Notice", description: "Mushak 14.2 — Admin: recovery notice", category: "enforcement", adminOnly: true },
  { id: "mushak-14.3", titleBn: "আদায় সম্মতি প্রতিবেদন", titleEn: "Recovery Compliance Report", description: "Mushak 14.3 — Admin: recovery report", category: "enforcement", adminOnly: true },
  { id: "mushak-14.4", titleBn: "ব্যবসা প্রতিষ্ঠান তালাবদ্ধকরণ নোটিশ", titleEn: "Premises Locking Notice", description: "Mushak 14.4 — Admin: locking notice", category: "enforcement", adminOnly: true },
  { id: "mushak-14.5", titleBn: "তালাবদ্ধকরণ সম্মতি প্রতিবেদন", titleEn: "Locking Compliance Report", description: "Mushak 14.5 — Admin: locking report", category: "enforcement", adminOnly: true },
  { id: "mushak-14.6", titleBn: "তালাবদ্ধকরণ আদেশ", titleEn: "Premises Locking Order", description: "Mushak 14.6 — Admin: locking order", category: "enforcement", adminOnly: true },
  { id: "mushak-14.7", titleBn: "ইউটিলিটি সংযোগ বিচ্ছিন্নকরণ", titleEn: "Utility Disconnection", description: "Mushak 14.7 — Admin: utility disconnect", category: "enforcement", adminOnly: true },
  { id: "mushak-14.8", titleBn: "ইউটিলিটি পুনঃসংযোগ আদেশ", titleEn: "Utility Reconnection Order", description: "Mushak 14.8 — Admin: utility reconnect", category: "enforcement", adminOnly: true },
  { id: "mushak-14.11", titleBn: "স্থাবর সম্পত্তি সংযুক্তিকরণ আদেশ", titleEn: "Property Attachment Order", description: "Mushak 14.11 — Admin: property attachment", category: "enforcement", adminOnly: true },
  { id: "mushak-14.12", titleBn: "আদালতের স্থগিতাদেশের অনুরোধ", titleEn: "Court Stay Request", description: "Mushak 14.12 — Admin: stay request", category: "enforcement", adminOnly: true },
  { id: "mushak-14.13", titleBn: "সম্পত্তি বিক্রয় সনদ", titleEn: "Property Sale Certificate", description: "Mushak 14.13 — Admin: sale certificate", category: "enforcement", adminOnly: true },
  { id: "mushak-14.14", titleBn: "সংযুক্তিকরণ/জব্দ প্রত্যাহার", titleEn: "Attachment/Seizure Withdrawal", description: "Mushak 14.14 — Admin: withdrawal order", category: "enforcement", adminOnly: true },
  // Investigation
  { id: "mushak-16.1", titleBn: "অপরাধ তদন্ত নোটিশ", titleEn: "Offense Investigation Notice", description: "Mushak 16.1 — Admin: investigation notice", category: "enforcement", adminOnly: true },
  { id: "mushak-16.2", titleBn: "তদন্তের জবাব", titleEn: "Response to Investigation", description: "Mushak 16.2 — Respond to investigation notice", category: "enforcement", adminOnly: false },
  // ADR
  { id: "mushak-17.1", titleBn: "ADR আবেদন", titleEn: "ADR Application", description: "Mushak 17.1 — Alternative dispute resolution application", category: "adr", adminOnly: false },
  { id: "mushak-17.2", titleBn: "ADR মামলা রেজিস্টার", titleEn: "ADR Case Register", description: "Mushak 17.2 — Admin: ADR case register", category: "adr", adminOnly: true },
  { id: "mushak-17.3", titleBn: "ADR চুক্তির শর্তাবলী", titleEn: "ADR Agreement Terms", description: "Mushak 17.3 — ADR settlement agreement", category: "adr", adminOnly: false },
  // Miscellaneous
  { id: "mushak-18.1", titleBn: "ভ্যাট পরামর্শক লাইসেন্স আবেদন", titleEn: "VAT Consultant License Application", description: "Mushak 18.1 — Apply for consultant license", category: "misc", adminOnly: false },
  { id: "mushak-18.2", titleBn: "সনদপত্রের সত্যায়িত কপির আবেদন", titleEn: "Certified Copy Application", description: "Mushak 18.2 — Request certified document copy", category: "misc", adminOnly: false },
  { id: "mushak-18.3", titleBn: "ভ্যাট ক্লিয়ারেন্স সার্টিফিকেট আবেদন", titleEn: "VAT Clearance Certificate", description: "Mushak 18.3 — Clearance certificate application", category: "misc", adminOnly: false },
  { id: "mushak-18.4", titleBn: "ভ্যাট ক্লিয়ারেন্স সার্টিফিকেট", titleEn: "VAT Clearance Certificate", description: "Mushak 18.4 — Admin: clearance certificate", category: "misc", adminOnly: true },
  { id: "mushak-18.5", titleBn: "ভ্যাট সম্মাননা সনদ", titleEn: "VAT Honor Certificate", description: "Mushak 18.5 — Admin: honor certificate", category: "misc", adminOnly: true },
  { id: "mushak-18.6", titleBn: "জের বহন সনদ", titleEn: "Balance Carryforward Certificate", description: "Mushak 18.6 — Admin: carryforward certificate", category: "misc", adminOnly: true },
];

export const FORM_DEFINITIONS_MAP = new Map<string, FormDefinition>(
  FORM_DEFINITIONS.map((f) => [f.id, f])
);

export const FORM_CATEGORIES: { key: FormCategory; labelBn: string; labelEn: string }[] = [
  { key: "registration", labelBn: "নিবন্ধন", labelEn: "Registration" },
  { key: "invoices", labelBn: "চালান ও রেজিস্টার", labelEn: "Invoices & Registers" },
  { key: "returns", labelBn: "রিটার্ন", labelEn: "Returns" },
  { key: "refunds", labelBn: "রিফান্ড", labelEn: "Refunds" },
  { key: "agents", labelBn: "এজেন্ট", labelEn: "Agents" },
  { key: "adr", labelBn: "এডিআর", labelEn: "ADR" },
  { key: "adjustments", labelBn: "সমন্বয়", labelEn: "Adjustments" },
  { key: "enforcement", labelBn: "প্রয়োগ ও তদন্ত", labelEn: "Enforcement & Investigation" },
  { key: "misc", labelBn: "অন্যান্য", labelEn: "Miscellaneous" },
];

export function getFormDefinition(formId: string): FormDefinition | undefined {
  return FORM_DEFINITIONS_MAP.get(formId);
}

export function getCategoryLabel(key: FormCategory, lang: "bn" | "en"): string {
  const cat = FORM_CATEGORIES.find((c) => c.key === key);
  return cat ? (lang === "bn" ? cat.labelBn : cat.labelEn) : key;
}
