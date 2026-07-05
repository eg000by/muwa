// Наличие для витрины: { chap: string[], nekr: string[] } — id раскупленных позиций
// по филиалам. Витрина опрашивает этот роут (~30 сек / по фокусу вкладки).

import { NextResponse } from "next/server";
import { getSoldOutMap } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET() {
  const soldOut = await getSoldOutMap();
  return NextResponse.json(soldOut, {
    headers: { "Cache-Control": "no-store" },
  });
}
