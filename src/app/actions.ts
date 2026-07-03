"use server";

import { notify } from "@/lib/notify";
import { ALL_PRODUCTS, priceLabel } from "@/lib/menu";

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

// Оформление предзаказа. В демо-режиме генерирует номер заказа локально и
// уведомляет бариста (консоль или Telegram, если настроен). Оплата — демо.
export async function submitPreorder(p: PreorderPayload): Promise<PreorderResult> {
  const orderNum = "MW-" + String(1000 + Math.floor(Math.random() * 9000));

  const itemLines = p.items.map((it) => {
    const prod = ALL_PRODUCTS[it.id];
    const name = prod ? prod.name : it.id;
    const sum = prod ? prod.price * it.qty : 0;
    return `• ${name} ×${it.qty} — ${priceLabel(sum)}`;
  });
  const total = p.items.reduce((s, it) => {
    const prod = ALL_PRODUCTS[it.id];
    return s + (prod ? prod.price * it.qty : 0);
  }, 0);

  await notify(`Новый предзаказ ${orderNum}`, [
    `Филиал: ${p.branchAddr}`,
    `Ко времени: ${p.time}`,
    `Гость: ${p.name} · ${p.phone}`,
    "",
    ...itemLines,
    `Итого: ${priceLabel(total)}`,
  ]);

  return { ok: true, orderNum };
}

export interface HrPayload {
  name: string;
  age: string;
  link: string;
  why: string;
  phone: string;
}

// Анкета «Хочу в команду» → уведомление управляющему.
export async function submitHr(p: HrPayload): Promise<{ ok: boolean }> {
  await notify("Новая анкета в команду", [
    `Имя: ${p.name}${p.age ? `, ${p.age}` : ""}`,
    `Связь: ${p.link || "—"} · ${p.phone}`,
    `Почему Muwa: ${p.why || "—"}`,
  ]);
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

// Покупка подарочного сертификата. В демо генерирует промокод локально.
export async function submitGift(p: GiftPayload): Promise<GiftResult> {
  const code =
    "MUWA-" +
    Math.random().toString(36).slice(2, 8).toUpperCase();

  await notify("Куплен сертификат", [
    `Номинал: ${priceLabel(p.amount)}`,
    `Кому: ${p.to}`,
    `От: ${p.from || "—"}`,
    `Пожелание: ${p.wish || "—"}`,
    `Промокод: ${code}`,
  ]);

  return { ok: true, code };
}
