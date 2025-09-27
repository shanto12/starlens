import { NextResponse } from "next/server";

import { castIChing } from "@/lib/divination/iching";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const reading = castIChing(question, new Date().toISOString().slice(0, 10));

    return NextResponse.json({ question, ...reading }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
