import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGroq } from "@/app/services/image-analysis";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const analysis = await analyzeWithGroq(image);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
