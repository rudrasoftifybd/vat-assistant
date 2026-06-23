import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDeadlineReminder } from "@/lib/email";

export async function GET() {
  try {
    const supabase = await createClient();

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const cutoff = threeDaysFromNow.toISOString().split("T")[0];

    const { data: tasks } = await supabase
      .from("compliance_tasks")
      .select("*, profiles!inner(id, full_name)")
      .eq("status", "pending")
      .eq("notification_sent", false)
      .lte("due_date", cutoff);

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ sent: 0, message: "No pending deadlines" });
    }

    const tasksByUser = new Map<string, { email: string; name: string; tasks: any[] }>();

    for (const task of tasks) {
      if (!task.profiles?.id) continue;

      if (!tasksByUser.has(task.profiles.id)) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", task.profiles.id)
          .single();

        if (!profile) continue;

        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
        const email = authUser?.user?.email;

        if (!email) continue;

        tasksByUser.set(profile.id, {
          email,
          name: profile.full_name || "User",
          tasks: [],
        });
      }

      tasksByUser.get(task.profiles.id)!.tasks.push(task);
    }

    let sentCount = 0;

    for (const [, userData] of tasksByUser) {
      const tasksToSend = userData.tasks.map((t) => ({
        title: t.title,
        due_date: t.due_date,
        client_name: t.client_name,
        type: t.type,
      }));

      const ok = await sendDeadlineReminder(userData.email, userData.name, tasksToSend);

      if (ok) {
        await supabase
          .from("compliance_tasks")
          .update({ notification_sent: true })
          .in(
            "id",
            userData.tasks.map((t: any) => t.id)
          );
        sentCount++;
      }
    }

    return NextResponse.json({ sent: sentCount, total_users: tasksByUser.size });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed", details: (error as Error).message }, { status: 500 });
  }
}
