import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFormSchema } from "@/lib/forms/schema";
import { getFormDefinition } from "@/lib/forms/definitions";
import { generateFormPDF, pdfToBuffer } from "@/lib/forms/pdf-generator";
import React from "react";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filledFormId = url.searchParams.get("filledFormId");
    const formId = url.pathname.split("/")[3];

    if (!filledFormId) {
      return NextResponse.json({ error: "filledFormId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: filledForm } = await supabase
      .from("filled_forms")
      .select("*, clients(name, bin)")
      .eq("id", filledFormId)
      .single();

    if (!filledForm) {
      return NextResponse.json({ error: "Filled form not found" }, { status: 404 });
    }

    const schema = getFormSchema(formId);
    const definition = getFormDefinition(formId);

    if (!schema || !definition) {
      return NextResponse.json({ error: "Form schema not found" }, { status: 404 });
    }

    const pdfElement = generateFormPDF(
      formId,
      filledForm.form_data as Record<string, unknown>,
      { titleBn: definition.titleBn, titleEn: definition.titleEn },
      schema
    );

    const buffer = await pdfToBuffer(pdfElement);

    return new Response(buffer as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${formId}-${filledFormId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}
