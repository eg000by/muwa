"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  PRODUCTS, BRANCHES, TIMES, GIFT_AMOUNTS, TAB_HINTS, ALL_PRODUCTS,
  priceLabel, type TabKey, type BranchKey,
} from "@/lib/menu";
import { submitPreorder, submitHr, submitGift } from "@/app/actions";

/* ---------- helpers ---------- */

function jump(id: string) {
  const el = document.getElementById(id);
  // scroll-margin-top на секциях (globals.css) учитывает высоту прилипшей шапки.
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Фото с graceful-фолбэком на плейсхолдер «фото скоро». */
function CardImage({ img, name }: { img?: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!img || err) {
    return (
      <>
        <div className="pimg-c" />
        <span className="pimg-l">фото скоро</span>
      </>
    );
  }
  return <img src={`/assets/${img}`} alt={name} onError={() => setErr(true)} />;
}

/** Логотип: рамка фиксированного размера + зум внутрь картинки,
 *  чтобы центральные эмблема и текст читались крупнее. */
function Logo({ size, radius }: { size: number; radius: number }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size, borderRadius: radius, overflow: "hidden", flex: "none" }}>
      <img src="/assets/muwa-logo2.jpg" alt="MUWA" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.4)" }} />
    </span>
  );
}

// useLayoutEffect на клиенте, useEffect на сервере (без предупреждений SSR)
const useIso = typeof document !== "undefined" ? useLayoutEffect : useEffect;

/** Переключатель филиалов с «резиновым» ползунком-пилюлей,
 *  который едет и подстраивается под ширину активной кнопки. */
function BranchSeg({
  branch, onSelect, style, full,
}: {
  branch: BranchKey;
  onSelect: (b: BranchKey) => void;
  style?: React.CSSProperties;
  full?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const a = el.querySelector<HTMLButtonElement>(`button[data-k="${branch}"]`);
    if (a) setThumb({ left: a.offsetLeft, top: a.offsetTop, width: a.offsetWidth, height: a.offsetHeight });
  }, [branch]);

  useIso(() => { measure(); }, [measure, full]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  return (
    <div className={`bseg${full ? " full" : ""}`} style={style} ref={ref}>
      <span className="bseg-thumb" style={{ transform: `translate(${thumb.left}px, ${thumb.top}px)`, width: thumb.width, height: thumb.height }} />
      <button data-k="chap" className={branch === "chap" ? "on" : ""} onClick={() => onSelect("chap")}>Чапаевская</button>
      <button data-k="nekr" className={branch === "nekr" ? "on" : ""} onClick={() => onSelect("nekr")}>Некрасовская</button>
    </div>
  );
}

/** Переключатель категорий витрины с тем же «резиновым» ползунком,
 *  что и у филиалов: пилюля едет и подстраивается под ширину активной кнопки. */
function TabSeg({ tab, onSelect }: { tab: TabKey; onSelect: (t: TabKey) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const a = el.querySelector<HTMLButtonElement>(`button[data-k="${tab}"]`);
    if (a) setThumb({ left: a.offsetLeft, top: a.offsetTop, width: a.offsetWidth, height: a.offsetHeight });
  }, [tab]);

  useIso(() => { measure(); }, [measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const items: [TabKey, string][] = [["desserts", "Десерты"], ["kitchen", "Сытная кухня"], ["drinks", "Напитки"]];

  return (
    <div className="bseg" ref={ref}>
      <span className="bseg-thumb" style={{ transform: `translate(${thumb.left}px, ${thumb.top}px)`, width: thumb.width, height: thumb.height }} />
      {items.map(([k, label]) => (
        <button key={k} data-k={k} className={tab === k ? "on" : ""} onClick={() => onSelect(k)}>{label}</button>
      ))}
    </div>
  );
}

/** Пункты навигации (вынесены наружу — стабильная идентичность,
 *  чтобы при ререндере не перемонтировались и не проигрывали анимацию заново). */
function NavLinks({ onGo }: { onGo: (id: string) => void }) {
  return (
    <>
      <a onClick={() => onGo("menu")}>Витрина</a>
      <a onClick={() => onGo("preorder")}>Предзаказ</a>
      <a onClick={() => onGo("gift")}>Сертификаты</a>
      <a onClick={() => onGo("team")}>Команда</a>
      <a onClick={() => onGo("contacts")}>Контакты</a>
    </>
  );
}

/* ---------- icons ---------- */

const IconDog = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" /></svg>
);
const IconLaptop = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="3" y="4" rx="1" /><path d="M2 20h20" /></svg>
);
const IconChef = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><path d="M6 17h12" /></svg>
);
const IconLeaf = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
);
const IconPin = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
const IconCart = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);
const IconBagAdd = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M12 10.5v5M9.5 13h5" /></svg>
);
const IconQr = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4" /></svg>
);

/* ---------- component ---------- */

type CartStep = "cart" | "contacts" | "pay" | "done";
type GiftStep = "form" | "done";

export default function MuwaSite() {
  const [branch, setBranch] = useState<BranchKey>("chap");
  const [tab, setTab] = useState<TabKey>("desserts");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [navOpen, setNavOpen] = useState(false);
  const [navClosing, setNavClosing] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartClosing, setCartClosing] = useState(false);
  const [cartStep, setCartStep] = useState<CartStep>("cart");
  const [time, setTime] = useState(TIMES[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNum, setOrderNum] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const [giftOpen, setGiftOpen] = useState(false);
  const [giftStep, setGiftStep] = useState<GiftStep>("form");
  const [giftAmount, setGiftAmount] = useState(1000);
  const [gTo, setGTo] = useState("");
  const [gFrom, setGFrom] = useState("");
  const [gWish, setGWish] = useState("");
  const [giftCode, setGiftCode] = useState<string | null>(null);
  const [buyingGift, setBuyingGift] = useState(false);

  const [hr, setHr] = useState({ name: "", age: "", link: "", why: "", phone: "" });
  const [hrSent, setHrSent] = useState(false);
  const [sendingHr, setSendingHr] = useState(false);

  const B = BRANCHES[branch];

  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const afterCartClose = useRef<(() => void) | null>(null);

  const reduceMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Пока открыта корзина или модалка сертификата — блокируем прокрутку фона.
  // position:fixed вместо overflow:hidden, иначе iOS Safari всё равно скроллит
  // страницу под оверлеем. Позицию скролла сохраняем и восстанавливаем.
  useEffect(() => {
    if (!cartOpen && !giftOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      Object.assign(body.style, prev);
      window.scrollTo(0, scrollY);
    };
  }, [cartOpen, giftOpen]);

  /* ---- cart ops ---- */
  const addCart = useCallback((id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }, []);

  /** «Частичка» летит по дуге от кнопки товара к иконке заказа в шапке. */
  const flyToCart = useCallback((sourceEl: HTMLElement) => {
    const cartEl = cartBtnRef.current;
    if (!cartEl) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const from = sourceEl.getBoundingClientRect();
    const to = cartEl.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const dx = to.left + to.width / 2 - startX;
    const dy = to.top + to.height / 2 - startY;

    const dot = document.createElement("span");
    dot.className = "fly-dot";
    dot.style.left = `${startX}px`;
    dot.style.top = `${startY}px`;
    document.body.appendChild(dot);

    const anim = dot.animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 70}px)) scale(1.15)`, opacity: 1, offset: 0.6 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.3)`, opacity: 0.35, offset: 1 },
      ],
      { duration: 620, easing: "cubic-bezier(0.22,0.61,0.36,1)", fill: "forwards" }
    );
    anim.onfinish = () => {
      dot.remove();
      cartEl.classList.add("bump");
      setTimeout(() => cartEl.classList.remove("bump"), 320);
    };
  }, []);

  /** Добавление из витрины: кладём в корзину и запускаем полёт частички. */
  const addFromMenu = useCallback((e: React.MouseEvent, id: string) => {
    addCart(id);
    flyToCart(e.currentTarget as HTMLElement);
  }, [addCart, flyToCart]);
  const decCart = useCallback((id: string) => {
    setCart((c) => {
      const n = { ...c };
      const v = (n[id] || 0) - 1;
      if (v <= 0) delete n[id];
      else n[id] = v;
      return n;
    });
  }, []);

  const cartIds = Object.keys(cart);
  const cartCount = cartIds.reduce((s, id) => s + cart[id], 0);
  const total = cartIds.reduce((s, id) => s + (ALL_PRODUCTS[id] ? ALL_PRODUCTS[id].price * cart[id] : 0), 0);

  const products = PRODUCTS[tab];

  // Закрытие моб. меню с анимацией: держим блок смонтированным до конца
  // анимации navClose (или сразу, если у пользователя reduce-motion).
  const closeNav = () => {
    if (!navOpen) return;
    if (reduceMotion()) { setNavOpen(false); return; }
    setNavClosing(true);
    setNavOpen(false);
  };

  const openCart = () => {
    closeNav();
    setCartClosing(false);
    setCartOpen(true);
    if (orderNum) setCartStep("cart");
  };
  // Закрытие корзины с анимацией выезда; afterCartClose — что сделать после.
  const closeCart = () => {
    if (reduceMotion()) {
      setCartOpen(false);
      afterCartClose.current?.();
      afterCartClose.current = null;
      return;
    }
    setCartClosing(true);
  };
  const onDrawerAnimEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "drawerOut" || e.animationName === "drawerDown") {
      setCartOpen(false);
      setCartClosing(false);
      afterCartClose.current?.();
      afterCartClose.current = null;
    }
  };

  const go = (id: string) => {
    // Сначала закрываем моб. меню, затем скроллим на следующих кадрах —
    // иначе позиция считается, пока раскрытое меню ещё занимает высоту.
    closeNav();
    requestAnimationFrame(() => requestAnimationFrame(() => jump(id)));
  };
  // «Заказать с собой»: с пустой корзиной ведём к витрине, иначе открываем корзину.
  const orderToGo = () => (cartCount === 0 ? go("menu") : openCart());

  const okName = name.trim().length > 1;
  const okPhone = phone.trim().length >= 6;

  const payNow = async () => {
    setPlacing(true);
    try {
      const res = await submitPreorder({
        branchAddr: B.addr,
        items: cartIds.map((id) => ({ id, qty: cart[id] })),
        time, name, phone,
      });
      setOrderNum(res.orderNum);
      setCartStep("done");
    } finally {
      setPlacing(false);
    }
  };

  const newOrder = () => {
    const reset = () => {
      setCart({}); setCartStep("cart"); setName(""); setPhone(""); setOrderNum(null);
    };
    if (reduceMotion()) { setCartOpen(false); reset(); return; }
    // Сброс состояния после завершения анимации закрытия — чтобы «done»-экран
    // не мигнул пустой корзиной во время выезда.
    afterCartClose.current = reset;
    setCartClosing(true);
  };

  const giftOk = gTo.trim().length > 2;
  const payGift = async () => {
    setBuyingGift(true);
    try {
      const res = await submitGift({ amount: giftAmount, to: gTo, from: gFrom, wish: gWish });
      setGiftCode(res.code);
      setGiftStep("done");
    } finally {
      setBuyingGift(false);
    }
  };

  const hrDisabled = !(hr.name.trim() && hr.phone.trim());
  const sendHr = async () => {
    setSendingHr(true);
    try {
      await submitHr(hr);
      setHrSent(true);
    } finally {
      setSendingHr(false);
    }
  };

  const cartStepTitle = useMemo(() => ({
    cart: "Твоя корзина", contacts: "Контакты", pay: "Оплата", done: "Готово",
  }[cartStep]), [cartStep]);

  return (
    <>
      {/* ===== NAV ===== */}
      <div className="nav">
        <div className="wrapc nav-in">
          <Logo size={46} radius={12} />
          <nav className="nav-links"><NavLinks onGo={go} /></nav>
          <div className="nav-right">
            <BranchSeg branch={branch} onSelect={setBranch} />
            <button className="cartbtn" ref={cartBtnRef} onClick={openCart} aria-label="Заказ">
              <IconCart />{cartCount > 0 && <span className="cc">{cartCount}</span>}
            </button>
            <button className={`burger${navOpen ? " open" : ""}`} onClick={() => (navOpen ? closeNav() : setNavOpen(true))} aria-label="Меню">{navOpen ? <IconClose /> : <IconMenu />}</button>
          </div>
        </div>
        {(navOpen || navClosing) && (
          <div className={`nav-menu${navClosing ? " closing" : ""}`} onAnimationEnd={(e) => { if (e.animationName === "navClose") setNavClosing(false); }}>
            <NavLinks onGo={go} />
            <BranchSeg branch={branch} onSelect={setBranch} style={{ marginTop: 14, alignSelf: "flex-start" }} />
          </div>
        )}
      </div>

      {/* ===== HERO ===== */}
      <section className="hero" id="top">
        <div className="hero-bg" />
        <div className="wrapc">
          <div className="hero-grid">
            <div className="hero-l">
              <p className="eyebrow">Кофейня-кондитерская · Самара</p>
              <h1 className="hero-title">KEEP MUWA<br /><b>&amp; SAVE</b> PEACE</h1>
              <p className="hero-lead">Душевный проект от бариста. Живая зелень, уютный лофт и безупречный вкус — заходи как к близким друзьям.</p>
              <div className="hero-ctas">
                <a className="cta cta-red" onClick={orderToGo}>Заказать с собой →</a>
                <a className="cta cta-out" onClick={() => go("menu")}>Что на витрине сегодня?</a>
              </div>
              <div className="hero-meta"><span className="hours-min">Сегодня 10:00–21:00</span></div>
            </div>
            <div className="hero-r">
              <HeroImage img={B.hero} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== MENU ===== */}
      <section className="sec" id="menu">
        <div className="wrapc">
          <p className="eyebrow">Сегодня в Muwa · {B.addr}</p>
          <h2 className="h2">ВИТРИНА <b>ДНЯ</b></h2>
          <div className="tabbar">
            <TabSeg tab={tab} onSelect={setTab} />
            <span className="lead" style={{ fontSize: 14 }}>{TAB_HINTS[tab]}</span>
          </div>
          <div className="menu-grid">
            {products.map((p) => {
              const qty = cart[p.id] || 0;
              return (
                <div className="pcard" key={p.id}>
                  <div className="pimg">
                    <CardImage img={p.img} name={p.name} />
                    {p.tag && <span className="ptag">{p.tag}</span>}
                  </div>
                  <div className="pbody">
                    <h3 className="pname">{p.name}</h3>
                    <p className="pdesc">{p.desc}</p>
                    <div className="pfoot">
                      <span className="pprice">{priceLabel(p.price)}</span>
                      {qty > 0 ? (
                        <div className="qty">
                          <button onClick={() => decCart(p.id)}>−</button>
                          <span>{qty}</span>
                          <button onClick={(e) => addFromMenu(e, p.id)}>+</button>
                        </div>
                      ) : (
                        <button className="padd" onClick={(e) => addFromMenu(e, p.id)} aria-label="Добавить в предзаказ"><IconBagAdd s={17} /></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CLICK & COLLECT ===== */}
      <section className="sec cc-sec" id="preorder">
        <div className="wrapc">
          <p className="eyebrow">Онлайн-заказ · самовывоз</p>
          <h2 className="h2">ЗАКАЗ <b>С СОБОЙ</b></h2>
          <p className="lead" style={{ maxWidth: 560, marginTop: 14 }}>Собери корзину, выбери время — заберёшь готовый заказ на баре по QR-коду. Без очереди.</p>
          <div className="steps">
            <div className="step">
              <div className="step-ic"><span className="mini-seg"><i className="on" /><i /></span></div>
              <div className="step-n">1</div>
              <div className="step-t">Выбери филиал</div>
              <div className="step-d">Чапаевская, 92 или Некрасовская, 2 — где удобно забрать.</div>
            </div>
            <div className="step">
              <div className="step-n">2</div>
              <div className="step-t">Собери корзину</div>
              <div className="step-d">Десерты, кухня и напитки из сегодняшней витрины.</div>
              <a className="step-link" onClick={() => go("menu")}>Собрать корзину →</a>
            </div>
            <div className="step">
              <div className="step-pay">
                <img src="/assets/sbp.svg" alt="СБП" />
                <img src="/assets/t-pay.png" alt="T-Pay" className="raw" />
              </div>
              <div className="step-n">3</div>
              <div className="step-t">Время и оплата</div>
              <div className="step-d">Укажи, к какому времени готовить. Оплата СБП или T-Pay.</div>
            </div>
            <div className="step">
              <div className="step-ic"><IconQr /></div>
              <div className="step-n">4</div>
              <div className="step-t">QR на баре</div>
              <div className="step-d">Покажи QR-код — бариста уже собрал твой заказ.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GIFT ===== */}
      <section className="sec" id="gift">
        <div className="wrapc">
          <div className="gift-grid">
            <div>
              <p className="eyebrow">Подарочные сертификаты</p>
              <h2 className="h2">ПОДАРИ <b>MUWA</b></h2>
              <p className="lead" style={{ margin: "14px 0 22px" }}>Электронный сертификат с тёплым пожеланием. После оплаты получатель мгновенно получит красивую карту и промокод для списания на кассе.</p>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
                <div className="metric"><b>4</b><span>номинала</span></div>
                <div className="metric"><b>PDF</b><span>карта в фирменном стиле</span></div>
                <div className="metric"><b>∞</b><span>срок можно указать</span></div>
              </div>
              <a className="cta cta-red" onClick={() => { setGiftStep("form"); setGiftOpen(true); }}>Купить сертификат →</a>
            </div>
            <GiftCardVisual amount={giftAmount} />
          </div>
        </div>
      </section>

      {/* ===== COFFEE OF THE WEEK ===== */}
      <section className="sec" id="coffee" style={{ background: "var(--cream-100)" }}>
        <div className="wrapc">
          <p className="eyebrow">Спешелти-зона</p>
          <h2 className="h2">КОФЕ <b>НЕДЕЛИ</b></h2>
          <div className="coffee-grid" style={{ marginTop: 30 }}>
            <div className="coffee-card">
              <span className="cap" style={{ fontSize: 11, color: "var(--accent)" }}>Фильтр · V60</span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: "8px 0 4px", color: "var(--graphite-900)" }}>Кения AA · Ньери</h3>
              <p className="lead" style={{ fontSize: 15 }}>Обжарщик Rockets. Яркая кислотность красного апельсина, тело сливы, послевкусие тёмного шоколада.</p>
              <div className="coffee-metrics">
                <div className="metric"><b>1550 м</b><span>высота</span></div>
                <div className="metric"><b>SL-28</b><span>сорт</span></div>
                <div className="metric"><b>washed</b><span>обработка</span></div>
              </div>
              <div className="bean"><span style={{ fontWeight: 600 }}>Кислотность</span><span className="cap" style={{ color: "var(--accent)", fontSize: 13 }}>высокая</span></div>
              <div className="bean" style={{ borderBottom: "none" }}><span style={{ fontWeight: 600 }}>Сладость</span><span className="cap" style={{ color: "var(--accent)", fontSize: 13 }}>средняя</span></div>
            </div>
            <div className="coffee-card" style={{ background: "var(--graphite-900)", color: "var(--cream-050)" }}>
              <span className="cap" style={{ fontSize: 11, color: "var(--red-300)" }}>Эспрессо-база</span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, margin: "8px 0 4px", color: "#fff" }}>Бразилия · Серрадо</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(251,247,240,.72)" }}>Обжарщик Tasty. Молочный шоколад, фундук и мягкая карамель — идеальна для капучино.</p>
              <p style={{ marginTop: 24, fontSize: 15, lineHeight: 1.6, color: "rgba(251,247,240,.82)" }}>Мы влюблены в кофе третьей волны и работаем с российскими specialty-обжарщиками. Каждую неделю ставим новое зерно на фильтр — и с радостью расскажем про него у стойки.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section className="sec">
        <div className="wrapc">
          <p className="eyebrow">Атмосфера</p>
          <h2 className="h2">ПРАВИЛА <b>ДОМА</b></h2>
          <div className="phil-grid" style={{ marginTop: 30 }}>
            <div className="phil"><div className="phil-ic"><IconDog /></div><div className="phil-t">Dog-friendly</div><div className="phil-d">Рады всем животным — нальём твоей собаке свежей воды.</div></div>
            <div className="phil"><div className="phil-ic"><IconLaptop /></div><div className="phil-t">Место для работы</div><div className="phil-d">На Некрасовской есть большой стол для работы, розетки и быстрый Wi-Fi.</div></div>
            <div className="phil"><div className="phil-ic"><IconChef /></div><div className="phil-t">Готовим сами</div><div className="phil-d">Все кондитерские изделия и еду готовим сами в собственном цеху.</div></div>
            <div className="phil"><div className="phil-ic"><IconLeaf /></div><div className="phil-t">Натуральность</div><div className="phil-d">Только натуральные ингредиенты, печём всё сами с любовью.</div></div>
          </div>
        </div>
      </section>

      {/* ===== HR ===== */}
      <section className="sec hr-sec" id="team">
        <div className="wrapc">
          <div className="hr-grid">
            <div>
              <p className="eyebrow">Хочу в команду</p>
              <h2 className="h2">ДАВАЙ <b>ЗНАКОМИТЬСЯ</b></h2>
              <p className="lead" style={{ marginTop: 16 }}>Привет! Ищешь место, где ценят людей, а не сухие стандарты? Расскажи о себе — анкета сразу прилетит управляющему в Telegram.</p>
              <img src="/assets/muwa-team.jpg" alt="Команда MUWA" style={{ width: "100%", maxWidth: 340, aspectRatio: "1/1", objectFit: "cover", objectPosition: "center 22%", borderRadius: 20, marginTop: 24, border: "1.5px solid var(--border)", boxShadow: "var(--shadow-md)" }} />
            </div>
            <div>
              {!hrSent ? (
                <div style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: 20, padding: 26, boxShadow: "var(--shadow-sm)" }}>
                  <div className="form2">
                    <div className="field"><label>Имя</label><input className="inp" value={hr.name} onChange={(e) => setHr({ ...hr, name: e.target.value })} placeholder="Как тебя зовут" /></div>
                    <div className="field"><label>Возраст</label><input className="inp" value={hr.age} onChange={(e) => setHr({ ...hr, age: e.target.value })} placeholder="18+" /></div>
                  </div>
                  <div className="field"><label>Соцсети или Telegram</label><input className="inp" value={hr.link} onChange={(e) => setHr({ ...hr, link: e.target.value })} placeholder="@username или ссылка" /></div>
                  <div className="field"><label>Почему хочешь работать именно в Muwa?</label><textarea className="inp" value={hr.why} onChange={(e) => setHr({ ...hr, why: e.target.value })} placeholder="Пару слов от души" /></div>
                  <div className="field"><label>Телефон для связи</label><input className="inp" value={hr.phone} onChange={(e) => setHr({ ...hr, phone: e.target.value })} placeholder="+7 ___ ___-__-__" /></div>
                  <button className="cta cta-red" style={{ width: "100%", marginTop: 6 }} disabled={hrDisabled || sendingHr} onClick={sendHr}>{sendingHr ? "Отправляем…" : "Отправить анкету →"}</button>
                </div>
              ) : (
                <div className="thanks">
                  <div className="thanks-ic">✓</div>
                  <h3 style={{ fontSize: 22, margin: "0 0 8px", color: "var(--graphite-900)" }}>Спасибо, {hr.name}!</h3>
                  <p className="lead" style={{ fontSize: 15 }}>Анкета улетела управляющему в Telegram. Мы напишем тебе в ближайшее время ☕</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACTS ===== */}
      <section className="sec" id="contacts">
        <div className="wrapc">
          <p className="eyebrow">Контакты</p>
          <h2 className="h2">ЗАХОДИ <b>В ГОСТИ</b></h2>
          <div className="contacts-grid" style={{ marginTop: 30 }}>
            <div>
              <BranchSeg branch={branch} onSelect={setBranch} style={{ marginBottom: 18 }} />
              <div className="addr-row"><span className="cap" style={{ color: "var(--accent)", fontSize: 12, minWidth: 74 }}>Адрес</span><b style={{ color: "var(--graphite-900)" }}>{B.addr}</b></div>
              <div className="addr-row"><span className="cap" style={{ color: "var(--accent)", fontSize: 12, minWidth: 74 }}>Часы</span><span>Ежедневно 10:00–21:00</span></div>
              <div className="addr-row"><span className="cap" style={{ color: "var(--accent)", fontSize: 12, minWidth: 74 }}>Телефон</span><span>+7 846 000-00-00</span></div>
              <div className="addr-row" style={{ borderBottom: "none" }}><span className="cap" style={{ color: "var(--accent)", fontSize: 12, minWidth: 74 }}>Рядом</span><span>{B.near}</span></div>
              <div className="socials"><a className="soc">Инстаграм</a><a className="soc">Telegram</a></div>
              <div style={{ marginTop: 20 }}><a className="cta cta-out cta-sm" onClick={openCart}>Заказать с собой</a></div>
            </div>
            <div className="map">
              <MapImage />
              <div className="map-c" />
              <div style={{ position: "absolute", left: 16, bottom: 16, display: "flex", gap: 8 }}>
                <a className="cta cta-ink cta-sm" href={`https://yandex.ru/maps/?text=${encodeURIComponent("Самара " + B.addr)}`} target="_blank" rel="noopener noreferrer"><IconPin />Открыть в Яндекс Картах</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="foot">
        <div className="wrapc">
          <div className="foot-grid">
            <div className="foot-col">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <Logo size={42} radius={11} />
                <span className="cap" style={{ color: "rgba(251,247,240,.9)", fontSize: 13, lineHeight: 1.3 }}>Keep muwa<br />and save peace</span>
              </div>
              <p className="foot-legal">Кофейня-кондитерская MUWA · спешелти-кофе и домашние кондитерские изделия. Самара.</p>
            </div>
            <div className="foot-col"><div className="foot-h">Адреса</div><a className="foot-link">Чапаевская, 92</a><a className="foot-link">Некрасовская, 2</a><span className="foot-legal" style={{ margin: 0 }}>Ежедневно 10:00–21:00</span></div>
            <div className="foot-col"><div className="foot-h">Контакты</div><a className="foot-link">+7 846 000-00-00</a><a className="foot-link">hello@muwa.coffee</a><div style={{ display: "flex", gap: 10, marginTop: 8 }}><a className="soc" style={{ borderColor: "rgba(255,255,255,.25)", color: "rgba(251,247,240,.85)", padding: "7px 12px" }}>Инстаграм</a><a className="soc" style={{ borderColor: "rgba(255,255,255,.25)", color: "rgba(251,247,240,.85)", padding: "7px 12px" }}>Telegram</a></div></div>
            <div className="foot-col"><div className="foot-h">Документы</div><a className="foot-link">Публичная оферта</a><a className="foot-link">Политика конфиденциальности</a><a className="foot-link">Согласие на обработку ПДн</a><a className="foot-link">Оплата и возврат</a></div>
          </div>
          <div className="foot-bottom">
            <span>ИП Фамилия Имя Отчество · ИНН 630000000000 · ОГРНИП 300000000000000 · г. Самара, ул. Чапаевская, 92<br />Оплата картами и через СБП / T-Pay. Все цены указаны в рублях.</span>
            <span>© 2026 MUWA</span>
          </div>
        </div>
      </footer>

      {/* ===== CART DRAWER ===== */}
      {cartOpen && (
        <div className={`ov${cartClosing ? " closing" : ""}`} onClick={closeCart}>
          <div className="drawer" onClick={(e) => e.stopPropagation()} onAnimationEnd={onDrawerAnimEnd}>
            <div className="dhead">
              <div>
                <div className="cap" style={{ fontSize: 10.5, color: "var(--accent)" }}>Предзаказ · {B.addr}</div>
                <b style={{ fontSize: 19, color: "var(--graphite-900)" }}>{cartStepTitle}</b>
              </div>
              <button className="xbtn" onClick={closeCart}>×</button>
            </div>

            <div className="dbody">
              <div className="step-anim" key={cartStep}>
              {cartStep === "cart" && (
                <>
                  {cartIds.length === 0 && <div className="emptycart">Корзина пока пустая.<br />Загляни в витрину дня ↑</div>}
                  {cartIds.map((id) => (
                    <div className="citem" key={id}>
                      {ALL_PRODUCTS[id]?.img
                        ? <img className="citem-img" src={`/assets/${ALL_PRODUCTS[id].img}`} alt={ALL_PRODUCTS[id].name} />
                        : <div className="citem-img" />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--graphite-900)" }}>{ALL_PRODUCTS[id]?.name}</div>
                        <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>{priceLabel(ALL_PRODUCTS[id]?.price || 0)}</div>
                      </div>
                      <div className="qty"><button onClick={() => decCart(id)}>−</button><span>{cart[id]}</span><button onClick={() => addCart(id)}>+</button></div>
                    </div>
                  ))}
                  {cartIds.length > 0 && (
                    <div style={{ marginTop: 22 }}>
                      <div className="cap" style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>Филиал сборки</div>
                      <BranchSeg branch={branch} onSelect={setBranch} full style={{ width: "100%" }} />
                      <div className="cap" style={{ fontSize: 11, color: "var(--text-muted)", margin: "18px 0 10px" }}>Ко времени</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {TIMES.map((t) => (
                          <button key={t} className={time === t ? "chip on" : "chip"} onClick={() => setTime(t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {cartStep === "contacts" && (
                <>
                  <div className="field"><label>Имя</label><input className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как тебя зовут" /></div>
                  <div className="field"><label>Телефон</label><input className="inp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ___ ___-__-__" /></div>
                  <p className="lead" style={{ fontSize: 13, marginTop: 6 }}>Пришлём статус заказа в SMS. Заказ забираешь на {B.addr} — {time}.</p>
                </>
              )}

              {cartStep === "pay" && (
                <>
                  <div className="row-sb" style={{ marginBottom: 8 }}><span className="lead" style={{ fontSize: 15 }}>К оплате</span><span className="ordernum" style={{ fontSize: 26 }}>{priceLabel(total)}</span></div>
                  <p className="lead" style={{ fontSize: 13, margin: "0 0 18px" }}>{name} · {phone} · {time}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button className="cta cta-red" style={{ width: "100%" }} disabled={placing} onClick={payNow}>Оплатить через СБП</button>
                    <button className="cta cta-ink" style={{ width: "100%" }} disabled={placing} onClick={payNow}>Оплатить через T-Pay</button>
                  </div>
                  <p className="lead" style={{ fontSize: 12, marginTop: 14, textAlign: "center" }}>Демо-оплата · платёж не проводится</p>
                </>
              )}

              {cartStep === "done" && (
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <div className="thanks-ic" style={{ marginBottom: 14 }}>✓</div>
                  <h3 style={{ fontSize: 20, margin: "0 0 4px", color: "var(--graphite-900)" }}>Заказ принят!</h3>
                  <p className="lead" style={{ fontSize: 14, margin: "0 0 18px" }}>Покажи QR-код на баре</p>
                  <div className="qr"><div className="qr-c" /></div>
                  <div className="cap" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 16 }}>Номер заказа</div>
                  <div className="ordernum">{orderNum}</div>
                  <p className="lead" style={{ fontSize: 13, marginTop: 12 }}>{B.addr} · {time}<br />Бариста получил заказ в Telegram ☕</p>
                </div>
              )}
              </div>
            </div>

            <div className="dfoot">
              {cartStep === "cart" && (
                <>
                  <div className="row-sb" style={{ marginBottom: 12 }}><span className="lead" style={{ fontSize: 14 }}>Итого</span><b style={{ fontSize: 20, color: "var(--accent)" }}>{priceLabel(total)}</b></div>
                  <button className="cta cta-red" style={{ width: "100%" }} disabled={cartIds.length === 0} onClick={() => setCartStep("contacts")}>Далее → контакты</button>
                </>
              )}
              {cartStep === "contacts" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="cta cta-out" onClick={() => setCartStep("cart")}>← Назад</button>
                  <button className="cta cta-red" style={{ flex: 1 }} disabled={!(okName && okPhone)} onClick={() => setCartStep("pay")}>Далее → оплата</button>
                </div>
              )}
              {cartStep === "pay" && (
                <button className="cta cta-out" style={{ width: "100%" }} onClick={() => setCartStep("contacts")}>← Назад</button>
              )}
              {cartStep === "done" && (
                <button className="cta cta-red" style={{ width: "100%" }} onClick={newOrder}>Новый заказ</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== GIFT MODAL ===== */}
      {giftOpen && (
        <div className="ov ov-c" onClick={() => setGiftOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="dhead">
              <div>
                <div className="cap" style={{ fontSize: 10.5, color: "var(--accent)" }}>Подарочный сертификат</div>
                <b style={{ fontSize: 19, color: "var(--graphite-900)" }}>{giftStep === "form" ? "Оформление" : "Готово"}</b>
              </div>
              <button className="xbtn" onClick={() => setGiftOpen(false)}>×</button>
            </div>
            <div className="dbody">
              <div className="step-anim" key={giftStep}>
              {giftStep === "form" ? (
                <>
                  <GiftCardVisual amount={giftAmount} compact />
                  <div className="cap" style={{ fontSize: 11, color: "var(--text-muted)", margin: "18px 0 10px" }}>Номинал</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                    {GIFT_AMOUNTS.map((a) => (
                      <button key={a} className={giftAmount === a ? "chip on" : "chip"} onClick={() => setGiftAmount(a)}>{priceLabel(a)}</button>
                    ))}
                  </div>
                  <div className="form2">
                    <div className="field"><label>Кому (email/телефон)</label><input className="inp" value={gTo} onChange={(e) => setGTo(e.target.value)} placeholder="получатель" /></div>
                    <div className="field"><label>От кого</label><input className="inp" value={gFrom} onChange={(e) => setGFrom(e.target.value)} placeholder="твоё имя" /></div>
                  </div>
                  <div className="field"><label>Тёплое пожелание</label><textarea className="inp" value={gWish} onChange={(e) => setGWish(e.target.value)} placeholder="Пару слов от души" /></div>
                  <button className="cta cta-red" style={{ width: "100%", marginTop: 6 }} disabled={!giftOk || buyingGift} onClick={payGift}>{buyingGift ? "Оплата…" : `Оплатить ${priceLabel(giftAmount)} →`}</button>
                  <p className="lead" style={{ fontSize: 12, marginTop: 12, textAlign: "center" }}>СБП · T-Pay · демо-оплата</p>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div className="thanks-ic" style={{ margin: "0 auto 14px" }}>✓</div>
                  <h3 style={{ fontSize: 20, margin: "0 0 6px", color: "var(--graphite-900)" }}>Сертификат отправлен!</h3>
                  <p className="lead" style={{ fontSize: 14, margin: "0 0 18px" }}>PDF-карта на {priceLabel(giftAmount)} улетела на {gTo}</p>
                  <div className="gift-card" style={{ aspectRatio: "1.9", textAlign: "left" }}>
                    <div className="gift-card-c" />
                    <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Logo size={38} radius={10} />
                      <span className="cap" style={{ fontSize: 11 }}>Gift card</span>
                    </div>
                    <div className="gift-amt" style={{ fontSize: 40 }}>{priceLabel(giftAmount)}</div>
                    <div style={{ position: "relative", marginTop: 6, fontSize: 13, opacity: .9 }}>Промокод для кассы</div>
                    <div style={{ position: "relative", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: ".04em" }}>{giftCode}</div>
                  </div>
                  <button className="cta cta-out" style={{ width: "100%", marginTop: 18 }} onClick={() => setGiftOpen(false)}>Готово</button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- sub visuals ---------- */

function HeroImage({ img }: { img: string }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="hero-r" style={{ position: "absolute", inset: 0, borderRadius: 24 }} />;
  return <img src={`/assets/${img}`} alt="MUWA" onError={() => setErr(true)} />;
}

function MapImage() {
  const [err, setErr] = useState(false);
  if (err) return null;
  return <img src="/assets/muwa-interior.webp" alt="Карта" onError={() => setErr(true)} />;
}

function GiftCardVisual({ amount, compact }: { amount: number; compact?: boolean }) {
  return (
    <div className="gift-card" style={compact ? { aspectRatio: "1.9" } : undefined}>
      <div className="gift-card-c" />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo size={compact ? 38 : 42} radius={10} />
        <span className="cap" style={{ fontSize: 12 }}>Gift card</span>
      </div>
      <div className="gift-amt" style={compact ? { fontSize: 44 } : undefined}>{priceLabel(amount)}</div>
      <div style={{ position: "relative", marginTop: 8, fontSize: 13, opacity: .85 }}>Keep muwa and save peace</div>
    </div>
  );
}
