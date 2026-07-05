// DEV-ОСНАСТКА (не админка): переключение мок-стоп-листа для проверки витрины,
// пока нет боевого ключа YTimes. Тело: { branch: "chap"|"nekr", id: <product.id>,
// on: boolean }. on=true — убрать позицию (в стоп), on=false — вернуть.
//
// Доступно только в режиме заглушки и не в production (или при YTIMES_MOCK=1).
// С боевым ключом стоп-лист ведётся в самой YTimes — этот роут отключён.

import { NextResponse } from "next/server";
import { ALL_PRODUCTS, type BranchKey } from "@/lib/menu";
import { isMockMode } from "@/lib/ytimes/client";
import { setMockStop } from "@/lib/ytimes/mockClient";
import { SHOP_GUID } from "@/lib/ytimes/config";
import { invalidateAvailability } from "@/lib/availability";

function enabled(): boolean {
  return isMockMode() && (process.env.NODE_ENV !== "production" || process.env.YTIMES_MOCK === "1");
}

export async function POST(req: Request) {
  if (!enabled()) {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  let body: { branch?: string; id?: string; on?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const branch = body.branch as BranchKey;
  const shopGuid = SHOP_GUID[branch];
  const product = body.id ? ALL_PRODUCTS[body.id] : undefined;

  if (!shopGuid) {
    return NextResponse.json({ error: "unknown branch" }, { status: 400 });
  }
  if (!product?.ytimesGuid) {
    return NextResponse.json({ error: "product has no ytimesGuid" }, { status: 400 });
  }

  const guids = await setMockStop(shopGuid, product.ytimesGuid, body.on !== false);
  invalidateAvailability(shopGuid);

  return NextResponse.json({ ok: true, branch, shopGuid, stopGuids: guids });
}
