export function JobizzHeroBanner() {
  return (
    <section
      aria-label="How Jobizz works — from field to hired"
      className="border-y border-slate-100 bg-white py-4 md:py-6"
    >
      <div className="container-page">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          {/* Slim strip — flat SVG + CSS keyframes, no images/video */}
          <div className="relative aspect-[1200/160] w-full overflow-hidden">
            <svg
              viewBox="0 0 1200 160"
              role="img"
              aria-label="Animated story: runner enters Jobizz building and exits polished toward city with hired badge"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Sky */}
              <rect x="0" y="0" width="1200" height="96" fill="#f8fafc" />
              {/* Sun — smaller for strip */}
              <g className="jb-sun">
                <circle cx="1020" cy="28" r="16" fill="#fef3c7" />
                <circle cx="1020" cy="28" r="10" fill="#fde68a" />
              </g>
              {/* City skyline — simplified, lower */}
              <g fill="#e2e8f0" opacity="0.9">
                <rect x="860" y="62" width="14" height="36" rx="1.5" />
                <rect x="878" y="54" width="16" height="44" rx="1.5" />
                <rect x="898" y="68" width="12" height="30" rx="1.5" />
                <rect x="914" y="60" width="15" height="38" rx="1.5" />
                <rect x="933" y="66" width="10" height="32" rx="1.5" />
                <rect x="947" y="58" width="18" height="40" rx="1.5" />
                <rect x="969" y="70" width="12" height="28" rx="1.5" />
                <rect x="985" y="62" width="14" height="36" rx="1.5" />
                <rect x="1003" y="68" width="14" height="30" rx="1.5" />
              </g>
              {/* Green field + rolling hills — compact */}
              <rect x="0" y="96" width="1200" height="64" fill="#dcfce7" />
              <ellipse cx="260" cy="108" rx="260" ry="30" fill="#bbf7d0" />
              <ellipse cx="770" cy="112" rx="320" ry="32" fill="#a7f3d0" />
              <g fill="#86efac" opacity="0.7">
                <path d="M120 132 l4 -8 l4 8 z" />
                <path d="M520 134 l4 -7 l4 7 z" />
                <path d="M860 136 l3 -6 l3 6 z" />
              </g>
              <rect x="0" y="142" width="1200" height="18" fill="#86efac" opacity="0.35" />

              {/* Building — scaled down, still flat block */}
              <g>
                <rect x="640" y="52" width="84" height="68" rx="6" fill="#ffffff" stroke="#2f5de6" strokeWidth="2" />
                <rect x="670" y="82" width="26" height="38" rx="2.5" fill="#1a2f73" />
                <rect x="673" y="85" width="20" height="32" rx="1.5" fill="#0f172a" opacity="0.9" />
                <circle cx="690" cy="102" r="1.8" fill="#eef4ff" />
                <g textAnchor="middle">
                  <rect x="650" y="60" width="64" height="14" rx="4" fill="#eef4ff" />
                  <text x="682" y="70" textAnchor="middle" fontFamily="DM Sans, ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#2f5de6" letterSpacing="0.04em">
                    Jobizz
                  </text>
                </g>
                <rect x="668" y="76" width="32" height="2.5" rx="1" fill="#d9e6ff" opacity="0.6" />
              </g>

              {/* Act 1 character — casual, scaled 0.78 for strip */}
              <g className="jb-act1">
                <g className="jb-bob1" transform="scale(0.78)">
                  <ellipse cx="0" cy="28" rx="14" ry="3" fill="#000" opacity="0.08" />
                  <g>
                    <rect className="jb-leg1" x="-7" y="12" width="5" height="14" rx="2.5" fill="#1a2f73" />
                    <rect className="jb-leg2" x="2" y="12" width="5" height="14" rx="2.5" fill="#2449c4" />
                  </g>
                  <rect x="-9" y="-6" width="18" height="18" rx="5" fill="#3b6cf6" />
                  <rect x="-5" y="-1" width="10" height="6" rx="2" fill="#eef4ff" opacity="0.9" />
                  <circle cx="0" cy="-14" r="9" fill="#fecbb0" />
                  <circle cx="0" cy="-14" r="9" fill="none" stroke="#0f172a" strokeWidth="1.2" opacity="0.08" />
                  <path d="M-7 -20 Q0 -26 7 -20 Q3 -16 -3 -18 Z" fill="#0f172a" />
                  <rect className="jb-arm1" x="-11" y="-2" width="6" height="10" rx="3" fill="#fecbb0" />
                  <rect className="jb-arm2" x="5" y="-2" width="6" height="10" rx="3" fill="#fecbb0" />
                </g>
              </g>

              {/* Act 3 character — polished, scaled 0.78 */}
              <g className="jb-act3">
                <g className="jb-bob3" transform="scale(0.78)">
                  <ellipse cx="0" cy="28" rx="14" ry="3" fill="#000" opacity="0.08" />
                  <g>
                    <rect className="jb-leg3a" x="-7" y="10" width="5.5" height="16" rx="2.5" fill="#0f172a" />
                    <rect className="jb-leg3b" x="2" y="10" width="5.5" height="16" rx="2.5" fill="#1e293b" />
                  </g>
                  <rect x="-10" y="-8" width="20" height="20" rx="4" fill="#1a2f73" />
                  <path d="M-2 -8 L-6 2 L0 6 Z" fill="#eef4ff" opacity="0.95" />
                  <path d="M2 -8 L6 2 L0 6 Z" fill="#eef4ff" opacity="0.95" />
                  <rect x="-4" y="-4" width="8" height="12" rx="2" fill="#ffffff" />
                  <rect x="-1.5" y="-2" width="3" height="9" rx="1.2" fill="#2f5de6" />
                  <circle cx="0" cy="-16" r="9" fill="#fecbb0" />
                  <path d="M-6 -22 Q0 -28 6 -22 Q2 -18 -2 -20 Z" fill="#0f172a" />
                  <path d="M-2 -12 Q0 -10 2 -12" fill="none" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                  <rect x="-12" y="-4" width="6" height="12" rx="3" fill="#1a2f73" />
                  <rect x="6" y="-4" width="6" height="12" rx="3" fill="#1a2f73" />
                </g>
              </g>

              {/* Hired badge — smaller for strip */}
              <g className="jb-badge">
                <circle cx="0" cy="0" r="13" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                <path d="M-4.5 0.8 L-1.2 4 L5 -3" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <g textAnchor="middle">
                  <text y="22" textAnchor="middle" fontFamily="DM Sans, ui-sans-serif" fontSize="7" fontWeight="700" fill="#065f46" letterSpacing="0.06em">
                    HIRED
                  </text>
                </g>
              </g>
              <g className="jb-sparkles" fill="#f59e0b" opacity="0">
                <circle cx="0" cy="0" r="1.4" />
                <circle cx="0" cy="0" r="1" />
                <circle cx="0" cy="0" r="1.4" />
              </g>
            </svg>

            {/* Caption for accessibility / SEO — visually hidden but accessible */}
            <p className="sr-only">Green field runner enters Jobizz building and exits polished toward city skyline with hired badge — loops every 8 seconds.</p>
          </div>

          {/* Sub-caption — flat, themeable, not part of SVG */}
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 text-center text-xs text-slate-500">
            <span className="hidden sm:inline h-px w-6 bg-slate-200" aria-hidden />
            <span>
              From first run to <span className="font-semibold text-brand-700">hired</span> — Jobizz walks with you
            </span>
            <span className="hidden sm:inline h-px w-6 bg-slate-200" aria-hidden />
          </div>
        </div>
      </div>

      <style>{`
        /* Loop ~8s, seamless */
        .jb-act1 { animation: jb-act1-move 8s linear infinite; }
        .jb-act3 { animation: jb-act3-move 8s linear infinite; }
        .jb-badge { animation: jb-badge-pop 8s linear infinite; transform-origin: 50% 50%; }
        .jb-sparkles { animation: jb-sparkles 8s linear infinite; }
        .jb-bob1 { animation: jb-bob 0.36s ease-in-out infinite; }
        .jb-bob3 { animation: jb-bob 0.42s ease-in-out infinite; }
        .jb-leg1 { animation: jb-legA 0.36s ease-in-out infinite; transform-origin: 50% 0%; }
        .jb-leg2 { animation: jb-legB 0.36s ease-in-out infinite; transform-origin: 50% 0%; }
        .jb-leg3a { animation: jb-legA 0.42s ease-in-out infinite; transform-origin: 50% 0%; }
        .jb-leg3b { animation: jb-legB 0.42s ease-in-out infinite; transform-origin: 50% 0%; }
        .jb-arm1 { animation: jb-armA 0.36s ease-in-out infinite; transform-origin: 50% 0%; }
        .jb-arm2 { animation: jb-armB 0.36s ease-in-out infinite; transform-origin: 50% 0%; }
        .jb-sun { animation: jb-sun 8s ease-in-out infinite; }

        /* Act 1: run left→right across field, then hide at door */
        @keyframes jb-act1-move {
          0%   { transform: translate(30px, 114px); opacity: 1; }
          32%  { transform: translate(560px, 114px); opacity: 1; }
          36%  { transform: translate(610px, 115px) scale(0.92); opacity: 1; }
          40%  { transform: translate(628px, 116px) scale(0.35); opacity: 0; }
          40.1%{ transform: translate(30px, 114px) scale(0.35); opacity: 0; }
          42%  { transform: translate(30px, 114px) scale(1); opacity: 0; }
          100% { transform: translate(30px, 114px); opacity: 0; }
        }
        /* Act 3: exit polished from other side of building, stride to city */
        @keyframes jb-act3-move {
          0%   { transform: translate(720px, 114px); opacity: 0; }
          40%  { transform: translate(720px, 114px); opacity: 0; }
          42%  { transform: translate(730px, 114px) scale(0.4); opacity: 0; }
          46%  { transform: translate(750px, 114px) scale(1); opacity: 1; }
          82%  { transform: translate(1035px, 114px); opacity: 1; }
          88%  { transform: translate(1070px, 114px); opacity: 1; }
          92%  { transform: translate(1090px, 114px); opacity: 0; }
          100% { transform: translate(1090px, 114px); opacity: 0; }
        }
        @keyframes jb-badge-pop {
          0%, 62% { transform: translate(1005px, 92px) scale(0); opacity: 0; }
          68% { transform: translate(1005px, 84px) scale(1.08); opacity: 1; }
          74% { transform: translate(1005px, 87px) scale(1); opacity: 1; }
          86% { transform: translate(1005px, 87px) scale(1); opacity: 1; }
          92% { transform: translate(1005px, 87px) scale(0.9); opacity: 0; }
          100%{ transform: translate(1005px, 92px) scale(0); opacity: 0; }
        }
        @keyframes jb-sparkles {
          0%, 66% { opacity: 0; transform: translate(1005px, 78px); }
          70% { opacity: 1; transform: translate(1020px, 75px); }
          78% { opacity: 0.9; transform: translate(990px, 72px); }
          86%,100% { opacity: 0; transform: translate(1005px, 78px); }
        }
        @keyframes jb-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2.5px); }
        }
        @keyframes jb-legA {
          0%,100% { transform: scaleY(1) rotate(-14deg); }
          50% { transform: scaleY(0.9) rotate(14deg); }
        }
        @keyframes jb-legB {
          0%,100% { transform: scaleY(0.9) rotate(14deg); }
          50% { transform: scaleY(1) rotate(-14deg); }
        }
        @keyframes jb-armA {
          0%,100% { transform: rotate(-18deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes jb-armB {
          0%,100% { transform: rotate(18deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes jb-sun {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(1.2px); }
        }

        /* Reduced motion: static Act 3 end-state, no loop */
        @media (prefers-reduced-motion: reduce) {
          .jb-act1, .jb-act3, .jb-badge, .jb-sparkles, .jb-bob1, .jb-bob3,
          .jb-leg1, .jb-leg2, .jb-leg3a, .jb-leg3b, .jb-arm1, .jb-arm2, .jb-sun {
            animation: none !important;
          }
          .jb-act1 { transform: translate(628px, 116px) scale(0); opacity: 0; }
          .jb-act3 { transform: translate(1035px, 114px); opacity: 1; }
          .jb-act3 .jb-bob3 { transform: translateY(0); }
          .jb-badge { transform: translate(1005px, 87px) scale(1); opacity: 1; }
          .jb-sparkles { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
