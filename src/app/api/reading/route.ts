import { NextResponse } from "next/server";

import { generateReading } from "@/lib/calculators/generate-reading";
import { readingRequestSchema, readingResponseSchema } from "@/lib/schemas/reading";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = readingRequestSchema.parse(body);
    const result = generateReading(parsed);

    const validated = readingResponseSchema.parse(result);

    return NextResponse.json(validated, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Unable to generate reading",
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
