import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Task {
  id: string;
  title: string;
  due_date: string;
  type: string;
  client_id: string | null;
  profile_id: string;
  notification_sent: boolean;
}

interface Profile {
  id: string;
  full_name: string | null;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const cutoff = threeDaysFromNow.toISOString().split("T")[0];

    const { data: tasks, error: taskError } = await supabase
      .from("compliance_tasks")
      .select("*, profiles!inner(id, full_name)")
      .eq("status", "pending")
      .eq("notification_sent", false)
      .lte("due_date", cutoff);

    if (taskError || !tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { "Content-Type": "application/json" } });
    }

    const userTasks = new Map<string, { name: string; tasks: Task[] }>();

    for (const task of tasks) {
      const pid = task.profiles?.id;
      if (!pid) continue;
      if (!userTasks.has(pid)) {
        userTasks.set(pid, { name: task.profiles?.full_name || "User", tasks: [] });
      }
      userTasks.get(pid)!.tasks.push(task);
    }

    let sentCount = 0;

    for (const [profileId, data] of userTasks) {
      const { data: authUser } = await supabase.auth.admin.getUserById(profileId);
      const email = authUser?.user?.email;
      if (!email) continue;

      const taskRows = data.tasks
        .map((t) => `<tr><td>${t.title}</td><td>${t.due_date}</td></tr>`)
        .join("");

      const html = `
        <h2>নির্ধারিত তারিখ reminder</h2>
        <p>প্রিয় ${data.name},</p>
        <p>আপনার নিম্নলিখিত কাজগুলি নির্ধারিত তারিখ নিকটবর্তী:</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
          <tr><th>কাজ</th><th>তারিখ</th></tr>
          ${taskRows}
        </table>
        <p><a href="${appUrl}/dashboard/compliance">ড্যাশবোর্ডে যান</a></p>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@taxflow.app",
          to: [email],
          subject: "নির্ধারিত তারিখ reminder - VAT Compliance",
          html,
        }),
      });

      if (res.ok) {
        await supabase
          .from("compliance_tasks")
          .update({ notification_sent: true })
          .in("id", data.tasks.map((t) => t.id));
        sentCount++;
      }
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
