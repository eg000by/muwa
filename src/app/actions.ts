"use server";

export interface PreorderPayload {
  branchAddr: string;
  items: { id: string; qty: number }[];
  time: string;
  name: string;
  phone: string;
}

export interface PreorderResult {
  ok: boolean;
  orderNum: string;
}

// Оформление предзаказа. В демо-режиме генерирует номер заказа локально.
// Позже заказ будет уходить в YTimes (order/save). Оплата — демо.
export async function submitPreorder(_p: PreorderPayload): Promise<PreorderResult> {
  const orderNum = "MW-" + String(1000 + Math.floor(Math.random() * 9000));
  return { ok: true, orderNum };
}

export interface HrPayload {
  name: string;
  age: string;
  link: string;
  why: string;
  phone: string;
}

// Анкета «Хочу в команду». В демо просто подтверждает приём;
// позже анкеты будут сохраняться в БД (PostgreSQL).
export async function submitHr(_p: HrPayload): Promise<{ ok: boolean }> {
  return { ok: true };
}

export interface GiftPayload {
  amount: number;
  to: string;
  from: string;
  wish: string;
}

export interface GiftResult {
  ok: boolean;
  code: string;
}

// Покупка подарочного сертификата. В демо генерирует промокод локально;
// позже сертификаты будут сохраняться в БД (PostgreSQL) для проверки и погашения.
export async function submitGift(_p: GiftPayload): Promise<GiftResult> {
  const code =
    "MUWA-" +
    Math.random().toString(36).slice(2, 8).toUpperCase();
  return { ok: true, code };
}
