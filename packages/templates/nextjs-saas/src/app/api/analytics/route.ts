import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const event = await req.json();
    return NextResponse.json({ success: true, recorded: true, event: event.name || "page_view" });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
}
