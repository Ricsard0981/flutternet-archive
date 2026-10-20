(async () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  if (Vault.has("closed") || !Vault.has("login")) { location.replace("login.html"); return; }
  const S = await Vault.reopen("login");
  if (!S) { Vault.reset(); location.replace("login.html"); return; }
  const U = { diary: await Vault.reopen("diary"), deleted: await Vault.reopen("deleted"), jules: await Vault.reopen("jules") };

  /* ---------- time helpers ---------- */
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const fill = (s) => String(s).replace("{TODAY}", `${todayISO}T21:47`).replace("{TODAY_DATE}", todayISO).replace("{TODAY_YEAR}", now.getFullYear());
  const dayLabel = (iso) => new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const shortDate = (iso) => new Date(fill(iso)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const hm = (iso) => iso.slice(11, 16);
  const smileys = (t) => esc(t).replace(/:\)|:P|:D/g, (m) => (m === ":)" ? Art.smile() : m));

  /* ---------- people ---------- */
  const people = Object.fromEntries(S.contacts.map((c) => [c.id, c]));
  people.mira = { ...S.me, status: "typing", pm: "", profile: { real: "Mira Vale", age: "15", location: "", about: "", note: "Signed in. Away since 14 June 2006, 21:47." } };
  people.support = { id: "support", name: "flutter_support", color: "#2b5ea7", pm: "Type 'help' if you get stuck", status: "online", avatar: "support",
    profile: { real: "FlutterNet automated support", age: "", location: "", about: "I can point you in the right direction.", note: "" } };
  people.deleted = { id: "deleted", name: "lakekeeper (deleted)", color: "#37474f", pm: "Restored from deleted conversations", status: "away", avatar: "lake", profile: people.lakekeeper.profile };

  const state = { who: "jules", view: "chat", supportLog: [], selfLog: [], asks: {}, read: (() => { try { return JSON.parse(localStorage.getItem("flutternet.read")) || []; } catch { return []; } })() };
  const saveRead = () => { try { localStorage.setItem("flutternet.read", JSON.stringify(state.read)); } catch {} };

  /* ---------- sound (off by default, synthesised) ---------- */
  let sound = false, ac = null;
  const beep = (notes, type = "sine", vol = 0.08) => {
    if (!sound) return;
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    let t = ac.currentTime;
    notes.forEach(([f, d]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d); t += d * 0.8; });
  };
  const chime = () => beep([[880, 0.18], [1320, 0.32]]);
  const buzz = () => beep([[90, 0.12], [70, 0.12], [90, 0.12], [70, 0.2]], "square", 0.05);
  $("#snd").addEventListener("click", () => { sound = !sound; $("#snd").textContent = sound ? "🔊" : "🔇"; $("#snd").setAttribute("aria-label", sound ? "Sound on" : "Sound off"); if (sound) chime(); });

  /* ---------- chrome ---------- */
  $("#ico").innerHTML = Art.logo(18); $("#brandlogo").innerHTML = Art.logo(30);
  $("#task").innerHTML = `${Art.logo(16)} Flutter Messenger - ${esc(S.me.name)}`;
  $("#me").innerHTML = `<div class="dp">${Art.avatar("mira")}</div><div><div class="n">${esc(S.me.name)}</div><div class="st">● Away since 14 Jun 2006</div><div style="color:#666;font-size:12px">${esc(S.me.pm)}</div></div>`;
  const clock = () => { const d = new Date(); $("#clock").textContent = U.jules ? d.toLocaleTimeString("en-GB") : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
  clock(); setInterval(clock, 1000);
  $("#x").addEventListener("click", () => (location.href = "index.html"));
  $("#start").addEventListener("click", () => { if (confirm("Sign out of Flutter Messenger?\n(Your progress is saved in this browser.)")) location.href = "index.html"; });

  const toast = (who, text) => {
    $("#toast-av").innerHTML = Art.avatar(people[who]?.avatar || who);
    $("#toast-t").innerHTML = `<b>${esc(people[who]?.name || who)}</b><br>${esc(text)}`;
    $("#toast").classList.add("show"); chime();
    setTimeout(() => $("#toast").classList.remove("show"), 5200);
  };
  const shake = () => { if (reduced) return; const w = $("#msgr"); w.classList.remove("shake"); void w.offsetWidth; w.classList.add("shake"); buzz(); };

  /* ---------- contact list ---------- */
  const contactBtn = (id) => {
    const p = people[id];
    const pm = id === "mira" ? "is typing…" : p.pm;
    return `<button class="contact${state.who === id && state.view !== "space" && state.view !== "inbox" ? " sel" : ""}" data-who="${id}"><span class="dp">${Art.avatar(p.avatar)}</span><span><span class="n" style="color:${p.color || "#222"}"><i class="${p.status}"></i>${esc(p.name)}</span><span class="pm">${esc(pm || " ")}</span></span></button>`;
  };
  const renderList = () => {
    const online = [...(U.jules ? ["mira"] : []), "support"];
    const groups = [["Online", online], ["Away", ["lakekeeper"]], ["Offline", ["jules", "theo", "dani", "mom"]]];
    if (U.deleted) groups.push(["Deleted conversations", ["deleted"]]);
    $("#clist").innerHTML = groups.map(([g, ids]) => `<div class="group">▾ ${g} (${ids.length})</div>${ids.map(contactBtn).join("")}`).join("");
    $$(".contact", $("#clist")).forEach((b) => b.addEventListener("click", () => { state.who = b.dataset.who; state.view = state.view === "profile" ? "profile" : "chat"; render(); $("#cols").dataset.show = "chat"; }));
  };

  /* ---------- search: also the way into deleted conversations ---------- */
  $("#q").addEventListener("input", () => {
    const q = $("#q").value.trim().toLowerCase();
    $$(".contact", $("#clist")).forEach((b) => (b.style.display = !q || b.textContent.toLowerCase().includes(q) ? "" : "none"));
  });
  $("#search").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = $("#q").value;
    if (!q.trim()) return;
    if (!U.deleted && /\d/.test(q)) {
      const p = await Vault.open("deleted", q);
      if (p) {
        U.deleted = p; $("#q").value = ""; state.who = "deleted"; state.view = "chat";
        render(); $("#cols").dataset.show = "chat";
        toast("lakekeeper", "1 deleted conversation was restored.");
        document.body.classList.add("uneasy");
        return;
      }
    }
    if (!$$(".contact", $("#clist")).some((b) => b.style.display !== "none")) { $("#q").value = ""; $("#q").placeholder = `No results for "${q}"`; $$(".contact").forEach((b) => (b.style.display = "")); }
  });

  /* ---------- views ---------- */
  const bubble = ([ts, from, text], i) => {
    const iso = fill(ts);
    const mine = from === "mira";
    const late = iso.slice(0, 4) > "2006" && mine;
    return `<div class="msg${mine ? " mine" : ""}${late ? " late" : ""}"><div class="bubble">${smileys(text)}</div><div class="meta" data-t="${iso}">${esc(people[from]?.name || from)} · ${late ? shortDate(iso) + " " : ""}${hm(iso)}</div></div>`;
  };
  const chatHTML = (log) => {
    let out = "", day = "";
    log.forEach((m, i) => { const d = fill(m[0]).slice(0, 10); if (d !== day) { day = d; out += `<div class="day">${dayLabel(d)}</div>`; } out += bubble(m, i); });
    return out;
  };

  const views = {
    chat() {
      const who = state.who;
      if (who === "support") return `<div class="sys">flutter_support is an automated assistant.</div>${chatHTML([["2013-10-30T09:00", "support", "Hi! I'm the FlutterNet support assistant. Type help and I'll point you in the right direction."], ...state.supportLog])}`;
      if (who === "mira") return `<div class="sys">You are talking to yourself. Or you are talking to her.</div>${chatHTML([...U.jules.self, ...state.selfLog])}<div class="typing">~*mira*~ is typing…</div>`;
      if (who === "deleted") return `<div class="sys">Restored conversation. Every message was sent at 21:47.</div>${chatHTML(U.deleted.chat)}`;
      if (who === "lakekeeper") return `<div class="sys">This conversation history was deleted on 12 June 2006.</div>${U.deleted ? "" : '<div class="sys" style="font-size:11px">Deleted conversations can sometimes be found again by searching.</div>'}`;
      return chatHTML(S.chats[who] || []) || `<div class="sys">No conversation history.</div>`;
    },
    profile() {
      const p = people[state.who], f = p.profile || {};
      const row = (k, v) => `<dt>${k}</dt><dd>${v ? esc(v) : "<span style='color:#aaa'>-</span>"}</dd>`;
      return `<div class="card"><div class="dp">${Art.avatar(p.avatar)}</div><div><h3 style="margin:0 0 6px;color:${p.color}">${esc(p.name)}</h3><p style="margin:0 0 10px;color:#666">${esc(p.pm || "")}</p><dl>${row("Name", f.real)}${row("Age", f.age)}${row("Location", f.location)}${row("About", f.about)}${row("Account", f.note)}</dl></div></div>`;
    },
    space() {
      const post = (p) => {
        if (!p.locked) return `<article class="post"><h3>${esc(p.title)}</h3><div class="d">${shortDate(p.date)} · mood: ${esc(p.mood)}</div><p>${smileys(p.body)}</p></article>`;
        if (U.diary) return `<article class="post"><h3>${esc(p.title)} <small style="color:#999;font-weight:normal">(private)</small></h3><div class="d">${shortDate(p.date)}</div>${U.diary.post.entries.map(([d, t]) => `<p><b>${esc(d)}.</b> ${esc(t)}</p>`).join("")}</article>`;
        return `<article class="post"><h3>${esc(p.title)} 🔒</h3><div class="d">${shortDate(p.date)}</div><form class="lockbox" id="diaryform"><span>This post is private. Password hint: <i>${esc(p.hint)}</i></span><input class="field" id="dpw" aria-label="Post password" autocomplete="off"><button class="xbtn">Unlock</button><div class="err" id="derr"></div></form></article>`;
      };
      return `<h2 style="margin:0 0 4px;font:bold 22px 'Trebuchet MS';color:#c2185b">~*mira*~'s Space</h2><p style="margin:0 0 6px;color:#888">welcome 2 my corner of the internet ♥</p>${[...S.posts].reverse().map(post).join("")}`;
    },
    inbox() {
      const mails = [...(U.jules ? [{ ...U.jules.draft, id: "draft", folder: "Drafts" }] : []), ...[...S.inbox].reverse()];
      if (state.mail) {
        const m = mails.find((x) => x.id === state.mail);
        if (m) return letter(m);
      }
      return `<table class="mail"><tbody>${mails.map((m) => `<tr class="${state.read.includes(m.id) ? "" : "unread"}" data-mail="${m.id}" tabindex="0"><td>${m.folder ? `<b style="color:#b00020">[${m.folder}]</b> ` : ""}${esc(m.from)}</td><td>${esc(m.subject)}</td><td>${shortDate(m.date)}</td></tr>`).join("")}</tbody></table>`;
    },
  };

  const letter = (m) => {
    let extra = "";
    if (m.photo) extra += `<div>${Art.pier()}</div>`;
    if (m.table) extra += `<table><thead><tr><th>Year</th><th>Message sent to</th><th>Sign-in location (encoded)</th></tr></thead><tbody>${S.activity.map((a) => `<tr><td>${esc(fill(a.year))}</td><td>${esc(a.sent)}</td><td><code>${esc(a.location)}</code></td></tr>`).join("")}</tbody></table>`;
    if (m.gate && !U.jules) extra += `<form class="lockbox" id="gate"><span>Who has been signing in as you?</span><input class="field" id="gpw" aria-label="Who has been signing in" autocomplete="off"><button class="xbtn">Report</button><div class="err" id="gerr"></div></form>`;
    if (m.gate && U.jules) extra += `<p style="color:#2e7d32">Thank you. This report was filed. A draft was found in your account.</p>`;
    return `<p><a href="#" id="back">← Inbox</a></p><div class="letter"><h3>${esc(m.subject)}</h3><div class="from">From: ${esc(m.from)} · ${shortDate(m.date)}</div><pre>${esc(fill(m.body))}</pre>${extra}</div>`;
  };

  const head = () => {
    const self = state.view === "space" || state.view === "inbox";
    const p = self ? { ...S.me, color: "#c2185b" } : people[state.who];
    const st = self ? "Away" : p.status === "typing" ? "Online" : p.status[0].toUpperCase() + p.status.slice(1);
    $("#head").innerHTML = `<div class="dp">${Art.avatar(p.avatar)}</div><div><h2 style="color:${p.color}">${esc(p.name)}</h2><div class="sub">(${st})${p.pm ? " - " + esc(p.pm) : ""}</div></div>`;
  };

  const render = () => {
    renderList(); head();
    $$("#tabs .tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.view === state.view));
    $$(".tool[data-view]").forEach((t) => t.setAttribute("aria-pressed", t.dataset.view === state.view));
    $("#pane").innerHTML = views[state.view]();
    const chatty = state.view === "chat";
    $("#compose").hidden = !chatty || state.who === "deleted";
    if (chatty) $("#pane").scrollTop = $("#pane").scrollHeight; else $("#pane").scrollTop = 0;
    wire();
  };

  /* ---------- per-view wiring ---------- */
  const wire = () => {
    $("#diaryform")?.addEventListener("submit", async (e) => {
      e.preventDefault(); $("#derr").textContent = "Checking…";
      const p = await Vault.open("diary", $("#dpw").value);
      if (!p) { $("#derr").textContent = "Wrong password."; return; }
      U.diary = p; render(); toast("lakekeeper", "is now Away.");
    });
    $$("[data-mail]").forEach((r) => {
      const open = () => { state.mail = r.dataset.mail; if (!state.read.includes(state.mail)) { state.read.push(state.mail); saveRead(); } render(); };
      r.addEventListener("click", open); r.addEventListener("keydown", (e) => e.key === "Enter" && open());
    });
    $("#back")?.addEventListener("click", (e) => { e.preventDefault(); state.mail = null; render(); });
    $("#gate")?.addEventListener("submit", async (e) => {
      e.preventDefault(); $("#gerr").textContent = "Checking…";
      const p = await Vault.open("jules", $("#gpw").value);
      if (!p) { $("#gerr").textContent = "We couldn't match that to any account activity."; return; }
      U.jules = p; state.mail = "draft"; if (!state.read.includes("draft")) state.read.push("draft"); saveRead();
      render();
      setTimeout(() => { renderList(); toast("mira", "has just signed in."); }, 9000);
    });
  };

  $$("[data-view]").forEach((b) => b.addEventListener("click", () => { state.view = b.dataset.view; state.mail = null; render(); $("#cols").dataset.show = "chat"; }));
  $$("[data-mob]").forEach((b) => b.addEventListener("click", () => ($("#cols").dataset.show = b.dataset.mob)));

  /* ---------- compose: support bot, her, everyone else ---------- */
  const stage = () => (!U.diary ? "diary" : !U.deleted ? "deleted" : !U.jules ? "jules" : Vault.has("secret") ? "done" : "secret");
  const hintFor = () => {
    const s = stage();
    const list = s === "diary" ? [S.hints.explore[0], ...S.hints.diary] : S.hints[s];
    const n = state.asks[s] = (state.asks[s] ?? -1) + 1;
    return list[Math.min(n, list.length - 1)];
  };
  const stamp = () => { const d = new Date(); return `${todayISO}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const later = (fn, ms) => setTimeout(() => { fn(); if (state.view === "chat") render(); }, ms);

  $("#compose").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("#say").value.trim();
    if (!text) return;
    $("#say").value = "";
    const who = state.who;
    if (who === "support") {
      state.supportLog.push([stamp(), "mira", text]); render();
      later(() => state.supportLog.push([stamp(), "support", hintFor()]), 900);
    } else if (who === "mira") {
      state.selfLog.push([stamp(), "mira", text]); render();
      const replies = ["…", "wake me up when it's 47.", "watch the clock.", "it's so quiet down here."];
      later(() => state.selfLog.push([stamp(), "mira", replies[state.selfLog.length % replies.length]]), 2600);
    } else {
      $("#pane").insertAdjacentHTML("beforeend", `<div class="msg mine"><div class="bubble">${esc(text)}</div></div><div class="sys">${esc(people[who].name)} is ${people[who].status}. ${who === "lakekeeper" ? "" : "Your message could not be delivered."}</div>`);
      if (who === "lakekeeper") setTimeout(() => { if (state.who === "lakekeeper") $("#pane").insertAdjacentHTML("beforeend", `<div class="msg"><div class="bubble">it is not 21:47.</div><div class="meta">lakekeeper</div></div>`); }, 3000);
      $("#pane").scrollTop = $("#pane").scrollHeight;
    }
  });
  $("#say").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#compose").requestSubmit(); } });

  /* ---------- nudge, and the secret ending ---------- */
  const nudge = async () => {
    shake();
    if (state.view !== "chat") return;
    const who = state.who;
    if (who === "mira" && U.jules) {
      if (new Date().getSeconds() === 47) return ending();
      $("#pane").insertAdjacentHTML("beforeend", `<div class="sys">You have just sent a nudge.</div>`);
      setTimeout(() => { if (state.who === "mira") { $("#pane").insertAdjacentHTML("beforeend", `<div class="msg mine late"><div class="bubble">not yet.</div><div class="meta">~*mira*~</div></div>`); $("#pane").scrollTop = $("#pane").scrollHeight; } }, 1800);
    } else {
      $("#pane").insertAdjacentHTML("beforeend", `<div class="sys">You have just sent a nudge.</div>`);
    }
    $("#pane").scrollTop = $("#pane").scrollHeight;
  };
  $("#t-nudge").addEventListener("click", nudge);
  $("#c-nudge").addEventListener("click", nudge);

  const ending = async () => {
    const p = await Vault.open("secret", "secret:" + Vault.keys().jules, true);
    if (!p) return;
    const b = $("#blackout");
    b.classList.add("on"); b.innerHTML = "";
    await wait(1800);
    for (const line of p.lines) { b.insertAdjacentHTML("beforeend", `<p>${esc(line)}</p>`); await wait(2600); }
    await wait(1200);
    b.insertAdjacentHTML("beforeend", `<p style="color:#78909c;font-size:13px;margin-top:28px">~*mira*~ has signed out.<br>First sign-out since 14 June 2006.</p><p><button class="xbtn" id="bye">Close</button></p>`);
    Vault.set("closed", 1);
    $("#bye").addEventListener("click", () => (location.href = "index.html"));
  };

  /* ---------- now playing ---------- */
  let npi = 0;
  const np = () => {
    const tracks = S.nowPlaying;
    const glitchRoll = Math.random() < 0.25;
    const t = npi % 3 === 0 ? tracks[0] : tracks[npi % tracks.length];
    npi++;
    const glitch = glitchRoll && t === tracks[0];
    $("#np").classList.toggle("glitch", glitch);
    $("#np").innerHTML = `<span class="cover"></span><span><small>~*mira*~ is listening to:</small><b>${esc(t.artist)} -</b>${esc(glitch ? [...t.track].reverse().join("") : t.track)}</span>`;
  };
  np(); setInterval(np, 7000);
  $("#np").addEventListener("click", () => {
    const list = [...S.nowPlaying].sort((a, b) => b.plays - a.plays);
    document.body.insertAdjacentHTML("beforeend", `<div class="scrim" id="scrim"></div><div class="win pop" id="pop" role="dialog" aria-label="Recently played"><div class="titlebar"><span class="t">Recently played - ~*mira*~</span><button class="tb-btn close" id="popx" aria-label="Close">×</button></div><div class="inner"><ol>${list.map((t) => `<li><b>${esc(t.track)}</b> - ${esc(t.artist)} <span style="color:#888">(${t.plays.toLocaleString("en-GB")} plays)</span></li>`).join("")}</ol></div></div>`);
    const close = () => { $("#pop")?.remove(); $("#scrim")?.remove(); };
    $("#popx").addEventListener("click", close); $("#scrim").addEventListener("click", close);
    $("#popx").focus();
  });

  $("#t-help").addEventListener("click", () => { state.who = "support"; state.view = "chat"; render(); $("#cols").dataset.show = "chat"; });
  $("#m-help").addEventListener("click", () => $("#t-help").click());

  /* ---------- the creepy layer: small, rare, escalating ---------- */
  const creeps = [
    () => { const m = $$(".meta[data-t]"); const el = m[Math.floor(Math.random() * m.length)]; if (!el) return; const old = el.textContent; el.textContent = "14/06/2006 21:47"; el.classList.add("wrong"); setTimeout(() => { el.textContent = old; el.classList.remove("wrong"); }, 1300); },
    () => { const dot = $('[data-who="lakekeeper"] .n i'); if (!dot) return; dot.className = "online"; setTimeout(() => (dot.className = "away"), 900); },
    () => { if (U.deleted && !U.jules) toast("mira", "has just signed in."); },
  ];
  if (U.deleted) document.body.classList.add("uneasy");
  const scheduleCreep = () => setTimeout(() => { if (U.diary) creeps[Math.floor(Math.random() * creeps.length)](); scheduleCreep(); }, 35000 + Math.random() * 50000);
  scheduleCreep();

  render();
  if (!state.read.length) setTimeout(() => toast("support", "Welcome back. You have 5 unread messages."), 1500);
})();
