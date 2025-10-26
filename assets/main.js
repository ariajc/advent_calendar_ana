/**
 * Advent unlock logic for Europe/Madrid timezone
 * - Unlocks 1..24 in December of ADVENT_YEAR
 * - Shows links to /days/day-XX.html only if unlocked
 * - Adds a midnight (Madrid) refresh to avoid stale state
 */

/** CONFIG: set your advent year here */
const ADVENT_YEAR = 2025;          // <— change if needed
const ADVENT_MONTH = 10;           // December
const ADVENT_DAYS = 24;            // 1..24
const MADRID_TZ = "Europe/Madrid"; // timezone for unlocking

/** Format Madrid date & parts */
function getMadridDate() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: MADRID_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  });
  // Get numeric parts
  const parts = fmt.formatToParts(now).reduce((acc, p) => {
    if (p.type === "year") acc.year = Number(p.value);
    if (p.type === "month") acc.month = Number(p.value);
    if (p.type === "day") acc.day = Number(p.value);
    if (p.type === "hour") acc.hour = Number(p.value);
    if (p.type === "minute") acc.minute = Number(p.value);
    if (p.type === "second") acc.second = Number(p.value);
    return acc;
  }, {year:0, month:0, day:0, hour:0, minute:0, second:0});

  return {
    ...parts,
    label: new Intl.DateTimeFormat("en-GB", {
      timeZone: MADRID_TZ,
      dateStyle: "full",
      timeStyle: "medium"
    }).format(now)
  };
}

/** Return true if Day `d` should be unlocked in Madrid */
function isUnlocked(d) {
  const { year, month, day } = getMadridDate();

  if (year >= ADVENT_YEAR) return true;
  if (year < ADVENT_YEAR) return false;

  if (month >= ADVENT_MONTH) return true;
  if (month < ADVENT_MONTH) return false;

  return day >= d; // same year & month (Dec) → unlock by day number
}

/** Render calendar tiles */
function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let d = 1; d <= ADVENT_DAYS; d++) {
    const a = document.createElement(isUnlocked(d) ? "a" : "div");
    a.className = "tile " + (isUnlocked(d) ? "unlocked" : "locked");
    a.setAttribute("aria-label", `Day ${d}`);

    // If unlocked, make it a link to the encrypted page
    if (isUnlocked(d)) {
      const href = `days/day-${String(d).padStart(2, "0")}.html`;
      a.href = href;
      a.innerHTML = `<div><div>Day ${d}</div><div style="font-size:.9rem;">Open ➜</div></div>`;
    } else {
      a.innerHTML = `<div style="text-align:center;">
        <div>Day ${d}</div>
        <div class="lock">🔒 Locked</div>
      </div>`;
    }

    grid.appendChild(a);
  }
}

/** Show current Madrid time (debug/UX) */
function showToday() {
  const el = document.getElementById("today");
  if (!el) return;
  const { label } = getMadridDate();
  el.textContent = `Current time (Europe/Madrid): ${label}`;
}

/** Schedule a reload at next Madrid midnight to avoid stale lock state */
function scheduleMidnightReload() {
  // Compute time until next midnight in Madrid
  const now = new Date();

  // Get Madrid "today"
  const madridNow = new Date(
    now.toLocaleString("en-US", { timeZone: MADRID_TZ })
  );

  const next = new Date(madridNow);
  next.setHours(24, 0, 2, 0); // 00:00:02 next day

  const msUntil = next - madridNow;
  if (msUntil > 0 && msUntil < 48 * 3600 * 1000) {
    setTimeout(() => location.reload(), msUntil);
  }
}

/** Init */
(function init() {
  showToday();
  renderGrid();
  scheduleMidnightReload();
})();
