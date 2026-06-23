export type FieldType = "text" | "number" | "date" | "select" | "textarea" | "tel" | "email" | "array" | "section" | "readonly";

export interface FormField {
  id: string;
  labelBn: string;
  labelEn: string;
  type: FieldType;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  options?: { value: string; labelBn: string; labelEn: string }[];
  defaultValue?: unknown;
  placeholderBn?: string;
  placeholderEn?: string;
  fields?: FormField[];
  autoFill?: string;
  helpTextBn?: string;
  helpTextEn?: string;
}

export interface FormSchema {
  formId: string;
  sections: {
    id: string;
    titleBn: string;
    titleEn: string;
    fields: FormField[];
  }[];
}

export const Mushak21Schema: FormSchema = {
  formId: "mushak-2.1",
  sections: [
    {
      id: "business_info",
      titleBn: "ব্যবসা প্রতিষ্ঠানের তথ্য",
      titleEn: "Business Information",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন (নিবন্ধন নম্বর)", labelEn: "BIN (Registration No)", type: "text", autoFill: "client.bin" },
        { id: "tin", labelBn: "টিআইএন (কর শনাক্তকরণ নম্বর)", labelEn: "TIN (Tax ID)", type: "text", autoFill: "client.tin" },
        { id: "business_type", labelBn: "ব্যবসার ধরন", labelEn: "Business Type", type: "select", options: [
          { value: "manufacturer", labelBn: "উৎপাদনকারী", labelEn: "Manufacturer" },
          { value: "trader", labelBn: "ব্যবসায়ী", labelEn: "Trader" },
          { value: "service", labelBn: "সেবা প্রদানকারী", labelEn: "Service Provider" },
          { value: "others", labelBn: "অন্যান্য", labelEn: "Others" },
        ], autoFill: "client.business_type" },
        { id: "annual_turnover", labelBn: "বার্ষিক টার্নওভার", labelEn: "Annual Turnover", type: "number", autoFill: "client.annual_turnover" },
        { id: "phone", labelBn: "মোবাইল নম্বর", labelEn: "Phone Number", type: "tel", autoFill: "client.phone" },
        { id: "email", labelBn: "ইমেইল", labelEn: "Email", type: "email", autoFill: "client.email" },
        { id: "address", labelBn: "ঠিকানা", labelEn: "Address", type: "textarea", autoFill: "client.address" },
        { id: "registration_date", labelBn: "আবেদনের তারিখ", labelEn: "Application Date", type: "date", defaultValue: new Date().toISOString().split("T")[0], autoFill: "currentDate" },
      ],
    },
    {
      id: "owner_info",
      titleBn: "মালিক/স্বত্বাধিকারীর তথ্য",
      titleEn: "Owner Information",
      fields: [
        { id: "owner_name", labelBn: "মালিকের নাম", labelEn: "Owner Name", type: "text" },
        { id: "owner_designation", labelBn: "পদবী", labelEn: "Designation", type: "text" },
        { id: "owner_nid", labelBn: "জাতীয় পরিচয়পত্র নম্বর", labelEn: "NID Number", type: "text" },
        { id: "owner_phone", labelBn: "মোবাইল নম্বর", labelEn: "Phone Number", type: "tel" },
      ],
    },
    {
      id: "bank_info",
      titleBn: "ব্যাংক তথ্য",
      titleEn: "Bank Information",
      fields: [
        { id: "bank_name", labelBn: "ব্যাংকের নাম", labelEn: "Bank Name", type: "text" },
        { id: "branch_name", labelBn: "শাখার নাম", labelEn: "Branch Name", type: "text" },
        { id: "account_no", labelBn: "অ্যাকাউন্ট নম্বর", labelEn: "Account Number", type: "text" },
        { id: "routing_no", labelBn: "রাউটিং নম্বর", labelEn: "Routing Number", type: "text" },
      ],
    },
  ],
};

export const Mushak63Schema: FormSchema = {
  formId: "mushak-6.3",
  sections: [
    {
      id: "invoice_header",
      titleBn: "চালানপত্র শিরোনাম",
      titleEn: "Invoice Header",
      fields: [
        { id: "invoice_number", labelBn: "চালান নম্বর", labelEn: "Invoice Number", type: "text", validation: { required: true }, autoFill: "generatedInvoice" },
        { id: "invoice_date", labelBn: "চালানের তারিখ", labelEn: "Invoice Date", type: "date", defaultValue: new Date().toISOString().split("T")[0], autoFill: "currentDate" },
        { id: "supplier_name", labelBn: "সরবরাহকারীর নাম", labelEn: "Supplier Name", type: "text", validation: { required: true }, autoFill: "org.name" },
        { id: "supplier_bin", labelBn: "সরবরাহকারীর বিআইএন", labelEn: "Supplier BIN", type: "text", autoFill: "client.bin" },
        { id: "supplier_address", labelBn: "সরবরাহকারীর ঠিকানা", labelEn: "Supplier Address", type: "textarea", autoFill: "client.address" },
        { id: "customer_name", labelBn: "ক্রেতার নাম", labelEn: "Customer Name", type: "text", validation: { required: true } },
        { id: "customer_bin", labelBn: "ক্রেতার বিআইএন", labelEn: "Customer BIN", type: "text" },
        { id: "customer_address", labelBn: "ক্রেতার ঠিকানা", labelEn: "Customer Address", type: "textarea" },
      ],
    },
    {
      id: "line_items",
      titleBn: "পণ্যের বিবরণ",
      titleEn: "Line Items",
      fields: [
        { id: "items", labelBn: "পণ্য/সেবা", labelEn: "Items", type: "array", fields: [
          { id: "item_name", labelBn: "পণ্যের নাম", labelEn: "Item Name", type: "text" },
          { id: "hs_code", labelBn: "এইচএস কোড", labelEn: "HS Code", type: "text" },
          { id: "quantity", labelBn: "পরিমাণ", labelEn: "Quantity", type: "number", defaultValue: 1 },
          { id: "unit_price", labelBn: "একক মূল্য", labelEn: "Unit Price", type: "number" },
          { id: "vat_rate", labelBn: "মুসক হার (%)", labelEn: "VAT Rate (%)", type: "number", defaultValue: 15 },
        ] },
      ],
    },
    {
      id: "summary",
      titleBn: "সারসংক্ষেপ",
      titleEn: "Summary",
      fields: [
        { id: "subtotal", labelBn: "মোট মূল্য (ভ্যাট ব্যতীত)", labelEn: "Subtotal (excl. VAT)", type: "number" },
        { id: "vat_amount", labelBn: "মুসকের পরিমাণ", labelEn: "VAT Amount", type: "number" },
        { id: "total_amount", labelBn: "মোট প্রদেয়", labelEn: "Total Payable", type: "number" },
        { id: "in_words", labelBn: "শব্দে পরিমাণ", labelEn: "Amount in Words", type: "text" },
      ],
    },
  ],
};

export const Mushak91Schema: FormSchema = {
  formId: "mushak-9.1",
  sections: [
    {
      id: "return_header",
      titleBn: "রিটার্ন শিরোনাম",
      titleEn: "Return Header",
      fields: [
        { id: "return_period", labelBn: "রিটার্ন মেয়াদ (মাস-বছর)", labelEn: "Return Period (Month-Year)", type: "text", validation: { required: true }, autoFill: "lastReturnPeriod" },
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "submission_date", labelBn: "জমা দেওয়ার তারিখ", labelEn: "Submission Date", type: "date", defaultValue: new Date().toISOString().split("T")[0], autoFill: "currentDate" },
      ],
    },
    {
      id: "sales",
      titleBn: "বিক্রয় তথ্য",
      titleEn: "Sales Information",
      fields: [
        { id: "total_sales", labelBn: "মোট বিক্রয় (ভ্যাট সহ)", labelEn: "Total Sales (incl. VAT)", type: "number", validation: { required: true } },
        { id: "vatable_sales", labelBn: "ভ্যাটযোগ্য বিক্রয়", labelEn: "VATable Sales", type: "number" },
        { id: "vat_free_sales", labelBn: "ভ্যাটমুক্ত বিক্রয়", labelEn: "VAT-Free Sales", type: "number" },
        { id: "output_tax", labelBn: "আউটপুট ট্যাক্স", labelEn: "Output Tax", type: "number" },
      ],
    },
    {
      id: "purchases",
      titleBn: "ক্রয় তথ্য",
      titleEn: "Purchases Information",
      fields: [
        { id: "total_purchases", labelBn: "মোট ক্রয় (ভ্যাট সহ)", labelEn: "Total Purchases (incl. VAT)", type: "number" },
        { id: "vatable_purchases", labelBn: "ভ্যাটযোগ্য ক্রয়", labelEn: "VATable Purchases", type: "number" },
        { id: "input_tax", labelBn: "ইনপুট ট্যাক্স", labelEn: "Input Tax", type: "number" },
      ],
    },
    {
      id: "summary",
      titleBn: "নেট ভ্যাট গণনা",
      titleEn: "Net VAT Calculation",
      fields: [
        { id: "net_vat", labelBn: "নেট ভ্যাট (আউটপুট - ইনপুট)", labelEn: "Net VAT (Output - Input)", type: "number" },
        { id: "adjustments", labelBn: "সমন্বয়", labelEn: "Adjustments", type: "number" },
        { id: "surcharge", labelBn: "সারচার্জ (যদি প্রযোজ্য)", labelEn: "Surcharge (if applicable)", type: "number" },
        { id: "late_fee", labelBn: "বিলম্ব ফি (যদি প্রযোজ্য)", labelEn: "Late Fee (if applicable)", type: "number" },
        { id: "amount_due", labelBn: "মোট প্রদেয়", labelEn: "Total Amount Due", type: "number" },
      ],
    },
  ],
};

export const Mushak92Schema: FormSchema = {
  formId: "mushak-9.2",
  sections: [
    {
      id: "return_header",
      titleBn: "রিটার্ন শিরোনাম",
      titleEn: "Return Header",
      fields: [
        { id: "return_period", labelBn: "রিটার্ন মেয়াদ", labelEn: "Return Period", type: "text", validation: { required: true } },
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
      ],
    },
    {
      id: "turnover",
      titleBn: "টার্নওভার তথ্য",
      titleEn: "Turnover Information",
      fields: [
        { id: "gross_turnover", labelBn: "মোট টার্নওভার", labelEn: "Gross Turnover", type: "number", validation: { required: true } },
        { id: "tax_rate", labelBn: "কর হার (%)", labelEn: "Tax Rate (%)", type: "readonly", defaultValue: 3 },
        { id: "tax_due", labelBn: "প্রদেয় কর", labelEn: "Tax Due", type: "number" },
      ],
    },
  ],
};

export const Mushak61Schema: FormSchema = {
  formId: "mushak-6.1",
  sections: [
    {
      id: "entries",
      titleBn: "ক্রয় রেজিস্টার এন্ট্রি",
      titleEn: "Purchase Register Entries",
      fields: [
        { id: "entries", labelBn: "ক্রয় এন্ট্রি", labelEn: "Purchase Entries", type: "array", fields: [
          { id: "entry_date", labelBn: "তারিখ", labelEn: "Date", type: "date" },
          { id: "supplier_name", labelBn: "সরবরাহকারীর নাম", labelEn: "Supplier Name", type: "text" },
          { id: "supplier_bin", labelBn: "সরবরাহকারীর বিআইএন", labelEn: "Supplier BIN", type: "text" },
          { id: "invoice_no", labelBn: "চালান নম্বর", labelEn: "Invoice No", type: "text" },
          { id: "product_name", labelBn: "পণ্যের নাম", labelEn: "Product Name", type: "text" },
          { id: "quantity", labelBn: "পরিমাণ", labelEn: "Quantity", type: "number" },
          { id: "unit_price", labelBn: "একক মূল্য", labelEn: "Unit Price", type: "number" },
          { id: "total_price", labelBn: "মোট মূল্য", labelEn: "Total Price", type: "number" },
          { id: "vat_amount", labelBn: "মুসকের পরিমাণ", labelEn: "VAT Amount", type: "number" },
        ] },
      ],
    },
  ],
};

export const Mushak62Schema: FormSchema = {
  formId: "mushak-6.2",
  sections: [
    {
      id: "entries",
      titleBn: "বিক্রয় রেজিস্টার এন্ট্রি",
      titleEn: "Sales Register Entries",
      fields: [
        { id: "entries", labelBn: "বিক্রয় এন্ট্রি", labelEn: "Sales Entries", type: "array", fields: [
          { id: "entry_date", labelBn: "তারিখ", labelEn: "Date", type: "date" },
          { id: "customer_name", labelBn: "ক্রেতার নাম", labelEn: "Customer Name", type: "text" },
          { id: "customer_bin", labelBn: "ক্রেতার বিআইএন", labelEn: "Customer BIN", type: "text" },
          { id: "invoice_no", labelBn: "চালান নম্বর", labelEn: "Invoice No", type: "text" },
          { id: "product_name", labelBn: "পণ্যের নাম", labelEn: "Product Name", type: "text" },
          { id: "quantity", labelBn: "পরিমাণ", labelEn: "Quantity", type: "number" },
          { id: "unit_price", labelBn: "একক মূল্য", labelEn: "Unit Price", type: "number" },
          { id: "total_price", labelBn: "মোট মূল্য", labelEn: "Total Price", type: "number" },
          { id: "vat_amount", labelBn: "মুসকের পরিমাণ", labelEn: "VAT Amount", type: "number" },
        ] },
      ],
    },
  ],
};

export const Mushak66Schema: FormSchema = {
  formId: "mushak-6.6",
  sections: [
    {
      id: "certificate",
      titleBn: "উৎসে কর কর্তন সনদ",
      titleEn: "Source Tax Deduction Certificate",
      fields: [
        { id: "certificate_no", labelBn: "সনদ নম্বর", labelEn: "Certificate No", type: "text", validation: { required: true } },
        { id: "deductor_name", labelBn: "কর্তনকারীর নাম", labelEn: "Deductor Name", type: "text", validation: { required: true } },
        { id: "deductor_bin", labelBn: "কর্তনকারীর বিআইএন", labelEn: "Deductor BIN", type: "text" },
        { id: "deductee_name", labelBn: "যার থেকে কর্তন করা হয়েছে", labelEn: "Deductee Name", type: "text", validation: { required: true } },
        { id: "deductee_bin", labelBn: "গ্রহীতার বিআইএন", labelEn: "Deductee BIN", type: "text" },
        { id: "invoice_no", labelBn: "চালান নম্বর", labelEn: "Invoice No", type: "text" },
        { id: "invoice_date", labelBn: "চালানের তারিখ", labelEn: "Invoice Date", type: "date" },
        { id: "contract_amount", labelBn: "চুক্তির পরিমাণ", labelEn: "Contract Amount", type: "number" },
        { id: "tax_rate", labelBn: "কর হার (%)", labelEn: "Tax Rate (%)", type: "number" },
        { id: "tax_amount", labelBn: "কর্তিত করের পরিমাণ", labelEn: "Tax Deducted Amount", type: "number" },
        { id: "tax_deposit_date", labelBn: "জমা দেওয়ার তারিখ", labelEn: "Deposit Date", type: "date" },
      ],
    },
  ],
};

export const Mushak67Schema: FormSchema = {
  formId: "mushak-6.7",
  sections: [
    {
      id: "credit_note",
      titleBn: "ক্রেডিট নোট",
      titleEn: "Credit Note",
      fields: [
        { id: "credit_note_no", labelBn: "ক্রেডিট নোট নম্বর", labelEn: "Credit Note No", type: "text", validation: { required: true } },
        { id: "original_invoice_no", labelBn: "মূল চালান নম্বর", labelEn: "Original Invoice No", type: "text", validation: { required: true } },
        { id: "original_invoice_date", labelBn: "মূল চালানের তারিখ", labelEn: "Original Invoice Date", type: "date" },
        { id: "reason", labelBn: "ক্রেডিট নোটের কারণ", labelEn: "Reason for Credit Note", type: "textarea", validation: { required: true } },
        { id: "amount", labelBn: "পরিমাণ", labelEn: "Amount", type: "number", validation: { required: true } },
        { id: "vat_adjustment", labelBn: "ভ্যাট সমন্বয়", labelEn: "VAT Adjustment", type: "number" },
        { id: "issue_date", labelBn: "ইস্যুর তারিখ", labelEn: "Issue Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
      ],
    },
  ],
};

export const Mushak68Schema: FormSchema = {
  formId: "mushak-6.8",
  sections: [
    {
      id: "debit_note",
      titleBn: "ডেবিট নোট",
      titleEn: "Debit Note",
      fields: [
        { id: "debit_note_no", labelBn: "ডেবিট নোট নম্বর", labelEn: "Debit Note No", type: "text", validation: { required: true } },
        { id: "original_invoice_no", labelBn: "মূল চালান নম্বর", labelEn: "Original Invoice No", type: "text", validation: { required: true } },
        { id: "original_invoice_date", labelBn: "মূল চালানের তারিখ", labelEn: "Original Invoice Date", type: "date" },
        { id: "reason", labelBn: "ডেবিট নোটের কারণ", labelEn: "Reason for Debit Note", type: "textarea", validation: { required: true } },
        { id: "amount", labelBn: "পরিমাণ", labelEn: "Amount", type: "number", validation: { required: true } },
        { id: "vat_adjustment", labelBn: "ভ্যাট সমন্বয়", labelEn: "VAT Adjustment", type: "number" },
        { id: "issue_date", labelBn: "ইস্যুর তারিখ", labelEn: "Issue Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
      ],
    },
  ],
};

export const Mushak101Schema: FormSchema = {
  formId: "mushak-10.1",
  sections: [
    {
      id: "diplomatic_info",
      titleBn: "কূটনৈতিক মিশনের তথ্য",
      titleEn: "Diplomatic Mission Information",
      fields: [
        { id: "mission_name", labelBn: "মিশনের নাম", labelEn: "Mission Name", type: "text", validation: { required: true } },
        { id: "mission_code", labelBn: "মিশন কোড", labelEn: "Mission Code", type: "text" },
        { id: "country", labelBn: "দেশ", labelEn: "Country", type: "text" },
        { id: "mission_address", labelBn: "মিশনের ঠিকানা", labelEn: "Mission Address", type: "textarea" },
      ],
    },
    {
      id: "refund_details",
      titleBn: "রিফান্ড বিবরণ",
      titleEn: "Refund Details",
      fields: [
        { id: "invoice_no", labelBn: "চালান নম্বর", labelEn: "Invoice No", type: "text", validation: { required: true } },
        { id: "invoice_date", labelBn: "চালানের তারিখ", labelEn: "Invoice Date", type: "date" },
        { id: "supplier_name", labelBn: "সরবরাহকারীর নাম", labelEn: "Supplier Name", type: "text" },
        { id: "supplier_bin", labelBn: "সরবরাহকারীর বিআইএন", labelEn: "Supplier BIN", type: "text" },
        { id: "product_description", labelBn: "পণ্যের বিবরণ", labelEn: "Product Description", type: "textarea" },
        { id: "invoice_amount", labelBn: "চালানের পরিমাণ", labelEn: "Invoice Amount", type: "number" },
        { id: "vat_paid", labelBn: "প্রদত্ত ভ্যাট", labelEn: "VAT Paid", type: "number" },
        { id: "refund_amount", labelBn: "রিফান্ডের পরিমাণ", labelEn: "Refund Amount", type: "number" },
      ],
    },
  ],
};

export const Mushak102Schema: FormSchema = {
  formId: "mushak-10.2",
  sections: [
    {
      id: "tourist_info",
      titleBn: "পর্যটকের তথ্য",
      titleEn: "Tourist Information",
      fields: [
        { id: "tourist_name", labelBn: "পর্যটকের নাম", labelEn: "Tourist Name", type: "text", validation: { required: true } },
        { id: "passport_no", labelBn: "পাসপোর্ট নম্বর", labelEn: "Passport No", type: "text", validation: { required: true } },
        { id: "nationality", labelBn: "জাতীয়তা", labelEn: "Nationality", type: "text" },
        { id: "arrival_date", labelBn: "আগমনের তারিখ", labelEn: "Arrival Date", type: "date" },
        { id: "departure_date", labelBn: "প্রস্থানের তারিখ", labelEn: "Departure Date", type: "date" },
      ],
    },
    {
      id: "purchase_details",
      titleBn: "ক্রয় বিবরণ",
      titleEn: "Purchase Details",
      fields: [
        { id: "shop_name", labelBn: "দোকানের নাম", labelEn: "Shop Name", type: "text" },
        { id: "shop_bin", labelBn: "দোকানের বিআইএন", labelEn: "Shop BIN", type: "text" },
        { id: "invoice_no", labelBn: "চালান নম্বর", labelEn: "Invoice No", type: "text" },
        { id: "purchase_amount", labelBn: "ক্রয়ের পরিমাণ", labelEn: "Purchase Amount", type: "number" },
        { id: "vat_amount", labelBn: "ভ্যাটের পরিমাণ", labelEn: "VAT Amount", type: "number" },
        { id: "refund_claim", labelBn: "রিফান্ড দাবি", labelEn: "Refund Claim", type: "number" },
      ],
    },
  ],
};

export const Mushak31Schema: FormSchema = {
  formId: "mushak-3.1",
  sections: [
    {
      id: "applicant_info",
      titleBn: "আবেদনকারীর তথ্য",
      titleEn: "Applicant Information",
      fields: [
        { id: "applicant_name", labelBn: "আবেদনকারীর নাম", labelEn: "Applicant Name", type: "text", validation: { required: true } },
        { id: "father_name", labelBn: "পিতার নাম", labelEn: "Father's Name", type: "text" },
        { id: "nid", labelBn: "জাতীয় পরিচয়পত্র নম্বর", labelEn: "NID Number", type: "text", validation: { required: true } },
        { id: "date_of_birth", labelBn: "জন্ম তারিখ", labelEn: "Date of Birth", type: "date" },
        { id: "phone", labelBn: "মোবাইল নম্বর", labelEn: "Phone Number", type: "tel" },
        { id: "email", labelBn: "ইমেইল", labelEn: "Email", type: "email" },
        { id: "present_address", labelBn: "বর্তমান ঠিকানা", labelEn: "Present Address", type: "textarea" },
        { id: "permanent_address", labelBn: "স্থায়ী ঠিকানা", labelEn: "Permanent Address", type: "textarea" },
      ],
    },
    {
      id: "qualifications",
      titleBn: "যোগ্যতা ও অভিজ্ঞতা",
      titleEn: "Qualifications & Experience",
      fields: [
        { id: "educational_qualification", labelBn: "শিক্ষাগত যোগ্যতা", labelEn: "Educational Qualification", type: "text" },
        { id: "professional_experience", labelBn: "পেশাগত অভিজ্ঞতা (বছর)", labelEn: "Professional Experience (Years)", type: "number" },
        { id: "vat_training", labelBn: "ভ্যাট প্রশিক্ষণ", labelEn: "VAT Training", type: "textarea" },
      ],
    },
  ],
};

export const Mushak171Schema: FormSchema = {
  formId: "mushak-17.1",
  sections: [
    {
      id: "dispute_info",
      titleBn: "বিবাদের তথ্য",
      titleEn: "Dispute Information",
      fields: [
        { id: "applicant_name", labelBn: "আবেদনকারীর নাম", labelEn: "Applicant Name", type: "text", validation: { required: true } },
        { id: "applicant_bin", labelBn: "আবেদনকারীর বিআইএন", labelEn: "Applicant BIN", type: "text" },
        { id: "applicant_address", labelBn: "আবেদনকারীর ঠিকানা", labelEn: "Applicant Address", type: "textarea" },
        { id: "respondent_name", labelBn: "বিবাদীর নাম", labelEn: "Respondent Name", type: "text", validation: { required: true } },
        { id: "respondent_bin", labelBn: "বিবাদীর বিআইএন", labelEn: "Respondent BIN", type: "text" },
        { id: "dispute_subject", labelBn: "বিবাদের বিষয়", labelEn: "Dispute Subject", type: "text", validation: { required: true } },
        { id: "dispute_amount", labelBn: "বিবাদের পরিমাণ", labelEn: "Dispute Amount", type: "number" },
        { id: "dispute_description", labelBn: "বিবাদের বিবরণ", labelEn: "Dispute Description", type: "textarea", validation: { required: true } },
      ],
    },
  ],
};

export const Mushak24Schema: FormSchema = {
  formId: "mushak-2.4",
  sections: [
    {
      id: "cancellation",
      titleBn: "নিবন্ধন বাতিলের আবেদন",
      titleEn: "Cancellation of Registration",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "cancellation_reason", labelBn: "বাতিলের কারণ", labelEn: "Cancellation Reason", type: "select", options: [
          { value: "closure", labelBn: "ব্যবসা বন্ধ", labelEn: "Business Closure" },
          { value: "transfer", labelBn: "হস্তান্তর", labelEn: "Business Transfer" },
          { value: "change_of_ownership", labelBn: "মালিকানা পরিবর্তন", labelEn: "Change of Ownership" },
          { value: "others", labelBn: "অন্যান্য", labelEn: "Others" },
        ], validation: { required: true } },
        { id: "closure_date", labelBn: "বন্ধের তারিখ", labelEn: "Closure Date", type: "date" },
        { id: "remarks", labelBn: "মন্তব্য", labelEn: "Remarks", type: "textarea" },
      ],
    },
  ],
};

export const Mushak41Schema: FormSchema = {
  formId: "mushak-4.1",
  sections: [
    {
      id: "advance_tax",
      titleBn: "অগ্রিম কর সমন্বয়",
      titleEn: "Advance Tax Adjustment",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "import_date", labelBn: "আমদানির তারিখ", labelEn: "Import Date", type: "date" },
        { id: "bill_of_entry", labelBn: "বিল অব এন্ট্রি নম্বর", labelEn: "Bill of Entry No", type: "text" },
        { id: "advance_tax_paid", labelBn: "প্রদত্ত অগ্রিম কর", labelEn: "Advance Tax Paid", type: "number" },
        { id: "adjustment_amount", labelBn: "সমন্বয়ের পরিমাণ", labelEn: "Adjustment Amount", type: "number" },
        { id: "adjustment_period", labelBn: "সমন্বয় মেয়াদ", labelEn: "Adjustment Period", type: "text" },
      ],
    },
  ],
};

export const Mushak69Schema: FormSchema = {
  formId: "mushak-6.9",
  sections: [
    {
      id: "invoice",
      titleBn: "টার্নওভার ট্যাক্স চালান",
      titleEn: "Turnover Tax Invoice",
      fields: [
        { id: "invoice_no", labelBn: "চালান নম্বর", labelEn: "Invoice No", type: "text", validation: { required: true } },
        { id: "invoice_date", labelBn: "তারিখ", labelEn: "Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
        { id: "seller_name", labelBn: "বিক্রেতার নাম", labelEn: "Seller Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "seller_bin", labelBn: "বিক্রেতার বিআইএন", labelEn: "Seller BIN", type: "text", autoFill: "client.bin" },
        { id: "buyer_name", labelBn: "ক্রেতার নাম", labelEn: "Buyer Name", type: "text" },
        { id: "total_value", labelBn: "মোট মূল্য", labelEn: "Total Value", type: "number" },
        { id: "turnover_tax_rate", labelBn: "টার্নওভার ট্যাক্সের হার (%)", labelEn: "Turnover Tax Rate (%)", type: "readonly", defaultValue: 3 },
        { id: "turnover_tax_amount", labelBn: "টার্নওভার ট্যাক্সের পরিমাণ", labelEn: "Turnover Tax Amount", type: "number" },
      ],
    },
  ],
};

export const Mushak93Schema: FormSchema = {
  formId: "mushak-9.3",
  sections: [
    {
      id: "late_return",
      titleBn: "বিলম্বে রিটার্ন জমার আবেদন",
      titleEn: "Late Return Application",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "return_period", labelBn: "রিটার্ন মেয়াদ", labelEn: "Return Period", type: "text", validation: { required: true } },
        { id: "original_due_date", labelBn: "নির্ধারিত তারিখ", labelEn: "Original Due Date", type: "date" },
        { id: "reason_for_delay", labelBn: "বিলম্বের কারণ", labelEn: "Reason for Delay", type: "textarea", validation: { required: true } },
        { id: "late_fee_paid", labelBn: "বিলম্ব ফি প্রদত্ত", labelEn: "Late Fee Paid", type: "number" },
        { id: "surcharge_paid", labelBn: "সারচার্জ প্রদত্ত", labelEn: "Surcharge Paid", type: "number" },
      ],
    },
  ],
};

export const Mushak94Schema: FormSchema = {
  formId: "mushak-9.4",
  sections: [
    {
      id: "amended_return",
      titleBn: "সংশোধিত রিটার্ন আবেদন",
      titleEn: "Amended Return Application",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "original_return_period", labelBn: "মূল রিটার্নের মেয়াদ", labelEn: "Original Return Period", type: "text", validation: { required: true } },
        { id: "correction_reason", labelBn: "সংশোধনের কারণ", labelEn: "Correction Reason", type: "textarea", validation: { required: true } },
        { id: "corrected_sales", labelBn: "সংশোধিত বিক্রয়", labelEn: "Corrected Sales", type: "number" },
        { id: "corrected_purchases", labelBn: "সংশোধিত ক্রয়", labelEn: "Corrected Purchases", type: "number" },
        { id: "corrected_output_tax", labelBn: "সংশোধিত আউটপুট ট্যাক্স", labelEn: "Corrected Output Tax", type: "number" },
        { id: "corrected_input_tax", labelBn: "সংশোধিত ইনপুট ট্যাক্স", labelEn: "Corrected Input Tax", type: "number" },
        { id: "additional_tax_due", labelBn: "অতিরিক্ত প্রদেয় কর", labelEn: "Additional Tax Due", type: "number" },
      ],
    },
  ],
};

export const Mushak22Schema: FormSchema = {
  formId: "mushak-2.2",
  sections: [
    {
      id: "branch_info",
      titleBn: "শাখা/ইউনিটের তথ্য",
      titleEn: "Branch/Unit Information",
      fields: [
        { id: "central_bin", labelBn: "কেন্দ্রীয় ইউনিটের বিআইএন", labelEn: "Central Unit BIN", type: "text", validation: { required: true }, autoFill: "client.bin" },
        { id: "central_name", labelBn: "কেন্দ্রীয় ইউনিটের নাম", labelEn: "Central Unit Name", type: "text", autoFill: "client.name" },
        { id: "branch_name", labelBn: "শাখার নাম", labelEn: "Branch Name", type: "text", validation: { required: true } },
        { id: "branch_address", labelBn: "শাখার ঠিকানা", labelEn: "Branch Address", type: "textarea", validation: { required: true } },
        { id: "branch_turnover", labelBn: "শাখার বার্ষিক টার্নওভার", labelEn: "Branch Annual Turnover", type: "number" },
      ],
    },
  ],
};

export const Mushak25Schema: FormSchema = {
  formId: "mushak-2.5",
  sections: [
    {
      id: "final_return",
      titleBn: "নিবন্ধন বাতিলের চূড়ান্ত রিটার্ন",
      titleEn: "Final Return for Cancellation",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "closure_date", labelBn: "কার্যকর বন্ধের তারিখ", labelEn: "Effective Closure Date", type: "date" },
        { id: "total_assets", labelBn: "মোট সম্পদের মূল্য", labelEn: "Total Asset Value", type: "number" },
        { id: "total_liabilities", labelBn: "মোট দায়", labelEn: "Total Liabilities", type: "number" },
        { id: "last_return_period", labelBn: "সর্বশেষ রিটার্ন মেয়াদ", labelEn: "Last Return Period", type: "text" },
        { id: "tax_dues_cleared", labelBn: "বকেয়া কর পরিশোধিত", labelEn: "Tax Dues Cleared", type: "select", options: [{ value: "yes", labelBn: "হ্যাঁ", labelEn: "Yes" }, { value: "no", labelBn: "না", labelEn: "No" }] },
      ],
    },
  ],
};

export const Mushak26Schema: FormSchema = {
  formId: "mushak-2.6",
  sections: [
    {
      id: "change_notification",
      titleBn: "তথ্য পরিবর্তনের নোটিফিকেশন",
      titleEn: "Information Change Notification",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "change_type", labelBn: "পরিবর্তনের ধরন", labelEn: "Change Type", type: "select", options: [
          { value: "name", labelBn: "নাম", labelEn: "Name" }, { value: "address", labelBn: "ঠিকানা", labelEn: "Address" },
          { value: "bank", labelBn: "ব্যাংক তথ্য", labelEn: "Bank Info" }, { value: "business_type", labelBn: "ব্যবসার ধরন", labelEn: "Business Type" },
          { value: "others", labelBn: "অন্যান্য", labelEn: "Others" },
        ], validation: { required: true } },
        { id: "old_value", labelBn: "পূর্বের তথ্য", labelEn: "Old Value", type: "textarea", validation: { required: true } },
        { id: "new_value", labelBn: "পরিবর্তিত তথ্য", labelEn: "New Value", type: "textarea", validation: { required: true } },
        { id: "reason", labelBn: "পরিবর্তনের কারণ", labelEn: "Reason for Change", type: "textarea" },
      ],
    },
  ],
};

export const Mushak27Schema: FormSchema = {
  formId: "mushak-2.7",
  sections: [
    {
      id: "place_change",
      titleBn: "ব্যবসা স্থান পরিবর্তন",
      titleEn: "Business Place Change",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "old_address", labelBn: "বর্তমান ঠিকানা", labelEn: "Current Address", type: "textarea", validation: { required: true } },
        { id: "new_address", labelBn: "নতুন ঠিকানা", labelEn: "New Address", type: "textarea", validation: { required: true } },
        { id: "reason", labelBn: "স্থানান্তরের কারণ", labelEn: "Reason for Relocation", type: "textarea" },
        { id: "proposed_date", labelBn: "প্রস্তাবিত স্থানান্তরের তারিখ", labelEn: "Proposed Relocation Date", type: "date" },
        { id: "has_pending_dues", labelBn: "কোনো বকেয়া আছে?", labelEn: "Any Pending Dues?", type: "select", options: [{ value: "no", labelBn: "না", labelEn: "No" }, { value: "yes", labelBn: "হ্যাঁ", labelEn: "Yes" }] },
      ],
    },
  ],
};

export const Mushak33Schema: FormSchema = {
  formId: "mushak-3.3",
  sections: [
    {
      id: "agent_change",
      titleBn: "এজেন্ট তথ্য পরিবর্তন",
      titleEn: "Agent Information Change",
      fields: [
        { id: "agent_name", labelBn: "এজেন্টের নাম", labelEn: "Agent Name", type: "text", validation: { required: true } },
        { id: "agent_number", labelBn: "এজেন্ট নম্বর", labelEn: "Agent Number", type: "text", validation: { required: true } },
        { id: "change_type", labelBn: "পরিবর্তনের ধরন", labelEn: "Change Type", type: "select", options: [
          { value: "address", labelBn: "ঠিকানা", labelEn: "Address" }, { value: "phone", labelBn: "মোবাইল", labelEn: "Phone" },
          { value: "email", labelBn: "ইমেইল", labelEn: "Email" }, { value: "others", labelBn: "অন্যান্য", labelEn: "Others" },
        ] },
        { id: "old_info", labelBn: "পূর্বের তথ্য", labelEn: "Old Information", type: "textarea" },
        { id: "new_info", labelBn: "নতুন তথ্য", labelEn: "New Information", type: "textarea", validation: { required: true } },
      ],
    },
  ],
};

export const Mushak34Schema: FormSchema = {
  formId: "mushak-3.4",
  sections: [
    {
      id: "non_resident",
      titleBn: "অনিবাসী এজেন্ট অনুমোদন",
      titleEn: "Non-Resident Agent Authorization",
      fields: [
        { id: "principal_name", labelBn: "প্রধান/নিয়োগকারীর নাম", labelEn: "Principal Name", type: "text", validation: { required: true } },
        { id: "principal_country", labelBn: "দেশ", labelEn: "Country", type: "text" },
        { id: "principal_address", labelBn: "ঠিকানা", labelEn: "Address", type: "textarea" },
        { id: "agent_name", labelBn: "এজেন্টের নাম", labelEn: "Agent Name", type: "text", validation: { required: true } },
        { id: "agent_bin", labelBn: "এজেন্টের বিআইএন", labelEn: "Agent BIN", type: "text" },
        { id: "authorization_period", labelBn: "অনুমোদনের মেয়াদ", labelEn: "Authorization Period", type: "text" },
        { id: "scope", labelBn: "কর্মপরিধি", labelEn: "Scope of Work", type: "textarea" },
      ],
    },
  ],
};

export const Mushak42Schema: FormSchema = {
  formId: "mushak-4.2",
  sections: [
    {
      id: "joint_application",
      titleBn: "চলমান ব্যবসা ক্রয়/বিক্রয় যৌথ আবেদন",
      titleEn: "Ongoing Business Sale/Purchase Joint Application",
      fields: [
        { id: "business_name", labelBn: "ব্যবসার নাম", labelEn: "Business Name", type: "text", validation: { required: true } },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text" },
        { id: "seller_name", labelBn: "বিক্রেতার নাম", labelEn: "Seller Name", type: "text", validation: { required: true } },
        { id: "seller_bin", labelBn: "বিক্রেতার বিআইএন", labelEn: "Seller BIN", type: "text" },
        { id: "buyer_name", labelBn: "ক্রেতার নাম", labelEn: "Buyer Name", type: "text", validation: { required: true } },
        { id: "buyer_bin", labelBn: "ক্রেতার বিআইএন", labelEn: "Buyer BIN", type: "text" },
        { id: "sale_amount", labelBn: "বিক্রয় পরিমাণ", labelEn: "Sale Amount", type: "number" },
        { id: "outstanding_dues", labelBn: "বকেয়া দায়", labelEn: "Outstanding Dues", type: "number" },
        { id: "transfer_date", labelBn: "হস্তান্তরের তারিখ", labelEn: "Transfer Date", type: "date" },
      ],
    },
  ],
};

export const Mushak64Schema: FormSchema = {
  formId: "mushak-6.4",
  sections: [
    {
      id: "manufacturing",
      titleBn: "চুক্তিভিত্তিক উৎপাদন চালান",
      titleEn: "Contract Manufacturing Invoice",
      fields: [
        { id: "invoice_no", labelBn: "চালান নম্বর", labelEn: "Invoice No", type: "text", validation: { required: true } },
        { id: "invoice_date", labelBn: "তারিখ", labelEn: "Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
        { id: "consignor_name", labelBn: "প্রেরক/মালিকের নাম", labelEn: "Consignor/Principal Name", type: "text", validation: { required: true } },
        { id: "consignor_bin", labelBn: "প্রেরকের বিআইএন", labelEn: "Consignor BIN", type: "text" },
        { id: "manufacturer_name", labelBn: "উৎপাদনকারীর নাম", labelEn: "Manufacturer Name", type: "text", validation: { required: true } },
        { id: "manufacturer_bin", labelBn: "উৎপাদনকারীর বিআইএন", labelEn: "Manufacturer BIN", type: "text" },
        { id: "goods_description", labelBn: "পণ্যের বিবরণ", labelEn: "Goods Description", type: "textarea" },
        { id: "quantity", labelBn: "পরিমাণ", labelEn: "Quantity", type: "number" },
        { id: "total_value", labelBn: "মোট মূল্য", labelEn: "Total Value", type: "number" },
        { id: "raw_material_value", labelBn: "কাঁচামালের মূল্য", labelEn: "Raw Material Value", type: "number" },
        { id: "conversion_charge", labelBn: "রূপান্তর খরচ", labelEn: "Conversion Charge", type: "number" },
      ],
    },
  ],
};

export const Mushak65Schema: FormSchema = {
  formId: "mushak-6.5",
  sections: [
    {
      id: "transfer",
      titleBn: "পণ্য স্থানান্তর চালান",
      titleEn: "Goods Transfer Invoice",
      fields: [
        { id: "transfer_no", labelBn: "স্থানান্তর নম্বর", labelEn: "Transfer No", type: "text", validation: { required: true } },
        { id: "transfer_date", labelBn: "স্থানান্তরের তারিখ", labelEn: "Transfer Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
        { id: "from_branch", labelBn: "প্রেরণকারী শাখা", labelEn: "Transferring Branch", type: "text", validation: { required: true } },
        { id: "from_branch_bin", labelBn: "প্রেরণকারী শাখার বিআইএন", labelEn: "Transferring Branch BIN", type: "text" },
        { id: "to_branch", labelBn: "গ্রহণকারী শাখা", labelEn: "Receiving Branch", type: "text", validation: { required: true } },
        { id: "to_branch_bin", labelBn: "গ্রহণকারী শাখার বিআইএন", labelEn: "Receiving Branch BIN", type: "text" },
        { id: "goods_description", labelBn: "পণ্যের বিবরণ", labelEn: "Goods Description", type: "textarea" },
        { id: "quantity", labelBn: "পরিমাণ", labelEn: "Quantity", type: "number" },
        { id: "value", labelBn: "মূল্য", labelEn: "Value", type: "number" },
      ],
    },
  ],
};

export const Mushak71Schema: FormSchema = {
  formId: "mushak-7.1",
  sections: [
    {
      id: "export_adjustment",
      titleBn: "রপ্তানি সমন্বয় আবেদন",
      titleEn: "Export Adjustment Application",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "export_invoice_no", labelBn: "রপ্তানি চালান নম্বর", labelEn: "Export Invoice No", type: "text", validation: { required: true } },
        { id: "export_date", labelBn: "রপ্তানির তারিখ", labelEn: "Export Date", type: "date" },
        { id: "lc_no", labelBn: "এলসি নম্বর", labelEn: "LC No", type: "text" },
        { id: "export_value", labelBn: "রপ্তানি মূল্য (FOB)", labelEn: "Export Value (FOB)", type: "number" },
        { id: "advance_tax_paid", labelBn: "প্রদত্ত অগ্রিম কর", labelEn: "Advance Tax Paid", type: "number" },
        { id: "adjustment_claimed", labelBn: "দাবিকৃত সমন্বয়", labelEn: "Adjustment Claimed", type: "number" },
      ],
    },
  ],
};

export const Mushak103Schema: FormSchema = {
  formId: "mushak-10.3",
  sections: [
    {
      id: "shop_authorization",
      titleBn: "পর্যটক রিফান্ড অনুমোদন আবেদন",
      titleEn: "Tourist Refund Authorization Application",
      fields: [
        { id: "shop_name", labelBn: "দোকানের নাম", labelEn: "Shop Name", type: "text", validation: { required: true } },
        { id: "shop_bin", labelBn: "দোকানের বিআইএন", labelEn: "Shop BIN", type: "text" },
        { id: "shop_address", labelBn: "দোকানের ঠিকানা", labelEn: "Shop Address", type: "textarea" },
        { id: "owner_name", labelBn: "মালিকের নাম", labelEn: "Owner Name", type: "text" },
        { id: "estimated_tourist_volume", labelBn: "আনুমানিক বার্ষিক পর্যটক সংখ্যা", labelEn: "Estimated Annual Tourist Volume", type: "number" },
        { id: "avg_refund_per_tourist", labelBn: "প্রতি পর্যটকের গড় রিফান্ড", labelEn: "Avg Refund Per Tourist", type: "number" },
      ],
    },
  ],
};

export const Mushak127Schema: FormSchema = {
  formId: "mushak-12.7",
  sections: [
    {
      id: "vehicle_release",
      titleBn: "আটককৃত যানবাহন মুক্তির আবেদন",
      titleEn: "Seized Vehicle Release Application",
      fields: [
        { id: "applicant_name", labelBn: "আবেদনকারীর নাম", labelEn: "Applicant Name", type: "text", validation: { required: true } },
        { id: "applicant_nid", labelBn: "জাতীয় পরিচয়পত্র নম্বর", labelEn: "NID Number", type: "text" },
        { id: "vehicle_type", labelBn: "যানবাহনের ধরন", labelEn: "Vehicle Type", type: "text" },
        { id: "vehicle_reg_no", labelBn: "রেজিস্ট্রেশন নম্বর", labelEn: "Registration No", type: "text", validation: { required: true } },
        { id: "chassis_no", labelBn: "চেসিস নম্বর", labelEn: "Chassis No", type: "text" },
        { id: "seizure_date", labelBn: "আটকের তারিখ", labelEn: "Seizure Date", type: "date" },
        { id: "seizure_reason", labelBn: "আটকের কারণ", labelEn: "Seizure Reason", type: "textarea" },
        { id: "release_grounds", labelBn: "মুক্তির যুক্তি", labelEn: "Grounds for Release", type: "textarea" },
      ],
    },
  ],
};

export const Mushak128Schema: FormSchema = {
  formId: "mushak-12.8",
  sections: [
    {
      id: "guarantee",
      titleBn: "আটককৃত যানবাহন মুক্তির জামিন/জামানত",
      titleEn: "Personal Guarantee for Seized Vehicle Release",
      fields: [
        { id: "guarantor_name", labelBn: "জামিনদারের নাম", labelEn: "Guarantor Name", type: "text", validation: { required: true } },
        { id: "guarantor_nid", labelBn: "জাতীয় পরিচয়পত্র নম্বর", labelEn: "NID Number", type: "text" },
        { id: "guarantor_address", labelBn: "ঠিকানা", labelEn: "Address", type: "textarea" },
        { id: "vehicle_reg_no", labelBn: "যানবাহনের রেজিস্ট্রেশন নম্বর", labelEn: "Vehicle Registration No", type: "text" },
        { id: "guarantee_amount", labelBn: "জামানতের পরিমাণ", labelEn: "Guarantee Amount", type: "number" },
        { id: "undertaking", labelBn: "অঙ্গীকার বিবৃতি", labelEn: "Undertaking Statement", type: "textarea" },
      ],
    },
  ],
};

export const Mushak162Schema: FormSchema = {
  formId: "mushak-16.2",
  sections: [
    {
      id: "investigation_response",
      titleBn: "তদন্তের জবাব",
      titleEn: "Response to Investigation",
      fields: [
        { id: "notice_no", labelBn: "নোটিশ নম্বর", labelEn: "Notice No", type: "text", validation: { required: true } },
        { id: "respondent_name", labelBn: "জবাবদানকারীর নাম", labelEn: "Respondent Name", type: "text", validation: { required: true } },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text" },
        { id: "response_date", labelBn: "জবাবের তারিখ", labelEn: "Response Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
        { id: "allegations_summary", labelBn: "অভিযোগের সারসংক্ষেপ", labelEn: "Allegations Summary", type: "textarea" },
        { id: "defense_statement", labelBn: "আত্মপক্ষ সমর্থন", labelEn: "Defense Statement", type: "textarea", validation: { required: true } },
        { id: "supporting_docs", labelBn: "সহায়ক দলিলের তালিকা", labelEn: "List of Supporting Documents", type: "textarea" },
      ],
    },
  ],
};

export const Mushak173Schema: FormSchema = {
  formId: "mushak-17.3",
  sections: [
    {
      id: "agreement",
      titleBn: "ADR চুক্তির শর্তাবলী",
      titleEn: "ADR Agreement Terms",
      fields: [
        { id: "case_no", labelBn: "মামলা নম্বর", labelEn: "Case No", type: "text" },
        { id: "applicant_name", labelBn: "আবেদনকারীর নাম", labelEn: "Applicant Name", type: "text", validation: { required: true } },
        { id: "respondent_name", labelBn: "বিবাদীর নাম", labelEn: "Respondent Name", type: "text", validation: { required: true } },
        { id: "facilitator_name", labelBn: "সহায়কের নাম", labelEn: "Facilitator Name", type: "text" },
        { id: "agreement_date", labelBn: "চুক্তির তারিখ", labelEn: "Agreement Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
        { id: "settlement_terms", labelBn: "নিষ্পত্তির শর্তাবলী", labelEn: "Settlement Terms", type: "textarea", validation: { required: true } },
        { id: "payment_schedule", labelBn: "পরিশোধের সময়সূচী", labelEn: "Payment Schedule", type: "textarea" },
        { id: "confidentiality_clause", labelBn: "গোপনীয়তা চুক্তি", labelEn: "Confidentiality Clause", type: "select", options: [{ value: "yes", labelBn: "প্রযোজ্য", labelEn: "Applicable" }, { value: "no", labelBn: "প্রযোজ্য নয়", labelEn: "Not Applicable" }] },
      ],
    },
  ],
};

export const Mushak181Schema: FormSchema = {
  formId: "mushak-18.1",
  sections: [
    {
      id: "consultant_application",
      titleBn: "ভ্যাট পরামর্শক লাইসেন্স আবেদন",
      titleEn: "VAT Consultant License Application",
      fields: [
        { id: "applicant_name", labelBn: "আবেদনকারীর নাম", labelEn: "Applicant Name", type: "text", validation: { required: true } },
        { id: "father_name", labelBn: "পিতার নাম", labelEn: "Father's Name", type: "text" },
        { id: "nid", labelBn: "জাতীয় পরিচয়পত্র নম্বর", labelEn: "NID Number", type: "text", validation: { required: true } },
        { id: "date_of_birth", labelBn: "জন্ম তারিখ", labelEn: "Date of Birth", type: "date" },
        { id: "phone", labelBn: "মোবাইল নম্বর", labelEn: "Phone Number", type: "tel" },
        { id: "email", labelBn: "ইমেইল", labelEn: "Email", type: "email" },
        { id: "educational_qualification", labelBn: "শিক্ষাগত যোগ্যতা", labelEn: "Educational Qualification", type: "text", validation: { required: true } },
        { id: "professional_experience", labelBn: "পেশাগত অভিজ্ঞতা (বছর)", labelEn: "Professional Experience (Years)", type: "number" },
        { id: "vat_training_certificate", labelBn: "ভ্যাট প্রশিক্ষণ সনদ", labelEn: "VAT Training Certificate", type: "text" },
        { id: "exam_fee_paid", labelBn: "পরীক্ষার ফি প্রদত্ত", labelEn: "Exam Fee Paid", type: "number" },
      ],
    },
  ],
};

export const Mushak182Schema: FormSchema = {
  formId: "mushak-18.2",
  sections: [
    {
      id: "copy_application",
      titleBn: "সনদপত্রের সত্যায়িত কপির জন্য আবেদন",
      titleEn: "Document Certified Copy Application",
      fields: [
        { id: "applicant_name", labelBn: "আবেদনকারীর নাম", labelEn: "Applicant Name", type: "text", validation: { required: true } },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text" },
        { id: "document_type", labelBn: "দলিলের ধরন", labelEn: "Document Type", type: "select", options: [
          { value: "registration_cert", labelBn: "নিবন্ধন সনদ", labelEn: "Registration Certificate" },
          { value: "return", labelBn: "রিটার্ন কপি", labelEn: "Return Copy" },
          { value: "invoice", labelBn: "চালান", labelEn: "Invoice" },
          { value: "notice", labelBn: "নোটিশ", labelEn: "Notice" },
          { value: "others", labelBn: "অন্যান্য", labelEn: "Others" },
        ], validation: { required: true } },
        { id: "document_ref_no", labelBn: "দলিলের রেফারেন্স নম্বর", labelEn: "Document Reference No", type: "text" },
        { id: "purpose", labelBn: "কপির প্রয়োজনীয়তার কারণ", labelEn: "Purpose of Copy", type: "textarea" },
        { id: "fee_paid", labelBn: "প্রদত্ত ফি", labelEn: "Fee Paid", type: "number" },
      ],
    },
  ],
};

// --- Admin/Internal Forms (restricted) ---

export const Mushak121Schema: FormSchema = {
  formId: "mushak-12.1",
  sections: [
    {
      id: "search_warrant",
      titleBn: "প্রবেশ/তল্লাশি/জব্দ কর্তৃত্বপত্র",
      titleEn: "Entry/Search/Seizure Authority",
      fields: [
        { id: "issuing_authority", labelBn: "কর্তৃপক্ষের নাম", labelEn: "Issuing Authority", type: "text", validation: { required: true } },
        { id: "authority_designation", labelBn: "পদবী", labelEn: "Designation", type: "text" },
        { id: "target_name", labelBn: "লক্ষ্যস্থলের নাম", labelEn: "Target Name", type: "text" },
        { id: "target_address", labelBn: "লক্ষ্যস্থলের ঠিকানা", labelEn: "Target Address", type: "textarea" },
        { id: "issue_date", labelBn: "ইস্যুর তারিখ", labelEn: "Issue Date", type: "date" },
        { id: "valid_until", labelBn: "বৈধতা পর্যন্ত", labelEn: "Valid Until", type: "date" },
        { id: "grounds", labelBn: "কারণ", labelEn: "Grounds", type: "textarea" },
      ],
    },
  ],
};

export const Mushak122Schema: FormSchema = {
  formId: "mushak-12.2",
  sections: [
    {
      id: "residence_entry",
      titleBn: "আবাসস্থলে প্রবেশের নোটিশ",
      titleEn: "Residence Entry Notice",
      fields: [
        { id: "officer_name", labelBn: "কর্মকর্তার নাম", labelEn: "Officer Name", type: "text" },
        { id: "resident_name", labelBn: "বাসিন্দার নাম", labelEn: "Resident Name", type: "text" },
        { id: "entry_date", labelBn: "প্রবেশের তারিখ", labelEn: "Entry Date", type: "date" },
        { id: "purpose", labelBn: "উদ্দেশ্য", labelEn: "Purpose", type: "textarea" },
      ],
    },
  ],
};

export const Mushak123Schema: FormSchema = {
  formId: "mushak-12.3",
  sections: [
    {
      id: "seizure_list",
      titleBn: "জব্দ তালিকা",
      titleEn: "Seizure List",
      fields: [
        { id: "seizing_officer", labelBn: "জব্দকারী কর্মকর্তা", labelEn: "Seizing Officer", type: "text" },
        { id: "seizure_date", labelBn: "জব্দের তারিখ", labelEn: "Seizure Date", type: "date" },
        { id: "owner_name", labelBn: "মালিকের নাম", labelEn: "Owner Name", type: "text" },
        { id: "items", labelBn: "জব্দকৃত পণ্য/দলিল", labelEn: "Seized Items/Documents", type: "array", fields: [
          { id: "item_name", labelBn: "পণ্যের নাম", labelEn: "Item Name", type: "text" },
          { id: "quantity", labelBn: "পরিমাণ", labelEn: "Quantity", type: "number" },
          { id: "estimated_value", labelBn: "আনুমানিক মূল্য", labelEn: "Estimated Value", type: "number" },
        ] },
      ],
    },
  ],
};

export const Mushak124Schema: FormSchema = {
  formId: "mushak-12.4",
  sections: [
    {
      id: "preliminary",
      titleBn: "প্রাথমিক তদন্ত প্রতিবেদন",
      titleEn: "Preliminary Investigation Report",
      fields: [
        { id: "investigating_officer", labelBn: "তদন্তকারী কর্মকর্তা", labelEn: "Investigating Officer", type: "text" },
        { id: "case_ref", labelBn: "মামলা রেফারেন্স", labelEn: "Case Reference", type: "text" },
        { id: "findings", labelBn: "প্রাথমিক অনুসন্ধান", labelEn: "Preliminary Findings", type: "textarea" },
        { id: "recommendations", labelBn: "প্রস্তাবনা", labelEn: "Recommendations", type: "textarea" },
      ],
    },
  ],
};

export const Mushak125Schema: FormSchema = {
  formId: "mushak-12.5",
  sections: [
    {
      id: "final_investigation",
      titleBn: "চূড়ান্ত তদন্ত প্রতিবেদন",
      titleEn: "Final Investigation Report",
      fields: [
        { id: "investigating_officer", labelBn: "তদন্তকারী কর্মকর্তা", labelEn: "Investigating Officer", type: "text" },
        { id: "case_ref", labelBn: "মামলা রেফারেন্স", labelEn: "Case Reference", type: "text" },
        { id: "detailed_findings", labelBn: "বিস্তারিত অনুসন্ধান ফলাফল", labelEn: "Detailed Findings", type: "textarea" },
        { id: "evidence_summary", labelBn: "প্রমাণের সারসংক্ষেপ", labelEn: "Evidence Summary", type: "textarea" },
        { id: "legal_analysis", labelBn: "আইনগত বিশ্লেষণ", labelEn: "Legal Analysis", type: "textarea" },
        { id: "final_recommendation", labelBn: "চূড়ান্ত সুপারিশ", labelEn: "Final Recommendation", type: "textarea" },
      ],
    },
  ],
};

const adminFormFields: FormField[] = [
  { id: "officer_name", labelBn: "কর্মকর্তার নাম", labelEn: "Officer Name", type: "text" },
  { id: "officer_designation", labelBn: "পদবী", labelEn: "Designation", type: "text" },
  { id: "subject", labelBn: "বিষয়", labelEn: "Subject", type: "text" },
  { id: "details", labelBn: "বিবরণ", labelEn: "Details", type: "textarea" },
  { id: "date", labelBn: "তারিখ", labelEn: "Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
];

export const Mushak126Schema: FormSchema = { formId: "mushak-12.6", sections: [{ id: "main", titleBn: "অনিয়ম/কর ফাঁকি মামলা", titleEn: "Irregularity/Tax Evasion Case", fields: adminFormFields }] };
export const Mushak129Schema: FormSchema = { formId: "mushak-12.9", sections: [{ id: "main", titleBn: "ব্যাংক অ্যাকাউন্ট冻结 আদেশ", titleEn: "Bank Account Freeze Order", fields: adminFormFields }] };
export const Mushak1210Schema: FormSchema = { formId: "mushak-12.10", sections: [{ id: "main", titleBn: "冻结 সম্মতি প্রতিবেদন", titleEn: "Freeze Compliance Report", fields: adminFormFields }] };
export const Mushak1211Schema: FormSchema = { formId: "mushak-12.11", sections: [{ id: "main", titleBn: "ব্যাংক অ্যাকাউন্ট 冻结মুক্তির আদেশ", titleEn: "Bank Account Unfreeze Order", fields: adminFormFields }] };
export const Mushak1212Schema: FormSchema = { formId: "mushak-12.12", sections: [{ id: "main", titleBn: "কারণ দর্শাও নোটিশ", titleEn: "Show Cause Notice", fields: adminFormFields }] };
export const Mushak1213Schema: FormSchema = { formId: "mushak-12.13", sections: [{ id: "main", titleBn: "নিষ্পত্তি আদেশ", titleEn: "Adjudication Order", fields: adminFormFields }] };

const recoveryFields: FormField[] = [
  { id: "debtor_name", labelBn: "ঋণগ্রস্তের নাম", labelEn: "Debtor Name", type: "text" },
  { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text" },
  { id: "amount", labelBn: "পরিমাণ", labelEn: "Amount", type: "number" },
  { id: "due_date", labelBn: "নির্ধারিত তারিখ", labelEn: "Due Date", type: "date" },
  { id: "officer", labelBn: "দায়িত্বপ্রাপ্ত কর্মকর্তা", labelEn: "Responsible Officer", type: "text" },
];

export const Mushak141Schema: FormSchema = { formId: "mushak-14.1", sections: [{ id: "main", titleBn: "ঋণ আদায় সনদ", titleEn: "Debt Recovery Certificate", fields: recoveryFields }] };
export const Mushak142Schema: FormSchema = { formId: "mushak-14.2", sections: [{ id: "main", titleBn: "সরকারি প্রাপ্য আদায় নোটিশ", titleEn: "Government Dues Recovery Notice", fields: recoveryFields }] };
export const Mushak143Schema: FormSchema = { formId: "mushak-14.3", sections: [{ id: "main", titleBn: "আদায় সম্মতি প্রতিবেদন", titleEn: "Recovery Compliance Report", fields: adminFormFields }] };
export const Mushak144Schema: FormSchema = { formId: "mushak-14.4", sections: [{ id: "main", titleBn: "ব্যবসা প্রতিষ্ঠান তালাবদ্ধকরণ নোটিশ", titleEn: "Business Premises Locking Notice", fields: adminFormFields }] };
export const Mushak145Schema: FormSchema = { formId: "mushak-14.5", sections: [{ id: "main", titleBn: "তালাবদ্ধকরণ সম্মতি প্রতিবেদন", titleEn: "Locking Compliance Report", fields: adminFormFields }] };
export const Mushak146Schema: FormSchema = { formId: "mushak-14.6", sections: [{ id: "main", titleBn: "ব্যবসা প্রতিষ্ঠান তালাবদ্ধকরণ আদেশ", titleEn: "Business Premises Locking Order", fields: adminFormFields }] };
export const Mushak147Schema: FormSchema = { formId: "mushak-14.7", sections: [{ id: "main", titleBn: "ইউটিলিটি সংযোগ বিচ্ছিন্নকরণ", titleEn: "Utility Service Disconnection", fields: adminFormFields }] };
export const Mushak148Schema: FormSchema = { formId: "mushak-14.8", sections: [{ id: "main", titleBn: "ইউটিলিটি পুনঃসংযোগ আদেশ", titleEn: "Utility Reconnection Order", fields: adminFormFields }] };
export const Mushak1411Schema: FormSchema = { formId: "mushak-14.11", sections: [{ id: "main", titleBn: "স্থাবর সম্পত্তি সংযুক্তিকরণ আদেশ", titleEn: "Immovable Property Attachment Order", fields: adminFormFields }] };
export const Mushak1412Schema: FormSchema = { formId: "mushak-14.12", sections: [{ id: "main", titleBn: "আদালতের স্থগিতাদেশের অনুরোধ", titleEn: "Court Stay Request", fields: adminFormFields }] };
export const Mushak1413Schema: FormSchema = { formId: "mushak-14.13", sections: [{ id: "main", titleBn: "সম্পত্তি বিক্রয় সনদ", titleEn: "Property Sale Certificate", fields: adminFormFields }] };
export const Mushak1414Schema: FormSchema = { formId: "mushak-14.14", sections: [{ id: "main", titleBn: "সংযুক্তিকরণ/জব্দ প্রত্যাহার আদেশ", titleEn: "Attachment/Seizure Withdrawal Order", fields: adminFormFields }] };

export const Mushak161Schema: FormSchema = { formId: "mushak-16.1", sections: [{ id: "main", titleBn: "অপরাধ তদন্ত নোটিশ", titleEn: "Offense Investigation Notice", fields: adminFormFields }] };

export const Mushak172Schema: FormSchema = {
  formId: "mushak-17.2",
  sections: [
    { id: "main", titleBn: "ADR মামলা রেজিস্টার", titleEn: "ADR Case Register",
      fields: [
        { id: "case_no", labelBn: "মামলা নম্বর", labelEn: "Case No", type: "text" },
        { id: "applicant", labelBn: "আবেদনকারী", labelEn: "Applicant", type: "text" },
        { id: "respondent", labelBn: "বিবাদী", labelEn: "Respondent", type: "text" },
        { id: "type", labelBn: "ধরন", labelEn: "Type", type: "select", options: [{ value: "appeal", labelBn: "আপিল", labelEn: "Appeal" }, { value: "mediation", labelBn: "মধ্যস্থতা", labelEn: "Mediation" }, { value: "arbitration", labelBn: "সালিশ", labelEn: "Arbitration" }] },
        { id: "status", labelBn: "অবস্থা", labelEn: "Status", type: "readonly" },
      ],
    },
  ],
};

export const Mushak184Schema: FormSchema = { formId: "mushak-18.4", sections: [{ id: "main", titleBn: "ভ্যাট ক্লিয়ারেন্স সার্টিফিকেট", titleEn: "VAT Clearance Certificate", fields: [{ id: "certificate_no", labelBn: "সনদ নম্বর", labelEn: "Certificate No", type: "text" }, { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text" }, { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text" }, { id: "valid_until", labelBn: "বৈধতা পর্যন্ত", labelEn: "Valid Until", type: "date" }, { id: "remarks", labelBn: "মন্তব্য", labelEn: "Remarks", type: "textarea" }] }] };

export const Mushak185Schema: FormSchema = { formId: "mushak-18.5", sections: [{ id: "main", titleBn: "ভ্যাট সম্মাননা সনদ", titleEn: "VAT Honor Certificate", fields: [{ id: "certificate_no", labelBn: "সনদ নম্বর", labelEn: "Certificate No", type: "text" }, { id: "awardee", labelBn: "সম্মাননাপ্রাপ্তের নাম", labelEn: "Awardee Name", type: "text" }, { id: "award_date", labelBn: "প্রদানের তারিখ", labelEn: "Award Date", type: "date" }, { id: "category", labelBn: "বিভাগ", labelEn: "Category", type: "text" }, { id: "citation", labelBn: "উদ্ধৃতি", labelEn: "Citation", type: "textarea" }] }] };

export const Mushak186Schema: FormSchema = { formId: "mushak-18.6", sections: [{ id: "main", titleBn: "জের বহন সনদ", titleEn: "Balance Carryforward Certificate", fields: [{ id: "certificate_no", labelBn: "সনদ নম্বর", labelEn: "Certificate No", type: "text" }, { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text" }, { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text" }, { id: "previous_year", labelBn: "পূর্ববর্তী বছর", labelEn: "Previous Year", type: "text" }, { id: "carried_amount", labelBn: "বহনকৃত পরিমাণ", labelEn: "Carried Amount", type: "number" }] }] };

export const Mushak183Schema: FormSchema = {
  formId: "mushak-18.3",
  sections: [
    {
      id: "clearance",
      titleBn: "ভ্যাট ক্লিয়ারেন্স সার্টিফিকেট আবেদন",
      titleEn: "VAT Clearance Certificate Application",
      fields: [
        { id: "business_name", labelBn: "প্রতিষ্ঠানের নাম", labelEn: "Business Name", type: "text", validation: { required: true }, autoFill: "client.name" },
        { id: "bin", labelBn: "বিআইএন", labelEn: "BIN", type: "text", autoFill: "client.bin" },
        { id: "tin", labelBn: "টিআইএন", labelEn: "TIN", type: "text", autoFill: "client.tin" },
        { id: "purpose", labelBn: "সার্টিফিকেটের উদ্দেশ্য", labelEn: "Purpose of Certificate", type: "select", options: [
          { value: "tender", labelBn: "টেন্ডার", labelEn: "Tender" },
          { value: "loan", labelBn: "ঋণ", labelEn: "Loan" },
          { value: "export", labelBn: "রপ্তানি", labelEn: "Export" },
          { value: "others", labelBn: "অন্যান্য", labelEn: "Others" },
        ] },
        { id: "tax_period_from", labelBn: "কর মেয়াদ (থেকে)", labelEn: "Tax Period (From)", type: "date" },
        { id: "tax_period_to", labelBn: "কর মেয়াদ ( পর্যন্ত)", labelEn: "Tax Period (To)", type: "date" },
        { id: "has_outstanding_dues", labelBn: "কোনো বকেয়া আছে?", labelEn: "Any Outstanding Dues?", type: "select", options: [
          { value: "no", labelBn: "না", labelEn: "No" },
          { value: "yes", labelBn: "হ্যাঁ", labelEn: "Yes" },
        ] },
      ],
    },
  ],
};

export const FORM_SCHEMAS: Record<string, FormSchema> = {
  "mushak-2.1": Mushak21Schema,
  "mushak-2.2": Mushak22Schema,
  "mushak-2.4": Mushak24Schema,
  "mushak-2.5": Mushak25Schema,
  "mushak-2.6": Mushak26Schema,
  "mushak-2.7": Mushak27Schema,
  "mushak-3.1": Mushak31Schema,
  "mushak-3.3": Mushak33Schema,
  "mushak-3.4": Mushak34Schema,
  "mushak-4.1": Mushak41Schema,
  "mushak-4.2": Mushak42Schema,
  "mushak-6.1": Mushak61Schema,
  "mushak-6.2": Mushak62Schema,
  "mushak-6.3": Mushak63Schema,
  "mushak-6.4": Mushak64Schema,
  "mushak-6.5": Mushak65Schema,
  "mushak-6.6": Mushak66Schema,
  "mushak-6.7": Mushak67Schema,
  "mushak-6.8": Mushak68Schema,
  "mushak-6.9": Mushak69Schema,
  "mushak-7.1": Mushak71Schema,
  "mushak-9.1": Mushak91Schema,
  "mushak-9.2": Mushak92Schema,
  "mushak-9.3": Mushak93Schema,
  "mushak-9.4": Mushak94Schema,
  "mushak-10.1": Mushak101Schema,
  "mushak-10.2": Mushak102Schema,
  "mushak-10.3": Mushak103Schema,
  "mushak-12.1": Mushak121Schema,
  "mushak-12.2": Mushak122Schema,
  "mushak-12.3": Mushak123Schema,
  "mushak-12.4": Mushak124Schema,
  "mushak-12.5": Mushak125Schema,
  "mushak-12.6": Mushak126Schema,
  "mushak-12.7": Mushak127Schema,
  "mushak-12.8": Mushak128Schema,
  "mushak-12.9": Mushak129Schema,
  "mushak-12.10": Mushak1210Schema,
  "mushak-12.11": Mushak1211Schema,
  "mushak-12.12": Mushak1212Schema,
  "mushak-12.13": Mushak1213Schema,
  "mushak-14.1": Mushak141Schema,
  "mushak-14.2": Mushak142Schema,
  "mushak-14.3": Mushak143Schema,
  "mushak-14.4": Mushak144Schema,
  "mushak-14.5": Mushak145Schema,
  "mushak-14.6": Mushak146Schema,
  "mushak-14.7": Mushak147Schema,
  "mushak-14.8": Mushak148Schema,
  "mushak-14.11": Mushak1411Schema,
  "mushak-14.12": Mushak1412Schema,
  "mushak-14.13": Mushak1413Schema,
  "mushak-14.14": Mushak1414Schema,
  "mushak-16.1": Mushak161Schema,
  "mushak-16.2": Mushak162Schema,
  "mushak-17.1": Mushak171Schema,
  "mushak-17.2": Mushak172Schema,
  "mushak-17.3": Mushak173Schema,
  "mushak-18.1": Mushak181Schema,
  "mushak-18.2": Mushak182Schema,
  "mushak-18.3": Mushak183Schema,
  "mushak-18.4": Mushak184Schema,
  "mushak-18.5": Mushak185Schema,
  "mushak-18.6": Mushak186Schema,
};

export function getAllFormIds(): string[] {
  return Object.keys(FORM_SCHEMAS);
}

export function getFormSchema(formId: string): FormSchema | undefined {
  return FORM_SCHEMAS[formId];
}
