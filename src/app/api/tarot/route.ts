import { NextResponse } from "next/server";

import { drawTarot } from "@/lib/divination/tarot";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const spread = drawTarot(question, new Date().toISOString().slice(0, 10));

    return NextResponse.json({ question, ...spread }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
