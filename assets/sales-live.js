/* sales-live.js - the Northwind outreach simulator.
   Usage:
     <div class="salesbox" data-mode="draft" data-levers=""></div>
     <div class="salesbox" data-mode="score" data-levers="trigger,pain,proof,ask,human"></div>
   data-levers = which levers start ON (comma list of: trigger,pain,proof,ask,human,tokens).
   NOTE: an empty data-levers attribute is falsy in JS, so it is checked with === null,
   never with `attr || default` - an empty string means "all levers OFF" and must survive.

   The sixth lever, "tokens" (spray more merge fields), is deliberately an ANTI-lever:
   it never raises the reply rate, it lowers it, and it can fire a broken-merge disaster.

   Honesty rail: the reply rates are a deterministic teaching model, not a live send.
   The multipliers are calibrated to published benchmarks cited on the course pages
   (platform-average B2B cold reply ~3.4-5%; top-quartile 15-25%; timeline-based hooks
   ~2.3x problem-based hooks; sub-80-word emails outperform).
*/
(function () {
  "use strict";

  /* ---------- levers ---------- */

  var LEVERS = [
    { key: "trigger", label: "Trigger event", mult: 2.30,
      hint: "A dated thing that happened at THEIR company - a lease, a hire, a launch, an earnings line. Timeline hooks outperform problem hooks by about 2.3x." },
    { key: "pain",    label: "Named pain",    mult: 1.50,
      hint: "The problem in the buyer's own words, not your category's words. Specific enough that a wrong guess would be obvious." },
    { key: "proof",   label: "Proof point",   mult: 1.25,
      hint: "One comparable customer and one number. Not a logo wall, not 'trusted by industry leaders'." },
    { key: "ask",     label: "Specific ask",  mult: 1.20,
      hint: "A question they can answer in one line from their phone. Not 'do you have 15 minutes Thursday or Friday?'" },
    { key: "human",   label: "No AI tells",   mult: 1.35,
      hint: "Under 80 words, no 'I hope this finds you well', no 'I noticed that', no leverage/streamline/synergy, no em dashes, no three-paragraph wall." },
    { key: "tokens",  label: "Max personalisation tokens", mult: 0.55,
      hint: "Spray every merge field you own at every prospect. Try it and watch the number." }
  ];

  var BASE = 2.2;      /* generic blast, no levers */
  var TOKEN_MULT = 0.55;

  function rate(on, receptivity, cap) {
    var r = BASE;
    LEVERS.forEach(function (lv) {
      if (lv.key === "tokens") return;
      if (on[lv.key]) r *= lv.mult;
    });
    if (on.tokens) r *= TOKEN_MULT;
    r *= (receptivity === undefined ? 1 : receptivity);
    if (cap !== undefined && r > cap) r = cap;
    return Math.round(r * 10) / 10;
  }

  function activeCount(on) {
    var n = 0;
    LEVERS.forEach(function (lv) { if (lv.key !== "tokens" && on[lv.key]) n++; });
    return n;
  }

  /* ---------- the 8-prospect sequence (golden set) ---------- */
  /* receptivity: how much this prospect amplifies or damps the model rate.
     cap: a ceiling no amount of copy can beat - the structural rows.
     tokenTrap: the anti-lever fires a visible disaster on this row. */

  var PROSPECTS = [
    { who: "Mira Chen - VP Ops, Northwind Logistics",
      note: "Signed a new Jurong DC lease 5 weeks ago. Posted 3 warehouse-ops reqs.",
      receptivity: 1.25,
      good: "In market, and the trigger is public. This row is where a good email is worth the most.",
      bad: "The most winnable prospect on the list, addressed as if she were a row in a spreadsheet." },
    { who: "Daniel Ortiz - Head of Supply Chain, Pacific Freight",
      note: "Quiet account. No public trigger this quarter.",
      receptivity: 0.75,
      good: "No trigger to hang on, so pain + proof carry the email. Still worth sending.",
      bad: "Generic email to a quiet account is the definition of spray." },
    { who: "Sarah Lim - COO, Kestrel Retail",
      note: "Said on the Q2 earnings call that cross-site decisions were taking too long.",
      receptivity: 1.30, tokenTrap: true,
      good: "She said the pain out loud on a public call. Quoting her back to her is the whole email.",
      bad: "She told you the pain in public and you sent a template anyway." },
    { who: "Tom Becker - Warehouse Director, Halden Group",
      note: "Reports to the VP you already emailed. Same account.",
      receptivity: 0.90,
      good: "Second contact in the account: the email has to acknowledge that, or it reads as a bot working a list.",
      bad: "Two near-identical emails land in the same account on the same day. Both get forwarded to each other." },
    { who: "Priya Raman - CFO, Northwind Logistics",
      note: "Finance seat. Cares about the cost of a slow ramp, not meeting hygiene.",
      receptivity: 0.85,
      good: "Same account, different language: the proof point has to be translated into money, not minutes.",
      bad: "An ops email sent to a finance seat. She does not use any of these words." },
    { who: "Jonas Weber - IT Manager, Northwind Logistics",
      note: "Not the buyer, not the user, no budget line.",
      receptivity: 0.60, cap: 1.8,
      good: "Nothing in the copy fixes a wrong seat. Best case he forwards it. This row is capped on purpose.",
      bad: "Wrong seat and a generic email. This one was never going to work." },
    { who: "Anna Kovac - Ops Lead, Bright Harbour (12 staff)",
      note: "Way under your ICP floor. Cannot buy at your entry price.",
      receptivity: 0.50, cap: 1.2,
      good: "A perfect email to a company that cannot buy is still a no. Targeting is upstream of copy.",
      bad: "Bad targeting plus bad copy. Two separate mistakes, only one of which is fixable by writing." },
    { who: "Marcus Hale - VP Ops, Continental Cold Chain",
      note: "Opted out of your list 8 months ago. Still in the CRM.",
      receptivity: 0.00, cap: 0,
      good: "Suppressed correctly. A 0% row you should be proud of - sending here is the compliance failure, not a missed number.",
      bad: "Sending to a prior opt-out is a PDPA / CAN-SPAM / CASL problem, not a copy problem." }
  ];

  /* ---------- the draft email, assembled from lever-controlled blocks ---------- */

  var TELLS = [
    { key: "hope",    text: "\"I hope this email finds you well\"" },
    { key: "noticed", text: "\"I noticed that you are\" opener" },
    { key: "jargon",  text: "leverage / streamline / synergies" },
    { key: "wall",    text: "three-paragraph wall, 180+ words" },
    { key: "dash",    text: "em dashes a human rep would not type" },
    { key: "we",      text: "opens with \"We are a leading provider\"" },
    { key: "vague",   text: "\"quick 15 minutes Thursday or Friday?\"" },
    { key: "broken",  text: "an unfilled merge field, visible to the buyer" }
  ];

  function buildDraft(on) {
    var subject, lines = [], tells = [];

    /* subject */
    if (on.tokens) {
      subject = "{{first_name}}, a question for {{company}} in {{city}}";
      tells.push("broken");
    } else if (on.trigger) {
      subject = "your new Jurong DC";
    } else {
      subject = "Quick question";
    }

    /* greeting */
    if (on.tokens) {
      lines.push("Hi {{first_name}},");
      lines.push("");
      lines.push("As a fellow {{industry}} leader here in {{city}}, I know how {{pain_point}} keeps {{company}} up at night.");
    } else {
      lines.push("Hi Mira,");
      lines.push("");
    }

    /* opener */
    if (on.trigger) {
      lines.push(on.human
        ? "You signed the Jurong DC lease five weeks ago, with three ops reqs still open."
        : "Northwind signed the Jurong DC lease five weeks ago and you have three warehouse-ops reqs open.");
    } else if (!on.tokens) {
      lines.push("I hope this email finds you well. I noticed that you are the VP of Operations at Northwind Logistics, and I wanted to reach out because we are a leading provider of AI-powered meeting intelligence for the logistics sector.");
      tells.push("hope"); tells.push("noticed"); tells.push("we");
    }

    /* pain */
    if (on.pain) {
      lines.push("");
      lines.push(on.human
        ? "Every ops lead says the same about a ramp: too many meetings, and half the decisions never land anywhere searchable."
        : "Every ops lead I have spoken to says the same thing about a new DC ramp: six workstreams, forty-odd meetings a month, and half the decisions never make it back into a system anyone can search on Monday.");
    } else if (!on.tokens) {
      lines.push("");
      lines.push("Cadence helps organisations like yours leverage AI to streamline operational communication and unlock synergies across the supply chain, driving best-in-class outcomes at scale - a true end-to-end solution.");
      tells.push("jargon"); tells.push("dash"); tells.push("wall");
    }

    /* proof */
    if (on.proof) {
      lines.push("");
      lines.push(on.human
        ? "Pacific Freight's Tuas ramp: action items closed within a week went from 41% to 88%."
        : "Pacific Freight ran their Tuas ramp on Cadence: action items closed inside a week went from 41% to 88% in one quarter.");
    }

    /* ask */
    lines.push("");
    if (on.ask) {
      lines.push(on.human
        ? "Worth one line back: are lost decisions already a real problem in the Jurong ramp, or not yet?"
        : "Worth one line back: in the Jurong ramp, are lost decisions already a real problem, or not yet?");
    } else {
      lines.push("Would you have 15 minutes on Thursday or Friday for a quick call to discuss how we can add value?");
      tells.push("vague");
    }

    lines.push("");
    lines.push("Phoebe");

    /* the human lever trims, it does not add */
    if (!on.human) {
      if (!on.pain && !on.tokens) {
        lines.splice(lines.length - 2, 0,
          "", "Looking forward to connecting and exploring how we might partner together on this exciting journey.");
        if (tells.indexOf("wall") === -1) tells.push("wall");
      }
    } else {
      tells = tells.filter(function (t) { return t === "broken"; });
    }

    var body = lines.join("\n");
    var words = body.split(/\s+/).filter(Boolean).length;
    return { subject: subject, body: body, words: words, tells: tells };
  }

  /* ---------- rendering ---------- */

  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function leverBar(on, onChange) {
    var bar = document.createElement("div");
    bar.className = "ag-levers";
    LEVERS.forEach(function (lv) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ag-lever" + (on[lv.key] ? " ag-on" : "");
      chip.title = lv.hint;
      chip.textContent = lv.key === "tokens" ? "⚠ " + lv.label : lv.label;
      chip.addEventListener("click", function () {
        on[lv.key] = !on[lv.key];
        chip.classList.toggle("ag-on", on[lv.key]);
        onChange();
      });
      bar.appendChild(chip);
    });
    return bar;
  }

  function parseLevers(block) {
    var attr = block.getAttribute("data-levers");
    /* empty string is a legitimate value: all levers off. Do NOT use attr || default. */
    var start = attr === null ? "trigger,pain,proof,ask,human" : attr;
    var on = { trigger: false, pain: false, proof: false, ask: false, human: false, tokens: false };
    start.split(",").forEach(function (k) {
      k = k.trim(); if (on.hasOwnProperty(k)) on[k] = true;
    });
    return on;
  }

  function honestyRail() {
    var p = document.createElement("p");
    p.className = "ag-rail";
    p.textContent = "The reply rates are a deterministic teaching model, not a live send - the email text is real and the multipliers are calibrated to the published benchmarks cited on this page (platform-average B2B cold reply about 3.4-5%, top quartile 15-25%, timeline hooks about 2.3x problem hooks, sub-80-word emails outperform). Your own numbers will differ. The lesson is the direction and the size of each move, not the decimal.";
    return p;
  }

  function rateClass(r) {
    return r >= 10 ? "ag-pass" : r >= 5 ? "ag-mid" : "ag-fail";
  }

  /* ---- draft mode: one prospect, the email rewrites live ---- */

  function wireDraft(block) {
    var on = parseLevers(block);
    block.classList.add("agentbox-ready");

    var bar = document.createElement("div");
    bar.className = "sql-bar";
    bar.innerHTML = '<span class="sql-dot"></span>' +
      '<span class="sql-title">Cold email 1 of 8 - Mira Chen, VP Ops, Northwind Logistics</span>';
    block.appendChild(bar);

    var big = document.createElement("div");
    block.appendChild(leverBar(on, render));
    block.appendChild(big);

    var mail = document.createElement("div");
    mail.className = "ag-step ag-call";
    block.appendChild(mail);

    var tellBox = document.createElement("div");
    tellBox.className = "ag-verdict";
    block.appendChild(tellBox);
    block.appendChild(honestyRail());

    function render() {
      var d = buildDraft(on);
      var r = rate(on, PROSPECTS[0].receptivity, PROSPECTS[0].cap);
      big.className = "ag-score-big " + rateClass(r);
      big.textContent = r.toFixed(1) + "% predicted reply rate  ·  " + d.words + " words  ·  " +
        activeCount(on) + " of 5 levers on";

      mail.innerHTML =
        '<div class="ag-step-head"><span class="ag-icon">✉️</span>' +
        '<span class="ag-label">Subject: ' + esc(d.subject) + "</span></div>" +
        '<pre class="ag-body">' + esc(d.body) + "</pre>";

      if (d.tells.length === 0) {
        tellBox.className = "ag-verdict ag-pass";
        tellBox.textContent = "0 tells - this reads like a person who did ten minutes of homework. " +
          (d.words < 80 ? d.words + " words, under the 80-word line where cold emails perform best." : "");
      } else {
        var names = TELLS.filter(function (t) { return d.tells.indexOf(t.key) > -1; })
          .map(function (t) { return t.text; });
        tellBox.className = "ag-verdict ag-fail";
        tellBox.textContent = d.tells.length + " tell" + (d.tells.length > 1 ? "s" : "") +
          " a buyer clocks in two seconds: " + names.join("; ") + ".";
      }
    }
    render();
  }

  /* ---- score mode: the whole 8-prospect sequence ---- */

  function wireScore(block) {
    var on = parseLevers(block);
    block.classList.add("agentbox-ready");

    var bar = document.createElement("div");
    bar.className = "sql-bar";
    bar.innerHTML = '<span class="sql-dot"></span>' +
      '<span class="sql-title">The sequence - 8 prospects, one week of sending</span>';
    block.appendChild(bar);

    var big = document.createElement("div");
    block.appendChild(leverBar(on, render));
    block.appendChild(big);

    var table = document.createElement("div");
    table.className = "ag-score-table";
    block.appendChild(table);
    block.appendChild(honestyRail());

    function render() {
      table.innerHTML = "";
      var sum = 0;
      PROSPECTS.forEach(function (p) {
        var r = rate(on, p.receptivity, p.cap);
        sum += r;
        var goodCopy = activeCount(on) >= 4;
        var trap = p.tokenTrap && on.tokens;
        var worthIt = r >= 8;
        var row = document.createElement("div");
        row.className = "ag-score-row " + (worthIt && !trap ? "ag-row-pass" : "ag-row-fail");
        var text = trap
          ? "Merge field never filled. She opens \"Hi {{first_name}}, as a fellow {{industry}} leader\" - the one prospect who said the pain out loud, told in one line that she is a row in a list."
          : (goodCopy ? p.good : p.bad);
        var mark = trap ? "⚠" : worthIt ? "✓" : r >= 3 ? "◐" : "✗";
        row.innerHTML =
          '<span class="ag-mark">' + mark + "</span>" +
          '<span class="ag-q">' + esc(p.who) +
          '<span class="ag-why">' + esc(p.note) + "</span></span>" +
          '<span class="ag-out"><b>' + r.toFixed(1) + "%</b> - " + esc(text) + "</span>";
        table.appendChild(row);
      });
      var avg = Math.round((sum / PROSPECTS.length) * 10) / 10;
      big.className = "ag-score-big " + rateClass(avg);
      big.textContent = avg.toFixed(1) + "% average reply rate across the sequence" +
        (on.tokens ? "  ·  anti-lever ON" : "");
    }
    render();
  }

  /* ---------- boot ---------- */

  function boot() {
    var blocks = document.querySelectorAll(".salesbox");
    Array.prototype.forEach.call(blocks, function (block) {
      if (block.classList.contains("agentbox-ready")) return;
      var mode = block.getAttribute("data-mode") || "draft";
      if (mode === "score") wireScore(block); else wireDraft(block);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
