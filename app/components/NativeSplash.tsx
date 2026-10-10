"use client";

/* Animated launch intro (native app only). Frame 0 matches the static native
   splash exactly, then the D "dissolves" into its outline, redraws itself and
   re-forms into the app icon; the dots pop back in and a light sweep passes. */
const BODY = "M 597.903 353.409 C 602.534 352.941 608.307 352.992 613.018 352.982 C 635.133 352.937 657.25 353.009 679.366 353.012 L 837.773 352.996 L 1050.15 352.966 C 1130.68 352.952 1201 348.309 1279.86 368.032 C 1363.87 389.402 1441.53 430.632 1506.29 488.256 C 1639.34 604.764 1713.09 775.452 1724.17 950.398 C 1735.95 1136.29 1685.05 1313.16 1561.13 1454.47 C 1465.63 1563.38 1330.49 1636.09 1185.15 1644.97 C 1154.82 1646.82 1116.66 1645.82 1085.82 1645.79 L 917.934 1645.78 L 808.969 1645.84 C 762.964 1645.85 726.695 1651.52 689.624 1618.53 C 668.663 1599.81 655.984 1573.55 654.367 1545.49 C 652.805 1516.23 663.783 1490.5 682.608 1468.48 C 721.182 1423.37 782.57 1433.65 836.507 1433.6 L 1011.17 1433.66 C 1036.44 1433.68 1061.72 1433.72 1086.99 1433.68 C 1319.34 1433.32 1491.47 1211.33 1479.26 988.106 C 1478.71 971.545 1477.17 955.031 1474.65 938.653 C 1448.19 764.063 1313.33 616.466 1132.05 600.42 C 1102.86 597.836 1071.18 599.105 1041.72 599.104 L 889.756 599.108 L 771.223 599.072 C 755.797 599.063 722.195 598.195 708.827 600.319 C 689.457 603.226 672.153 614.016 661.018 630.13 C 650.038 645.752 645.762 665.116 649.143 683.909 C 654.046 709.101 672.187 729.672 696.567 737.688 C 714.243 743.497 765.688 741.133 787.654 741.117 L 1003.71 741.203 C 1037.35 741.169 1104.32 739.163 1134.71 744.796 C 1167.14 750.73 1197.9 763.627 1224.86 782.598 C 1414.6 914.533 1343.92 1253.83 1110.01 1285.41 C 1093.58 1287.63 1074.7 1286.96 1058.01 1286.96 L 990.341 1286.93 L 817.942 1286.88 C 790.452 1286.88 754.692 1285.47 728.233 1289.95 C 663.45 1300.94 602.972 1342.71 565.9 1396.52 C 560.021 1404.92 554.646 1413.66 549.803 1422.7 C 536.223 1448.08 525.081 1468.66 493.567 1473.44 C 477.643 1476.02 461.365 1471.85 448.642 1461.93 C 420.838 1439.86 427.141 1400.66 427.147 1368.73 L 427.159 1264.5 L 427.171 930.193 L 427.169 652.632 L 427.105 569.181 C 427.098 551.88 426.432 530.197 428.791 513.475 C 433.592 478.545 448.137 445.675 470.761 418.632 C 503.738 379.142 547.181 358.183 597.903 353.409 z";
const DOT1 = "M 728.002 845.965 C 770.797 844.782 806.534 878.341 808.04 921.126 C 809.546 963.911 776.257 999.901 733.484 1001.73 C 690.253 1003.58 653.793 969.853 652.271 926.609 C 650.749 883.365 684.747 847.161 728.002 845.965 z";
const DOT2 = "M 726.698 1065.83 C 769.616 1064.66 805.328 1098.56 806.379 1141.48 C 807.43 1184.41 773.421 1220.02 730.497 1220.95 C 687.749 1221.87 652.313 1188.03 651.266 1145.28 C 650.219 1102.54 683.956 1067 726.698 1065.83 z";

export default function NativeSplash({ fading }: { fading: boolean }) {
  return (
    <div className={`ds-splash ${fading ? "ds-splash-out" : ""}`} aria-hidden="true">
      <style>{`
        .ds-splash{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#f8fafc;transition:opacity .45s ease}
        .ds-splash-out{opacity:0;pointer-events:none}
        .ds-stage{width:24.6vh;max-width:72vw;aspect-ratio:1350/1330;overflow:visible}
        .ds-stage svg{width:100%;height:100%;overflow:visible;display:block}
        .ds-box{transform-box:fill-box;transform-origin:center}
        .ds-wrap{animation:ds-dip 1.55s .3s both}
        .ds-fill{animation:ds-fill 1.55s .3s both}
        .ds-line{fill:none;stroke:url(#dsg);stroke-width:11;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;opacity:0;animation:ds-line 1.55s .3s both}
        .ds-dot1{animation:ds-dot 1.55s .3s both}
        .ds-dot2{animation:ds-dot 1.55s .42s both}
        .ds-shine{animation:ds-shine .75s 1.95s ease-in-out both;opacity:0}
        .ds-word{position:absolute;left:0;right:0;top:calc(50% + 12.3vh + 4.5vh);text-align:center;font-size:30px;font-weight:800;letter-spacing:.5px;color:#0f172a;opacity:0;animation:ds-word .7s 1.7s ease-out both}
        @keyframes ds-dip{0%{transform:scale(1) rotate(0)}22%{transform:scale(.93) rotate(-3deg);animation-timing-function:cubic-bezier(.2,.8,.2,1)}60%{transform:scale(.96) rotate(-1deg);animation-timing-function:cubic-bezier(.34,1.7,.5,1)}100%{transform:scale(1) rotate(0)}}
        @keyframes ds-fill{0%{opacity:1}20%{opacity:0}48%{opacity:0;animation-timing-function:ease-out}78%{opacity:1}100%{opacity:1}}
        @keyframes ds-line{0%{opacity:0;stroke-dashoffset:1}12%{opacity:1;stroke-dashoffset:1}52%{opacity:1;stroke-dashoffset:0}72%{opacity:1;stroke-dashoffset:0}88%{opacity:0;stroke-dashoffset:0}100%{opacity:0;stroke-dashoffset:0}}
        @keyframes ds-dot{0%{transform:scale(1)}16%{transform:scale(0)}58%{transform:scale(0);animation-timing-function:cubic-bezier(.3,1.9,.5,1)}82%{transform:scale(1.18)}100%{transform:scale(1)}}
        @keyframes ds-shine{0%{opacity:0;transform:translateX(-1500px)}15%{opacity:.85}85%{opacity:.85}100%{opacity:0;transform:translateX(1500px)}}
        @keyframes ds-word{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @media (prefers-color-scheme:dark){.ds-splash{background:#0f172a}.ds-word{color:#fff}}
        @media (prefers-reduced-motion:reduce){.ds-wrap,.ds-fill,.ds-line,.ds-dot1,.ds-dot2,.ds-shine{animation:none}.ds-line,.ds-shine{opacity:0}.ds-word{animation:none;opacity:1}}
      `}</style>
      <div className="ds-stage">
        <svg viewBox="400 330 1350 1330" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dsg" gradientUnits="userSpaceOnUse" x1="420.917" y1="1426.96" x2="1534.36" y2="513.348">
		<stop class="stop0" offset="0" stop-opacity="1" stop-color="rgb(0,51,215)"/>
		<stop class="stop1" offset="1" stop-opacity="1" stop-color="rgb(6,120,255)"/>
	</linearGradient>
            <clipPath id="dsc"><path d={BODY} /></clipPath>
            <linearGradient id="dss" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset=".5" stopColor="#fff" stopOpacity=".75" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="ds-box ds-wrap">
            <path className="ds-fill" fill="url(#dsg)" d={BODY} />
            <path className="ds-line" pathLength={1} d={BODY} />
            <g clipPath="url(#dsc)">
              <rect className="ds-shine" x="300" y="330" width="260" height="1330" fill="url(#dss)" transform="skewX(-18)" />
            </g>
          </g>
          <path className="ds-box ds-dot1" fill="#ffffff" d={DOT1} />
          <path className="ds-box ds-dot2" fill="rgb(102,169,253)" d={DOT2} />
        </svg>
      </div>
      <div className="ds-word">دَيني</div>
    </div>
  );
}
