// Original SVG art: avatars, logo, emoticons, the pier photo. No external images.
(() => {
  const AV = {
    mira: { bg: ["#fbd3e6", "#f48fb1"], skin: "#f6d2b8", hair: "#3b2418", style: "long", top: "#9ad0f5", acc: "#ff6fae" },
    jules: { bg: ["#c9ecff", "#64b5f6"], skin: "#efc6a4", hair: "#141414", style: "bob", top: "#222", acc: "#ff4fa3" },
    theo: { bg: ["#dcf0c2", "#8bc34a"], skin: "#e9b98f", hair: "#5a3a1e", style: "beanie", top: "#c62828", acc: "#757575" },
    dani: { bg: ["#ecd2f5", "#ba68c8"], skin: "#f3cfb3", hair: "#e7c35a", style: "pigtails", top: "#7b1fa2", acc: "#ffd54f" },
    mom: { bg: ["#ffe7c4", "#ffb74d"], skin: "#f1c9a8", hair: "#6d4c41", style: "short", top: "#43a047", acc: "#fff" },
  };

  const hair = (h, style, s) => ({
    long: `<path d="M22 46c0-20 12-31 28-31s28 11 28 31v42H66V52H34v36H22z" fill="${h}"/>`,
    bob: `<path d="M24 50c0-21 11-33 26-33s26 12 26 33v16H64V48H36v18H24z" fill="${h}"/>`,
    beanie: `<path d="M27 44c0-17 10-27 23-27s23 10 23 27z" fill="${s}"/><rect x="25" y="40" width="50" height="8" rx="3" fill="${s}" opacity=".85"/>`,
    pigtails: `<path d="M27 48c0-19 10-30 23-30s23 11 23 30v4H27z" fill="${h}"/><circle cx="21" cy="56" r="8" fill="${h}"/><circle cx="79" cy="56" r="8" fill="${h}"/>`,
    short: `<path d="M27 50c0-21 10-32 23-32s23 11 23 32c-4-9-10-14-23-14s-19 5-23 14z" fill="${h}"/>`,
  }[style]);

  const avatar = (name) => {
    if (name === "lake") return lake();
    if (name === "support") return `<svg viewBox="0 0 100 100" role="img" aria-label="FlutterNet support"><rect width="100" height="100" fill="#dbeafe"/><g transform="translate(18 14) scale(.64)">${logoInner()}</g></svg>`;
    const a = AV[name] || AV.mira;
    const id = "g" + name;
    return `<svg viewBox="0 0 100 100" role="img" aria-label="${name} display picture" class="av">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a.bg[0]}"/><stop offset="1" stop-color="${a.bg[1]}"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id})"/>
      <circle cx="82" cy="18" r="6" fill="#fff" opacity=".5"/><circle cx="14" cy="80" r="4" fill="#fff" opacity=".4"/>
      ${a.style === "long" || a.style === "bob" ? hair(a.hair, a.style, a.acc) : ""}
      <path d="M18 100c2-18 15-26 32-26s30 8 32 26z" fill="${a.top}"/>
      <rect x="44" y="62" width="12" height="14" fill="${a.skin}"/>
      <ellipse cx="50" cy="48" rx="19" ry="21" fill="${a.skin}"/>
      ${a.style === "bob" ? `<path d="M31 44c4-12 10-17 19-17 4 0 7 1 10 3-6 1-14 6-17 14z" fill="${a.hair}"/><rect x="58" y="30" width="5" height="22" rx="2" fill="${a.acc}"/>` : ""}
      ${a.style === "long" ? `<path d="M31 46c3-14 11-20 22-20 7 0 12 3 15 8-10-2-24 2-37 12z" fill="${a.hair}"/>` : ""}
      ${a.style !== "long" && a.style !== "bob" ? hair(a.hair, a.style, a.acc) : ""}
      <g class="eyes"><circle cx="43" cy="50" r="2.4" fill="#1d1d1d"/><circle cx="57" cy="50" r="2.4" fill="#1d1d1d"/></g>
      <path class="mouth" d="M44 59q6 5 12 0" stroke="#a0524b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="38" cy="56" rx="3.5" ry="2" fill="#ff8a95" opacity=".45"/><ellipse cx="62" cy="56" rx="3.5" ry="2" fill="#ff8a95" opacity=".45"/>
    </svg>`;
  };

  // lakekeeper: dark water, and something just under the surface
  const lake = () => `<svg viewBox="0 0 100 100" role="img" aria-label="lakekeeper display picture" class="av lake">
    <defs><linearGradient id="lk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d5466"/><stop offset=".45" stop-color="#1b2a35"/><stop offset="1" stop-color="#05090c"/></linearGradient>
    <radialGradient id="lkf" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#9fb4c2" stop-opacity=".35"/><stop offset="1" stop-color="#9fb4c2" stop-opacity="0"/></radialGradient></defs>
    <rect width="100" height="100" fill="url(#lk)"/>
    <g opacity=".5" stroke="#8fa9ba" stroke-width=".8" fill="none"><path d="M8 38q10-3 20 0t20 0 20 0 24 0"/><path d="M4 52q12-3 24 0t24 0 24 0 24 0"/><path d="M10 68q10-3 20 0t20 0 20 0 22 0"/></g>
    <ellipse cx="50" cy="60" rx="20" ry="24" fill="url(#lkf)"/>
    <g class="eyes" opacity=".55"><ellipse cx="43" cy="58" rx="2" ry="1.2" fill="#d9e6ee"/><ellipse cx="57" cy="58" rx="2" ry="1.2" fill="#d9e6ee"/></g>
  </svg>`;

  // FlutterNet dragonfly, an original mark
  const logoInner = () => `
    <ellipse cx="34" cy="40" rx="30" ry="9" transform="rotate(-18 34 40)" fill="#7fd6e8" opacity=".9"/>
    <ellipse cx="34" cy="58" rx="26" ry="8" transform="rotate(16 34 58)" fill="#b39ddb" opacity=".9"/>
    <ellipse cx="86" cy="40" rx="30" ry="9" transform="rotate(18 86 40)" fill="#80e0b0" opacity=".9"/>
    <ellipse cx="86" cy="58" rx="26" ry="8" transform="rotate(-16 86 58)" fill="#f8a5c2" opacity=".9"/>
    <rect x="55" y="34" width="10" height="68" rx="5" fill="#2b5ea7"/>
    <circle cx="60" cy="28" r="9" fill="#2b5ea7"/><circle cx="56" cy="26" r="2.4" fill="#fff"/><circle cx="64" cy="26" r="2.4" fill="#fff"/>`;
  const logo = (size = 40) => `<svg width="${size}" height="${size}" viewBox="0 0 120 110" aria-hidden="true">${logoInner()}</svg>`;

  const smile = (flat) => `<svg viewBox="0 0 20 20" class="emo" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#ffd93b" stroke="#c99a00"/><circle cx="7" cy="8" r="1.3" fill="#3a2a00"/><circle cx="13" cy="8" r="1.3" fill="#3a2a00"/>${flat ? '<path d="M6.5 13h7" stroke="#3a2a00" stroke-width="1.3" stroke-linecap="round"/>' : '<path d="M6 12q4 3.5 8 0" stroke="#3a2a00" stroke-width="1.3" fill="none" stroke-linecap="round"/>'}</svg>`;

  // the pier photo, with a date stamp. There are two girls on the railing... and a third shape in the reflection.
  const pier = () => `<svg viewBox="0 0 320 220" role="img" aria-label="photo: two girls sitting on a wooden pier at sunset" class="photo">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a6fa5"/><stop offset=".55" stop-color="#f4a576"/><stop offset="1" stop-color="#ffd59a"/></linearGradient>
      <linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6d6b"/><stop offset="1" stop-color="#1e2c3a"/></linearGradient>
    </defs>
    <rect width="320" height="120" fill="url(#sky)"/>
    <circle cx="232" cy="112" r="18" fill="#ffe7b0" opacity=".9"/>
    <path d="M0 112q40-14 90-6t110-4 120 6v12H0z" fill="#3c4a3a"/>
    <rect y="120" width="320" height="100" fill="url(#wt)"/>
    <g stroke="#ffe7b0" stroke-opacity=".35"><path d="M200 132h60M210 142h44M220 152h28"/></g>
    <rect x="30" y="118" width="190" height="10" fill="#5a3d26"/><rect x="30" y="98" width="190" height="4" fill="#6e4b2f"/>
    <g fill="#4a321f"><rect x="40" y="100" width="4" height="40"/><rect x="100" y="100" width="4" height="40"/><rect x="160" y="100" width="4" height="40"/><rect x="214" y="100" width="4" height="40"/></g>
    <g fill="#1d1a22"><circle cx="118" cy="80" r="8"/><path d="M106 118q2-28 12-30t12 30z"/><circle cx="146" cy="81" r="8"/><path d="M134 118q2-28 12-30t12 30z"/></g>
    <g fill="#1d1a22" opacity=".28"><path d="M106 132q2 26 12 28t12-28z"/><path d="M134 132q2 26 12 28t12-28z"/><path d="M170 134q3 22 11 24t10-24z" opacity=".9"/><circle cx="181" cy="166" r="7" opacity=".9"/></g>
    <text x="64" y="112" font-family="Georgia,serif" font-size="7" fill="#d7b48a" opacity=".85">M + J</text>
    <text x="246" y="208" font-family="'Courier New',monospace" font-size="13" font-weight="bold" fill="#ff8c2e" opacity=".9">08 20 '05</text>
  </svg>`;

  window.Art = { avatar, logo, smile, pier };
})();
