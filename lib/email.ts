import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@taxflow.app";

export interface DeadlineTask {
  title: string;
  due_date: string;
  client_name?: string;
  type: string;
}

function getTypeLabelBn(type: string): string {
  const labels: Record<string, string> = {
    vat_return: "মুসক রিটার্ন জমা",
    vat_payment: "মুসক পরিশোধ",
    tax_return: "কর রিটার্ন",
    tds: "টিডিএস",
    renewal: "নবায়ন",
  };
  return labels[type] || type;
}

export function buildDeadlineEmailHtml(
  userName: string,
  tasks: DeadlineTask[]
): string {
  const taskRows = tasks
    .map(
      (t) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${getTypeLabelBn(t.type)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.client_name || "-"}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.due_date}</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 13px; }
    td { font-size: 13px; }
    .footer { text-align: center; padding: 15px; color: #64748b; font-size: 12px; }
    .btn { display: inline-block; background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ভ্যাট ও কমপ্লায়েন্স সহায়ক</h1>
      <p style="margin: 5px 0 0; opacity: 0.9;">নির্ধারিত তারিখ reminder</p>
    </div>
    <div class="body">
      <p>প্রিয় ${userName},</p>
      <p>আপনার নিম্নলিখিত কাজগুলির নির্ধারিত তারিখ নিকটবর্তী:</p>
      <table>
        <thead>
          <tr>
            <th>কাজ</th>
            <th>ধরন</th>
            <th>ক্লায়েন্ট</th>
            <th>নির্ধারিত তারিখ</th>
          </tr>
        </thead>
        <tbody>
          ${taskRows}
        </tbody>
      </table>
      <p style="margin-top: 15px;">অনুগ্রহ করে সময়মত কাজগুলি সম্পন্ন করুন।</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/compliance" class="btn">ড্যাশবোর্ডে যান</a>
    </div>
    <div class="footer">
      <p>VAT & Compliance Assistant | বাংলাদেশের ভ্যাট আইন অনুযায়ী</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendDeadlineReminder(
  email: string,
  userName: string,
  tasks: DeadlineTask[]
): Promise<boolean> {
  try {
    const resend = getResend();
    if (!resend) {
      console.log("[EMAIL SKIPPED] No RESEND_API_KEY configured");
      return true;
    }
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "নির্ধারিত তারিখ reminder - VAT Compliance",
      html: buildDeadlineEmailHtml(userName, tasks),
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}
