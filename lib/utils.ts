import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { bn } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, language: string = "bn") {
  return new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, language: string = "bn") {
  const d = new Date(date);
  if (language === "bn") {
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string, language: string = "bn") {
  const d = new Date(date);
  if (language === "bn") {
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateInvoiceNumber(financialYear: string, seq: number): string {
  const yearShort = financialYear.slice(-2);
  return `M-${yearShort}/${seq.toString().padStart(6, "0")}`;
}

export function getFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 6) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function calculateVAT(amount: number, rate: number = 15): number {
  return (amount * rate) / 100;
}

export function calculateNetVAT(outputTax: number, inputTax: number): number {
  return outputTax - inputTax;
}
