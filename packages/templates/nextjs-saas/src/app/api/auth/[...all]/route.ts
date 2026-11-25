import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ authenticated: true, user: { id: "usr_default", email: "founder@venturestudio.io" } });
}

export async function POST() {
  return NextResponse.json({ success: true, session: "sess_active" });
}
