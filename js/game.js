/* =====================================================================
   Anime Fighter Arena - web version of "OOP Fighter Game.py"
   Mechanics (stats, attacks, status effects, heal, save/load, turn
   order) are ported from the Python game, with these balance changes
   requested for the web version:
     - petrification blocks an attack 2/3 of the time (was 1/2)
     - burn/curse also deal their damage at the start of the afflicted
       fighter's own turn (so the effects tick every round instead of
       only when that fighter gets attacked)
   ===================================================================== */

"use strict";

/* Python's random.randrange(a, b) -> integer in [a, b) */
function randrange(a, b) {
  return Math.floor(Math.random() * (b - a)) + a;
}

const SAVE_KEY = "fighters.json";

/* =====================================================================
   Attack recorder: attacks record what happened as an ordered list of
   events so the UI can play them back one at a time (one slash at a
   time on the health bar, one message line at a time).
     {type:"msg", text}                      - a battle log line
     {type:"hit", name, dmg, hp, kind}       - name lost dmg HP (hp = HP after)
   ===================================================================== */
function makeRecorder() {
  const events = [];
  return {
    events,
    log(text) { events.push({ type: "msg", text }); },
    hit(target, dmg, kind) {
      events.push({ type: "hit", name: target.name, dmg, hp: Math.max(0, target.health), kind: kind || "attack" });
    },
  };
}

/* ============================ Classes ============================ */

class Fighter {
  constructor(name, health, attack_power, burn_turns, curse_turns, petrified) {
    this.name = name;
    this.health = health;
    this.attack_power = attack_power;
    this.burn_turns = burn_turns;
    this.curse_turns = curse_turns;
    this.petrified = petrified;
  }

  heal(log) {
    const healed = Math.floor(this.health / 2);
    this.health = this.health + healed;
    if (this.health > 100) {
      this.health = 100;
    }
    log(`${this.name} has healed by ${healed}`);
    return healed;
  }

  /* Applies effects to a character if called (same order as Python:
     burn/curse tick on the enemy, petrify ticks on the attacker). */
  applyEffects(enemy, R) {
    if (enemy.burn_turns > 0) {
      enemy.health = enemy.health - 3;
      enemy.burn_turns = enemy.burn_turns - 1;
      R.hit(enemy, 3, "burn");
      R.log(`${enemy.name} lost an extra 3 health due to being burned. Turns remaining: ${enemy.burn_turns}`);
    }
    if (enemy.curse_turns > 0) {
      enemy.health = enemy.health - 4;
      enemy.curse_turns = enemy.curse_turns - 1;
      R.hit(enemy, 4, "curse");
      R.log(`${enemy.name} lost an extra 4 health due to being cursed. Turns remaining: ${enemy.curse_turns}`);
    }
    if (this.petrified > 0) {
      this.petrified = this.petrified - 1;
      R.log(`${this.name} has ${this.petrified} turns left of being partially petrified`);
    }
    if (enemy.health <= 0) {
      enemy.health = 0;
      R.log(`${enemy.name} is defeated!`);
    }
  }

  /* 2/4 chance that petrification stops the attack */
  petrifyBlocks() {
    return randrange(0, 2) === 1;
  }
}

class Swordsman extends Fighter {
  doSlashes(enemy, R) {
    const hits = randrange(1, 3);
    for (let h = 0; h < hits; h++) { // one slash at a time so each hit shows on the health bar
      enemy.health = enemy.health - this.attack_power;
      R.hit(enemy, this.attack_power);
    }
    R.log(`${this.name} slashed ${enemy.name} ${hits} times`);
  }

  attack(enemy, R) {
    if (this.petrified > 0) { // Character attacking already has petrified status
      if (this.petrifyBlocks()) {
        R.log(`${this.name} couldn't attack due to being petrified!`);
      } else {
        this.doSlashes(enemy, R);
      }
    } else if (this.petrified === 0) {
      this.doSlashes(enemy, R);
    }
    this.applyEffects(enemy, R);
  }
}

class Mage extends Fighter {
  doMegiddo(enemy, R) {
    enemy.health = enemy.health - this.attack_power;
    R.hit(enemy, this.attack_power);
    R.log(`${this.name} used the unique spell Megiddo on ${enemy.name}`);
    if (enemy.curse_turns === 0) {
      const amount = randrange(0, 4); // 3/4 chance of being cursed
      if (amount > 0) {
        enemy.curse_turns = amount;
        R.log(`${enemy.name} is now cursed for ${amount} turns`);
      }
    }
  }

  attack(enemy, R) { // rimuru's attack
    if (this.petrified > 0) { // Character attacking already has petrified status
      if (this.petrifyBlocks()) {
        R.log(`${this.name} couldn't attack due to being petrified!`);
      } else {
        this.doMegiddo(enemy, R);
      }
    } else if (this.petrified === 0) {
      this.doMegiddo(enemy, R);
    }
    this.applyEffects(enemy, R);
  }

  // Senku specific attack (Medusa) - can't be petrified himself unless he attacks himself
  petrify(enemy, R) {
    enemy.health = enemy.health - this.attack_power;
    R.hit(enemy, this.attack_power);
    R.log(`${this.name} spoke 1 meter, 1 second into the Medusa and threw it at ${enemy.name}`);
    if (enemy.petrified === 0) {
      if (randrange(0, 2) === 1) { // 2/4 chance of being petrified
        const amount = randrange(1, 4); // for 1-3 turns
        enemy.petrified = amount;
        R.log(`${enemy.name} is partially petrified for ${amount} turns!`);
      }
    }
    this.applyEffects(enemy, R);
  }
}

class Brawler extends Fighter {
  doRedHawk(enemy, R) {
    enemy.health = enemy.health - this.attack_power;
    R.hit(enemy, this.attack_power);
    R.log(`${this.name} used the attack Red Hawk on ${enemy.name}`);
    if (enemy.burn_turns === 0) {
      const amount = randrange(0, 3); // 2/3 chance of being burned
      if (amount > 0) {
        enemy.burn_turns = amount;
        R.log(`${enemy.name} is now burned for ${amount} turns!`);
      }
    }
  }

  attack(enemy, R) {
    if (this.petrified > 0) { // Character attacking already has petrified status
      if (this.petrifyBlocks()) {
        R.log(`${this.name} couldn't attack due to being petrified!`);
      } else {
        this.doRedHawk(enemy, R);
      }
    } else if (this.petrified === 0) {
      this.doRedHawk(enemy, R);
    }
    this.applyEffects(enemy, R);
  }
}

/* ============================ Roster ============================ */

const luffy = new Brawler("Luffy", 100, 35, 0, 0, 0);
const senku = new Mage("Senku", 100, 30, 0, 0, 0);
const asta = new Swordsman("Asta", 100, 22, 0, 0, 0);
const thorfinn = new Swordsman("Thorfinn", 100, 20, 0, 0, 0);
const rimuru = new Mage("Rimuru", 100, 36, 0, 0, 0);

const catalog = [luffy, senku, asta, thorfinn, rimuru];

const SPRITES = {
  Luffy:    { front: "assets/luffy-front.png",    back: "assets/luffy-back.png" },
  Senku:    { front: "assets/senku-front.png",    back: "assets/senku-back.png" },
  Asta:     { front: "assets/asta-front.png",     back: "assets/asta-back.png" },
  Thorfinn: { front: "assets/thorfinn-front.png", back: "assets/thorfinn-back.png" },
  Rimuru:   { front: "assets/rimuru-front.png",   back: "assets/rimuru-back.png" },
};

const CLASS_LABEL = { Luffy: "Brawler", Senku: "Mage", Asta: "Swordsman", Thorfinn: "Swordsman", Rimuru: "Mage" };

/* Senku always uses his Medusa in the original game loop;
   everyone else uses their class attack. */
const MOVE_LABEL = {
  Luffy: "Red Hawk",
  Senku: "Medusa",
  Asta: "Slash",
  Thorfinn: "Slash",
  Rimuru: "Megiddo",
};

/* Playback pacing (ms) - slow enough that players can read each line */
const HIT_MS = 750;
const MSG_MS = 1500;
const END_PAUSE_MS = 1200;

/* ============================ Game state ============================ */

let turnIndex = 0;     // whose turn it is (index into catalog)
let busy = false;      // true while an action animation is playing

/* ============================ DOM refs ============================ */

const el = (id) => document.getElementById(id);

const titleScreen = el("title-screen");
const battleScreen = el("battle-screen");
const endScreen = el("end-screen");

const enemyRow = el("enemy-row");
const activeSprite = el("active-sprite");
const activeName = el("active-name");
const activeAttack = el("active-attack");
const activeHpFill = el("active-hp-fill");
const activeHpText = el("active-hp-text");
const activeStatus = el("active-status");

const messageText = el("message-text");
const messageBox = el("message-box");
const mainCommands = el("main-commands");
const targetCommands = el("target-commands");
const targetButtons = el("target-buttons");
const targetPrompt = el("target-prompt");

const btnAttack = el("btn-attack");
const btnHeal = el("btn-heal");
const btnEnd = el("btn-end");
const btnCancelTarget = el("btn-cancel-target");

/* ============================ Helpers ============================ */

function currentFighter() {
  return catalog[turnIndex];
}

function nextFighter() {
  return catalog[(turnIndex + 1) % catalog.length];
}

function hpColor(hp) {
  if (hp > 50) return "var(--hp-green)";
  if (hp > 20) return "var(--hp-yellow)";
  return "var(--hp-red)";
}

function statusChips(f) {
  const chips = [];
  if (f.burn_turns > 0) chips.push(`<span class="status-chip burn">BRN ${f.burn_turns}</span>`);
  if (f.curse_turns > 0) chips.push(`<span class="status-chip curse">CRS ${f.curse_turns}</span>`);
  if (f.petrified > 0) chips.push(`<span class="status-chip petrify">PTR ${f.petrified}</span>`);
  return chips.join("");
}

function setMessage(lines) {
  messageText.textContent = Array.isArray(lines) ? lines.join("\n") : lines;
  messageBox.scrollTop = messageBox.scrollHeight;
}

function appendMessage(line) {
  messageText.textContent = messageText.textContent
    ? messageText.textContent + "\n" + line
    : line;
  messageBox.scrollTop = messageBox.scrollHeight;
}

function popText(container, text, cls) {
  const pop = document.createElement("span");
  pop.className = "dmg-pop" + (cls ? " " + cls : "");
  pop.textContent = text;
  container.appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ============================ Rendering ============================ */

function renderNextIndicator() {
  const n = nextFighter();
  el("next-sprite").src = SPRITES[n.name].front;
  el("next-sprite").alt = n.name;
  el("next-name").textContent = n.name;
}

function renderActivePanel() {
  const f = currentFighter();
  activeSprite.src = SPRITES[f.name].back;
  activeSprite.alt = f.name + " (back view)";
  activeName.textContent = f.name;
  activeAttack.textContent = "ATK " + f.attack_power;
  activeHpFill.style.width = Math.max(0, Math.min(100, f.health)) + "%";
  activeHpFill.style.background = hpColor(f.health);
  activeHpText.textContent = f.health + "/100";
  activeStatus.innerHTML = statusChips(f);
  btnAttack.textContent = MOVE_LABEL[f.name];
}

function renderEnemyRow() {
  const f = currentFighter();
  enemyRow.innerHTML = "";
  for (const enemy of catalog) {
    if (enemy === f) continue;
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "enemy-slot" + (enemy.health === 0 ? " defeated" : "");
    slot.dataset.name = enemy.name;
    slot.disabled = true;
    slot.innerHTML = `
      <div class="mini-panel">
        <div class="mini-name"><span>${enemy.name}</span><span>ATK ${enemy.attack_power}</span></div>
        <div class="mini-hp-bar"><div class="mini-hp-fill" style="width:${Math.max(0, Math.min(100, enemy.health))}%; background:${hpColor(enemy.health)}"></div></div>
        <span class="mini-hp-text">HP ${enemy.health}/100</span>
        <div class="mini-status">${statusChips(enemy)}</div>
      </div>
      <div class="sprite-stand">
        <span class="ground-shadow"></span>
        <img class="enemy-sprite" src="${SPRITES[enemy.name].front}" alt="${enemy.name}">
      </div>`;
    slot.addEventListener("click", () => onTargetChosen(enemy.name));
    enemyRow.appendChild(slot);
  }
}

/* Set one fighter's HP bar/text to a specific value (used mid-playback
   so each slash is visible on the health bar one at a time). */
function setDisplayedHp(name, hp) {
  const f = currentFighter();
  if (name === f.name) {
    activeHpFill.style.width = Math.max(0, Math.min(100, hp)) + "%";
    activeHpFill.style.background = hpColor(hp);
    activeHpText.textContent = hp + "/100";
    return;
  }
  const slot = [...enemyRow.children].find((s) => s.dataset.name === name);
  if (!slot) return;
  slot.querySelector(".mini-hp-fill").style.width = Math.max(0, Math.min(100, hp)) + "%";
  slot.querySelector(".mini-hp-fill").style.background = hpColor(hp);
  slot.querySelector(".mini-hp-text").textContent = `HP ${hp}/100`;
}

function refreshBars() {
  // Update HP bars/status chips in place (without rebuilding sprites)
  const f = currentFighter();
  activeHpFill.style.width = Math.max(0, Math.min(100, f.health)) + "%";
  activeHpFill.style.background = hpColor(f.health);
  activeHpText.textContent = f.health + "/100";
  activeStatus.innerHTML = statusChips(f);
  for (const slot of enemyRow.children) {
    const enemy = catalog.find((c) => c.name === slot.dataset.name);
    slot.classList.toggle("defeated", enemy.health === 0);
    slot.querySelector(".mini-hp-fill").style.width = Math.max(0, Math.min(100, enemy.health)) + "%";
    slot.querySelector(".mini-hp-fill").style.background = hpColor(enemy.health);
    slot.querySelector(".mini-hp-text").textContent = `HP ${enemy.health}/100`;
    slot.querySelector(".mini-status").innerHTML = statusChips(enemy);
  }
}

function turnPrompt() {
  const f = currentFighter();
  if (f.health === 0) {
    return [
      `${f.name} | HP: ${f.health} | Attack: ${f.attack_power}`,
      "They are defeated so therefore can't attack or do anything - end the run or play without this character",
    ];
  }
  return [
    `${f.name} | HP: ${f.health} | Attack: ${f.attack_power}`,
    `Who should ${f.name} attack? Press Heal to recover or end the run.`,
  ];
}

function renderTurn() {
  renderActivePanel();
  renderEnemyRow();
  renderNextIndicator();
  hideTargetMenu();
  setMessage(turnPrompt());
}

/* ============================ Target menu ============================ */

function showTargetMenu() {
  const f = currentFighter();
  mainCommands.hidden = true;
  targetCommands.hidden = false;
  targetPrompt.textContent = `Who should ${f.name} attack?`;
  targetButtons.innerHTML = "";
  for (const enemy of catalog) {
    if (enemy === f) continue;
    const b = document.createElement("button");
    b.className = "pixel-btn";
    b.textContent = enemy.name;
    b.addEventListener("click", () => onTargetChosen(enemy.name));
    targetButtons.appendChild(b);
  }
  for (const slot of enemyRow.children) {
    slot.disabled = false;
    slot.classList.add("targetable");
  }
}

function hideTargetMenu() {
  mainCommands.hidden = false;
  targetCommands.hidden = true;
  for (const slot of enemyRow.children) {
    slot.disabled = true;
    slot.classList.remove("targetable");
  }
}

/* ============================ Event playback ============================ */

function hitAnimTarget(name) {
  const f = currentFighter();
  if (name === f.name) {
    return { anim: activeSprite, pop: el("active-sprite-wrap") };
  }
  const slot = [...enemyRow.children].find((s) => s.dataset.name === name);
  return slot ? { anim: slot, pop: slot } : null;
}

/* Plays recorded events one at a time: each hit lands separately on the
   health bar, each message line appears on its own and stays long
   enough to read. */
async function playEvents(events) {
  for (const ev of events) {
    if (ev.type === "hit") {
      const t = hitAnimTarget(ev.name);
      if (t) {
        t.anim.classList.add("hit", "flash");
        const cls = ev.kind === "burn" ? "burn-pop" : ev.kind === "curse" ? "curse-pop" : "";
        popText(t.pop, "-" + ev.dmg, cls);
      }
      setDisplayedHp(ev.name, ev.hp);
      await sleep(HIT_MS);
      if (t) t.anim.classList.remove("hit", "flash");
    } else {
      appendMessage(ev.text);
      await sleep(MSG_MS);
    }
  }
}

/* ============================ Actions ============================ */

async function onTargetChosen(name) {
  if (busy) return;
  busy = true;
  hideTargetMenu();
  setMessage([]);

  const attacker = currentFighter();
  const target = catalog.find((c) => c.name === name);
  const R = makeRecorder();

  // Same dispatch as the original game loop: Senku always uses Medusa,
  // everyone else uses their class attack.
  if (attacker.name === "Senku") {
    attacker.petrify(target, R);
  } else {
    attacker.attack(target, R);
  }

  // --- playback: lunge, then one event at a time ---
  activeSprite.classList.add("attacking");
  await sleep(450);
  activeSprite.classList.remove("attacking");

  await playEvents(R.events);
  refreshBars();

  await sleep(END_PAUSE_MS);
  busy = false;
  if (checkVictory()) return;
  nextTurn();
}

async function onHeal() {
  if (busy) return;
  busy = true;
  hideTargetMenu();
  setMessage([]);

  const f = currentFighter();
  const lines = [];
  const healed = f.heal((msg) => lines.push(msg));

  activeSprite.classList.add("healing");
  popText(el("active-sprite-wrap"), "+" + healed, "heal-pop");
  await sleep(800);
  activeSprite.classList.remove("healing");

  refreshBars();
  setMessage(lines);

  await sleep(MSG_MS);
  busy = false;
  nextTurn();
}

async function onAttackPressed() {
  if (busy) return;
  const f = currentFighter();
  if (f.health === 0) {
    // Same as the original: a defeated fighter can't attack, their turn passes.
    busy = true;
    setMessage("They are defeated so therefore can't attack or do anything - end the run or play without this character");
    await sleep(MSG_MS);
    busy = false;
    nextTurn();
    return;
  }
  showTargetMenu();
}

/* Burn/curse now also tick at the start of the afflicted fighter's own
   turn, so the effects are an actual threat every round. */
async function startOfTurnEffects() {
  const f = currentFighter();
  if (f.health === 0) return;
  const R = makeRecorder();

  if (f.burn_turns > 0) {
    f.health = f.health - 3;
    f.burn_turns = f.burn_turns - 1;
    R.hit(f, 3, "burn");
    R.log(`${f.name} lost 3 health to their burn. Turns remaining: ${f.burn_turns}`);
  }
  if (f.curse_turns > 0) {
    f.health = f.health - 4;
    f.curse_turns = f.curse_turns - 1;
    R.hit(f, 4, "curse");
    R.log(`${f.name} lost 4 health to their curse. Turns remaining: ${f.curse_turns}`);
  }
  if (f.health <= 0) {
    f.health = 0;
    R.log(`${f.name} is defeated!`);
  }
  if (R.events.length === 0) return;

  busy = true;
  setMessage([]);
  await playEvents(R.events);
  refreshBars();
  await sleep(END_PAUSE_MS);
  busy = false;
}

/* If only one fighter is left standing, show the victory screen and
   return true (the game ends there). */
function checkVictory() {
  const alive = catalog.filter((f) => f.health > 0);
  if (alive.length !== 1) return false;
  const winner = alive[0];
  battleScreen.hidden = true;
  el("win-sprite").src = SPRITES[winner.name].front;
  el("win-sprite").alt = winner.name;
  el("win-text").textContent = `${winner.name} is the last one standing and wins the battle!`;
  el("win-screen").hidden = false;
  return true;
}

async function nextTurn() {
  // Skip defeated fighters entirely (guard avoids an infinite loop if
  // somehow everyone is at 0 HP).
  let hops = 0;
  do {
    turnIndex = (turnIndex + 1) % catalog.length;
    hops++;
  } while (catalog[turnIndex].health === 0 && hops < catalog.length);
  renderTurn();
  await startOfTurnEffects(); // burn/curse can defeat the incoming fighter
  if (checkVictory()) return;
  setMessage(turnPrompt());
}

/* ============================ Save / Load ============================ */

function saveRun() {
  const data = catalog.map((f) => ({
    name: f.name,
    health: f.health,
    attack_power: f.attack_power,
    burn_turns: f.burn_turns,
    curse_turns: f.curse_turns,
    petrified: f.petrified,
  }));
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadRun() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return false;
  }
  for (const f of catalog) {
    const saved = data.find((d) => d.name === f.name);
    if (saved) { // remakes the characters with the stats saved
      f.health = parseInt(saved.health, 10);
      f.attack_power = parseInt(saved.attack_power, 10);
      f.burn_turns = parseInt(saved.burn_turns, 10);
      f.curse_turns = parseInt(saved.curse_turns, 10);
      f.petrified = parseInt(saved.petrified, 10);
    }
  }
  return true;
}

/* ============================ Screens ============================ */

function showEndScreen() {
  battleScreen.hidden = true;
  el("win-screen").hidden = true;
  endScreen.hidden = false;
  const tbody = el("end-stats-table").querySelector("tbody");
  tbody.innerHTML = catalog
    .map(
      (f) =>
        `<tr><td>${f.name}</td><td>${f.health}</td><td>${f.attack_power}</td><td>${f.burn_turns}</td><td>${f.curse_turns}</td><td>${f.petrified}</td></tr>`
    )
    .join("");
  el("save-feedback").textContent = "";
}

function startBattle() {
  titleScreen.hidden = true;
  endScreen.hidden = true;
  battleScreen.hidden = false;
  turnIndex = 0;
  renderTurn();
}

function buildTitleRoster() {
  const roster = el("title-roster");
  roster.innerHTML = catalog
    .map(
      (f) => `
      <div class="roster-card">
        <img src="${SPRITES[f.name].front}" alt="${f.name}">
        <span class="roster-name">${f.name}</span>
        <span class="roster-class">${CLASS_LABEL[f.name]} &middot; ATK ${f.attack_power}</span>
      </div>`
    )
    .join("");
}

/* ============================ Wiring ============================ */

btnAttack.addEventListener("click", onAttackPressed);
btnHeal.addEventListener("click", onHeal);
btnCancelTarget.addEventListener("click", hideTargetMenu);
btnEnd.addEventListener("click", () => {
  if (busy) return;
  showEndScreen();
});

el("btn-win-continue").addEventListener("click", showEndScreen);

el("btn-new-run").addEventListener("click", () => {
  startBattle();
});

el("btn-load-run").addEventListener("click", () => {
  loadRun();
  startBattle();
});

el("btn-save-run").addEventListener("click", () => {
  saveRun();
  el("save-feedback").textContent = "Run saved! Load it from the title screen next time you play.";
  setTimeout(backToTitle, 1500);
});

el("btn-no-save").addEventListener("click", () => {
  el("save-feedback").textContent = "Not saving run...";
  setTimeout(backToTitle, 1000);
});

function backToTitle() {
  // Fresh characters for the next run (like re-running the script)
  for (const f of catalog) {
    f.health = 100;
    f.burn_turns = 0;
    f.curse_turns = 0;
    f.petrified = 0;
  }
  luffy.attack_power = 35;
  senku.attack_power = 30;
  asta.attack_power = 22;
  thorfinn.attack_power = 20;
  rimuru.attack_power = 36;
  endScreen.hidden = true;
  battleScreen.hidden = true;
  titleScreen.hidden = false;
  el("btn-load-run").hidden = !localStorage.getItem(SAVE_KEY);
}

/* ============================ Boot ============================ */

buildTitleRoster();
el("btn-load-run").hidden = !localStorage.getItem(SAVE_KEY);
