import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch(
      "https://api.retellai.com/v2/create-web-call",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RETELL_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: process.env.RETELL_AGENT_ID,
          // Optional: you can REMOVE phase entirely if not needed
          retell_llm_dynamic_variables: {
            phase: "SUPPORT",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: "Retell API failed", details: errText },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      access_token: data.access_token,
      call_id: data.call_id,
    });
  } catch (error) {
    console.error("Create web call error:", error);
    return NextResponse.json(
      { error: "Failed to create web call" },
      { status: 500 }
    );
  }
}
