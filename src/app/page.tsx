"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/site.config";
import { CATEGORIES, REVIEWS, FEATURES, won, minPrice, type Item } from "@/data";

/* 5% 플라워 — 내추럴 보태니컬.
   카테고리별 큰 사진 + 설명이 좌우로 번갈아 나오는 지그재그 구성,
   각 카테고리 안에서 상품을 가로로 넘겨 봅니다.
   상품을 누르면 '금액 상이' 안내 시트 → 확인 시 전화 연결. */

const SECTIONS = [
  { id: "products", label: "꽃 둘러보기" },
  { id: "story", label: "5%의 정성" },
  { id: "reviews", label: "후기" },
  { id: "contact", label: "전화 상담" },
];

/* 카테고리별 감성 카피 (분위기 문구만, 구체적 약속 없음) */
const NOTES: Record<string, string> = {
  축하화환: "새 출발을 여는 자리에, 리본 한 줄까지 반듯하게 세워 보냅니다.",
  근조화환: "말로 다 못한 위로를 흰 꽃의 결에 담아 조용히 전합니다.",
  꽃다발: "포장 한 겹, 리본 한 번 더. 받는 순간의 표정을 떠올리며 묶습니다.",
  꽃바구니: "병문안과 감사 인사에, 오래 두고 보는 풍성함을 담았습니다.",
  관엽화분: "새로운 공간에 초록 한 그루. 오래 곁에 머무는 축하가 됩니다.",
  동서양란: "격식이 필요한 자리에, 단정한 잎선과 곧은 꽃대로 품위를 더합니다.",
};

const catId = (key: string) => `cat-${key}`;

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.3 21 3 12.7 3 3c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1.1l-2.2 2.1z" />
    </svg>
  );
}

/* 잎 덩굴 라인 장식 */
function Sprig({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <g transform={flip ? "translate(160 0) scale(-1 1)" : undefined}>
      <path d="M4 40C40 20 90 14 156 22" />
      <path d="M30 30c2-10 10-15 18-14-2 9-9 14-18 14z" fill="currentColor" fillOpacity=".18" />
      <path d="M52 24c-6-8-4-16 2-20 4 7 3 15-2 20z" fill="currentColor" fillOpacity=".18" />
      <path d="M74 20c4-9 12-12 19-10-3 8-10 12-19 10z" fill="currentColor" fillOpacity=".18" />
      <path d="M98 18c-5-8-3-15 3-18 3 7 2 14-3 18z" fill="currentColor" fillOpacity=".18" />
      <path d="M120 19c5-8 13-10 19-7-4 7-11 10-19 7z" fill="currentColor" fillOpacity=".18" />
      <circle cx="152" cy="21" r="2.2" fill="currentColor" fillOpacity=".5" stroke="none" />
      </g>
    </svg>
  );
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" fill="currentColor" fillOpacity=".15" />
      <path d="M4 20 15 9" strokeLinecap="round" />
    </svg>
  );
}

/* FEATURES 순서(당일·전국·디자인)에 맞춘 식물 라인 아이콘 */
const FEATURE_ICONS = [
  <svg key="sun" viewBox="0 0 48 48" className="w-11 h-11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <circle cx="24" cy="22" r="7" />
    <path d="M24 8v4M24 32v4M10 22h4M34 22h4M14 12l3 3M31 29l3 3M34 12l-3 3M17 29l-3 3" />
    <path d="M12 42c6-4 18-4 24 0" />
  </svg>,
  <svg key="seed" viewBox="0 0 48 48" className="w-11 h-11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M24 42V20" />
    <path d="M24 28c-8 0-12-6-12-12 8 0 12 5 12 12zM24 22c0-8 5-13 12-13 0 8-5 13-12 13z" fill="currentColor" fillOpacity=".15" />
    <path d="M12 42h24" />
  </svg>,
  <svg key="hand" viewBox="0 0 48 48" className="w-11 h-11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <circle cx="24" cy="14" r="4" />
    <path d="M24 10c0-5 6-5 5 0M28 14c5 0 5 6 0 5M20 14c-5 0-5 6 0 5M24 18v14" />
    <path d="M24 26c-4-4-9-3-11-1M24 28c4-4 9-3 11-1" />
    <path d="M14 40c3-4 7-6 10-6s7 2 10 6" />
  </svg>,
];

export default function Home() {
  const [active, setActive] = useState("products");
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<Item | null>(null);
  const [allReviews, setAllReviews] = useState(false);
  const chipBarRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tel = `tel:${SITE.phoneHref}`;

  // 헤더 메뉴 활성 표시
  useEffect(() => {
    const ob = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) ob.observe(el);
    });
    return () => ob.disconnect();
  }, []);

  // 카테고리 칩 활성 표시
  useEffect(() => {
    const ob = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) setActiveCat(e.target.getAttribute("data-cat") ?? "");
        }),
      { rootMargin: "-35% 0px -60% 0px" }
    );
    CATEGORIES.forEach((c) => {
      const el = document.getElementById(catId(c.key));
      if (el) ob.observe(el);
    });
    return () => ob.disconnect();
  }, []);

  // 활성 칩이 칩 바 안에서 보이도록 가로 스크롤
  useEffect(() => {
    const bar = chipBarRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${activeCat}"]`);
    if (bar && chip) {
      bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
    }
  }, [activeCat]);

  // 안내 시트가 열려 있는 동안 스크롤 잠금 + ESC 닫기
  useEffect(() => {
    if (!notice) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNotice(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [notice]);

  const go = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const slide = (key: string, dir: 1 | -1) => {
    const row = rowRefs.current[key];
    row?.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: "smooth" });
  };

  const shownReviews = allReviews ? REVIEWS : REVIEWS.slice(0, 4);

  return (
    <>
      {/* ───────── 헤더 ───────── */}
      <header className="fixed inset-x-0 top-0 z-50 bg-[var(--cream)]/95 backdrop-blur border-b border-[var(--line)]">
        <nav className="max-w-6xl mx-auto h-[72px] px-4 sm:px-6 flex items-center justify-between gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={`${SITE.name} 홈으로`}
            className="shrink-0 rounded-[18px] bg-white p-1 shadow-sm ring-1 ring-[var(--line)]"
          >
            {SITE.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={SITE.logo} alt={SITE.name} className="h-[56px] w-auto object-contain rounded-[14px]" />
            ) : (
              <span className="font-batang px-3 text-xl font-bold text-[var(--forest)]">{SITE.name}</span>
            )}
          </button>

          <ul className="hidden md:flex items-center gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-full text-[15px] transition ${
                    active === s.id
                      ? "bg-[var(--sage-soft)] text-[var(--forest)] font-bold"
                      : "text-[var(--muted)] hover:text-[var(--forest)]"
                  }`}
                >
                  {active === s.id && <Leaf className="w-3.5 h-3.5" />}
                  {s.label}
                </button>
              </li>
            ))}
            <li>
              <a
                href={tel}
                className="ml-2 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-[var(--forest)] text-[var(--cream)] text-[15px] font-bold hover:bg-[var(--forest-2)] transition"
              >
                <PhoneIcon className="w-4 h-4" />
                <span className="tabular-nums">{SITE.phone}</span>
              </a>
            </li>
          </ul>

          <div className="md:hidden flex items-center gap-1.5">
            <a
              href={tel}
              className="flex items-center gap-1.5 h-11 px-4 rounded-full bg-[var(--forest)] text-[var(--cream)] text-sm font-bold"
            >
              <PhoneIcon className="w-4 h-4" />
              전화 주문
            </a>
            <button
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="w-11 h-11 rounded-full border border-[var(--line)] bg-[var(--paper)] flex flex-col items-center justify-center gap-[5px]"
            >
              <span className={`block w-5 h-[1.5px] bg-[var(--forest)] transition ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[var(--forest)] transition ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[var(--forest)] transition ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden linen bg-[var(--paper)] border-t border-[var(--line)] px-4 pt-3 pb-5 anim-fade">
            <ul className="grid grid-cols-2 gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => go(s.id)}
                    className={`w-full min-h-12 px-4 rounded-2xl text-left text-[15px] border ${
                      active === s.id
                        ? "border-[var(--sage)] bg-[var(--sage-soft)] text-[var(--forest)] font-bold"
                        : "border-[var(--line)] bg-white/70 text-[var(--ink)]"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[var(--muted)]">바로 찾아가기</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => go(catId(c.key))}
                  className="min-h-11 px-3.5 rounded-full bg-white border border-[var(--line)] text-sm text-[var(--forest)]"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-[72px]">
        {/* ───────── 인트로 + 카테고리 바로가기 ───────── */}
        <div id="products">
        <section className="relative overflow-hidden linen">
          <Sprig className="hidden sm:block absolute -left-6 top-10 w-72 text-[var(--sage)] anim-sway" />
          <Sprig flip className="hidden sm:block absolute -right-6 top-24 w-72 text-[var(--sage)] anim-sway" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-6 sm:pt-14 sm:pb-12 text-center">
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs tracking-[0.25em] text-[var(--kraft-deep)] font-bold">
              <Leaf className="w-3.5 h-3.5 text-[var(--sage)]" />
              THE LAST 5% OF CARE
            </p>
            <h1 className="font-batang mt-2 sm:mt-4 text-[22px] sm:text-[42px] leading-snug font-bold text-[var(--forest)] break-keep">
              꽃은 같아도, <span className="whitespace-nowrap">마지막 5%가 다릅니다</span>
            </h1>
            <p className="mt-1.5 sm:mt-4 text-[13px] sm:text-base text-[var(--muted)] break-keep">
              리본 끝, 잎 한 장까지 매만지는 정성 · 전국 당일배송 · 365일 상담
            </p>

            <ul className="mt-4 sm:mt-10 grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-3 sm:gap-5 max-w-4xl mx-auto">
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button onClick={() => go(catId(c.key))} className="group w-full flex flex-col items-center">
                    <span className="relative block w-[76px] h-[76px] sm:w-[112px] sm:h-[112px] rounded-full p-1 bg-white ring-1 ring-[var(--line)] group-hover:ring-[var(--sage)] transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/${c.items[0].folder}/${c.items[0].name}.jpg`}
                        alt=""
                        className="w-full h-full rounded-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                      <Leaf className="absolute -bottom-0.5 -right-0.5 w-6 h-6 sm:w-7 sm:h-7 text-[var(--sage)] bg-[var(--cream)] rounded-full p-1" />
                    </span>
                    <span className="mt-1.5 sm:mt-3 text-[13px] sm:text-[15px] font-bold text-[var(--forest)] break-keep">
                      {c.name}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[var(--muted)] tabular-nums">
                      {won(minPrice(c))}~
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 따라오는 카테고리 칩 바 */}
        <div className="sticky top-[72px] z-40 bg-[var(--cream)]/95 backdrop-blur border-y border-[var(--line)]">
          <div ref={chipBarRef} className="no-scrollbar max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                data-chip={c.key}
                onClick={() => go(catId(c.key))}
                className={`shrink-0 h-11 px-4 rounded-full text-sm transition border ${
                  activeCat === c.key
                    ? "bg-[var(--forest)] border-[var(--forest)] text-[var(--cream)] font-bold"
                    : "bg-white/70 border-[var(--line)] text-[var(--forest)] hover:border-[var(--sage)]"
                }`}
              >
                {c.name}
                <span className={`ml-1 text-[11px] ${activeCat === c.key ? "text-[var(--kraft)]" : "text-[var(--muted)]"}`}>
                  {c.items.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ───────── 지그재그 카테고리 섹션 ───────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-14 sm:space-y-24">
          {CATEGORIES.map((c, idx) => {
            const even = idx % 2 === 0;
            return (
              <article
                key={c.key}
                id={catId(c.key)}
                data-cat={c.key}
                className="scroll-mt-[136px]"
              >
                <div className="grid md:grid-cols-12 gap-5 md:gap-10 items-center">
                  <div className={`md:col-span-7 ${even ? "" : "md:order-2"}`}>
                    <div className={`relative overflow-hidden ${even ? "organic-b" : "organic-c"} aspect-[16/10] md:aspect-[5/4] bg-[var(--paper)]`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/${c.items[0].folder}/${c.items[0].name}.jpg`}
                        alt={c.name}
                        loading={idx === 0 ? "eager" : "lazy"}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#2f4b2a]/35 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-4 sm:bottom-5 sm:left-7 px-3 py-1.5 rounded-full bg-[var(--cream)]/90 text-[11px] sm:text-xs font-bold text-[var(--forest)]">
                        {c.items.length}가지 · {won(minPrice(c))}부터
                      </span>
                    </div>
                  </div>
                  <div className={`md:col-span-5 ${even ? "" : "md:order-1 md:text-right"}`}>
                    <Sprig flip={!even} className={`w-28 sm:w-36 text-[var(--sage)] ${even ? "" : "md:ml-auto"}`} />
                    <p className="mt-1 text-[11px] sm:text-xs tracking-[0.25em] font-bold text-[var(--kraft-deep)]">
                      BOTANICAL NOTE · {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h2 className="font-batang mt-1.5 text-[26px] sm:text-[40px] leading-tight font-bold text-[var(--forest)] break-keep">
                      {c.name}
                    </h2>
                    <p className="mt-2 text-[15px] sm:text-lg text-[var(--ink)] break-keep">{c.desc}</p>
                    <p className="mt-2 sm:mt-3 text-[13px] sm:text-[15px] leading-relaxed text-[var(--muted)] break-keep">
                      {NOTES[c.key] ?? ""}
                    </p>
                  </div>
                </div>

                {/* 상품 가로 스크롤 줄 */}
                <div className="relative mt-5 sm:mt-8">
                  <div className="hidden sm:flex absolute -top-14 right-0 gap-2">
                    <button
                      onClick={() => slide(c.key, -1)}
                      aria-label={`${c.name} 이전 상품`}
                      className="w-11 h-11 rounded-full border border-[var(--line)] bg-white text-[var(--forest)] hover:border-[var(--sage)]"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => slide(c.key, 1)}
                      aria-label={`${c.name} 다음 상품`}
                      className="w-11 h-11 rounded-full border border-[var(--line)] bg-white text-[var(--forest)] hover:border-[var(--sage)]"
                    >
                      →
                    </button>
                  </div>
                  <div
                    ref={(el) => {
                      rowRefs.current[c.key] = el;
                    }}
                    className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
                  >
                    {c.items.map((it) => (
                      <button
                        key={`${it.folder}-${it.name}`}
                        onClick={() => setNotice(it)}
                        className="group snap-start shrink-0 w-[150px] sm:w-[200px] text-left rounded-[22px] bg-[var(--paper)] ring-1 ring-[var(--line)] hover:ring-[var(--sage)] p-2 transition"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[var(--cream)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/${it.folder}/${it.name}.jpg`}
                            alt={it.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="px-1.5 pt-2.5 pb-1.5">
                          <p className="text-[13px] sm:text-[15px] font-bold text-[var(--ink)] leading-snug break-keep min-h-[2.5em]">
                            {it.name}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between gap-1">
                            <span className="text-[13px] sm:text-[15px] font-bold text-[var(--forest)] tabular-nums">
                              {won(it.price)}~
                            </span>
                            <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--sage-soft)] text-[var(--forest)] flex items-center justify-center group-hover:bg-[var(--forest)] group-hover:text-[var(--cream)] transition">
                              <PhoneIcon className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
          <p className="text-center text-xs sm:text-sm text-[var(--muted)] break-keep">
            * 제품별 금액은 상이할 수 있으며, 정확한 금액은 상담 시 안내해 드립니다.
          </p>
        </div>
        </div>

        {/* ───────── 5%의 정성 (서비스 소개) ───────── */}
        <section id="story" className="kraft-paper relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
          <Sprig className="absolute -left-10 bottom-6 w-64 text-[var(--forest)] opacity-40" />
          <div className="relative max-w-6xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
              <div className="md:col-span-5">
                <p className="text-[11px] sm:text-xs tracking-[0.25em] font-bold text-[var(--forest)]/70">OUR 5%</p>
                <h2 className="font-batang mt-3 text-[28px] sm:text-[44px] leading-tight font-bold text-[var(--forest)] break-keep">
                  95%는 꽃이 하고,
                  <br />
                  나머지 5%는 마음이 합니다
                </h2>
              </div>
              <p className="md:col-span-7 text-[15px] sm:text-lg leading-relaxed text-[var(--ink)]/80 break-keep">
                좋은 꽃을 고르는 것만큼, 리본을 다시 묶고 잎의 방향을 고르는 마지막 손길이 중요하다고 믿습니다.
                {` ${SITE.name}`}이 꽃 한 송이를 보내는 방식입니다.
              </p>
            </div>

            <ul className="mt-10 sm:mt-14 grid sm:grid-cols-3 gap-4 sm:gap-6">
              {FEATURES.map((f, i) => (
                <li
                  key={f.t}
                  className={`relative bg-[var(--paper)] p-6 sm:p-8 shadow-[0_2px_0_rgba(47,75,42,.12)] ${
                    i === 1 ? "rounded-[28px] sm:translate-y-6" : i === 0 ? "rounded-[60px_20px_28px_28px]" : "rounded-[20px_60px_28px_28px]"
                  }`}
                >
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[var(--ribbon)] text-white text-[11px] font-bold tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="w-16 h-16 rounded-full bg-[var(--sage-soft)] text-[var(--forest)] flex items-center justify-center">
                    {FEATURE_ICONS[i]}
                  </div>
                  <h3 className="font-batang mt-5 text-xl sm:text-2xl font-bold text-[var(--forest)]">{f.t}</h3>
                  <p className="mt-2 text-[14px] sm:text-base text-[var(--muted)] break-keep">{f.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── 후기 ───────── */}
        <section id="reviews" className="py-16 sm:py-28 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <Sprig className="w-32 mx-auto text-[var(--sage)]" />
              <h2 className="font-batang mt-3 text-[28px] sm:text-[40px] font-bold text-[var(--forest)]">
                꽃을 받은 분들의 이야기
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">보내 주신 소중한 후기를 옮겨 적었습니다</p>
            </div>

            <div className="mt-10 sm:mt-14 columns-1 sm:columns-2 lg:columns-3 gap-5">
              {shownReviews.map((r, i) => (
                <figure
                  key={r.name}
                  className="relative mb-5 break-inside-avoid rounded-[24px] bg-[var(--paper)] ring-1 ring-[var(--line)] px-6 pt-8 pb-6"
                >
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 kraft-paper opacity-80 ${
                      i % 2 ? "rotate-2" : "-rotate-2"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex gap-0.5 text-[var(--sage)]" aria-label="별점 5점">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <Leaf key={n} className="w-4 h-4" />
                    ))}
                  </div>
                  <h3 className="font-batang mt-3 text-lg font-bold text-[var(--forest)] break-keep">{r.title}</h3>
                  <blockquote className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-[var(--ink)]/80 break-keep">
                    {r.body}
                  </blockquote>
                  <figcaption className="mt-4 text-xs text-[var(--muted)]">— {r.name} 고객님</figcaption>
                </figure>
              ))}
            </div>

            {!allReviews && (
              <div className="text-center">
                <button
                  onClick={() => setAllReviews(true)}
                  className="mt-2 min-h-12 px-7 rounded-full border border-[var(--forest)] text-[var(--forest)] font-bold text-sm hover:bg-[var(--forest)] hover:text-[var(--cream)] transition"
                >
                  후기 {REVIEWS.length - 4}개 더 보기
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ───────── 전화 상담 ───────── */}
        <section id="contact" className="px-4 sm:px-6 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto relative overflow-hidden organic-b bg-[var(--forest)] text-[var(--cream)] px-6 py-12 sm:px-16 sm:py-20">
            <Sprig className="absolute -right-8 top-6 w-56 sm:w-80 text-[var(--sage)] opacity-60" flip />
            <Sprig className="absolute -left-10 bottom-4 w-48 sm:w-72 text-[var(--sage)] opacity-40" />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-[11px] sm:text-xs tracking-[0.25em] font-bold text-[var(--kraft)]">CALL &amp; ORDER</p>
                <h2 className="font-batang mt-3 text-[28px] sm:text-[40px] leading-tight font-bold break-keep">
                  어떤 꽃이 좋을지
                  <br />
                  전화로 함께 골라요
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[var(--cream)]/75 break-keep">
                  받는 분과 자리를 말씀해 주시면 상담사가 어울리는 꽃을 안내해 드립니다.
                </p>
              </div>
              <div>
                <a
                  href={tel}
                  className="group block rounded-[28px] bg-[var(--cream)] text-[var(--forest)] p-6 sm:p-8 text-center hover:bg-white transition"
                >
                  <span className="text-xs sm:text-sm text-[var(--muted)]">대표번호 · 365일 상담</span>
                  <span className="font-batang block mt-2 text-[34px] sm:text-[48px] font-bold tabular-nums leading-none">
                    {SITE.phone}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 min-h-12 px-7 rounded-full bg-[var(--forest)] text-[var(--cream)] font-bold group-hover:bg-[var(--forest-2)] transition">
                    <PhoneIcon className="w-4 h-4" />
                    지금 전화하기
                  </span>
                </a>
                <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs text-[var(--cream)]/80">
                  <li className="rounded-2xl border border-[var(--cream)]/20 py-3 px-1 break-keep">365일 연중무휴</li>
                  <li className="rounded-2xl border border-[var(--cream)]/20 py-3 px-1 break-keep">당일 배송 접수</li>
                  <li className="rounded-2xl border border-[var(--cream)]/20 py-3 px-1 break-keep">전국 배송 (도서·산간 일부 제외)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 플로팅 전화 버튼 — 잎 모양 */}
      <a
        href={tel}
        aria-label={`${SITE.phone} 전화 주문`}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 h-14 pl-4 pr-5 rounded-[28px_8px_28px_8px] bg-[var(--forest)] text-[var(--cream)] font-bold shadow-lg shadow-[#2f4b2a]/30 ring-2 ring-[var(--cream)] hover:bg-[var(--forest-2)] transition"
      >
        <PhoneIcon className="w-5 h-5" />
        <span className="text-sm sm:text-base tabular-nums">
          <span className="sm:hidden">전화 주문</span>
          <span className="hidden sm:inline">{SITE.phone}</span>
        </span>
      </a>

      {/* ───────── 푸터 ───────── */}
      <footer className="linen bg-[var(--paper)] border-t border-[var(--line)] pt-14 pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 items-center text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            {SITE.logo ? (
              <span className="inline-block rounded-[28px] bg-white p-2 ring-1 ring-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SITE.logo} alt={SITE.name} className="h-28 sm:h-32 w-auto object-contain rounded-[22px]" />
              </span>
            ) : (
              <span className="font-batang text-2xl font-bold text-[var(--forest)]">{SITE.name}</span>
            )}
          </div>
          <div>
            <p className="font-batang text-lg font-bold text-[var(--forest)]">더 특별한 꽃, 마지막 5%의 정성</p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-x-1 gap-y-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => go(catId(c.key))}
                  className="min-h-11 px-2 text-sm text-[var(--muted)] hover:text-[var(--forest)]"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-xs text-[var(--muted)]">전화 주문 · 상담</p>
            <a
              href={tel}
              className="font-batang inline-flex items-center gap-2 mt-1 min-h-11 text-[28px] font-bold text-[var(--forest)] tabular-nums hover:text-[var(--ribbon)] transition"
            >
              <PhoneIcon className="w-6 h-6" />
              {SITE.phone}
            </a>
            <p className="mt-1 text-xs text-[var(--muted)] break-keep">전국 당일배송 · 도서·산간 일부 지역 제외</p>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-[var(--muted)]/70">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </footer>

      {/* ───────── 상품 안내 시트 → 전화 연결 ───────── */}
      {notice && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6 bg-[#1f2a1c]/55 backdrop-blur-[2px] anim-fade"
          onClick={() => setNotice(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            className="anim-sheet relative w-full sm:max-w-md bg-[var(--paper)] rounded-t-[32px] sm:rounded-[32px] px-6 pt-4 pb-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sm:hidden block mx-auto w-10 h-1 rounded-full bg-[var(--line)]" aria-hidden="true" />
            <div className="mt-4 sm:mt-0 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/${notice.folder}/${notice.name}.jpg`}
                alt=""
                className="w-20 h-20 shrink-0 rounded-full object-cover ring-4 ring-[var(--sage-soft)]"
              />
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.2em] font-bold text-[var(--kraft-deep)]">주문 전 안내</p>
                <h3 id="notice-title" className="font-batang mt-1 text-xl font-bold text-[var(--forest)] break-keep">
                  {notice.name}
                </h3>
                <p className="text-sm text-[var(--muted)] tabular-nums">{won(notice.price)}~</p>
              </div>
            </div>
            <p className="mt-5 rounded-2xl bg-[var(--sage-soft)]/70 px-4 py-4 text-[15px] leading-relaxed text-[var(--ink)] break-keep">
              {SITE.priceNotice}
            </p>
            <p className="mt-3 text-center text-sm text-[var(--muted)]">
              대표번호 <span className="font-bold text-[var(--forest)] tabular-nums">{SITE.phone}</span>
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setNotice(null)}
                className="min-h-12 rounded-full border border-[var(--line)] bg-white text-[15px] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                취소
              </button>
              <a
                href={`tel:${SITE.phoneHref}`}
                onClick={() => setNotice(null)}
                autoFocus
                className="min-h-12 rounded-full flex items-center justify-center gap-1.5 bg-[var(--forest)] text-[var(--cream)] text-[15px] font-bold hover:bg-[var(--forest-2)]"
              >
                <PhoneIcon className="w-4 h-4" />
                전화 연결
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
