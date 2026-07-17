/* =====================================================================
   Anime Fighter Arena - web version of "OOP Fighter Game.py"
   All mechanics (stats, attacks, status effects, probabilities, heal,
   save/load, turn order) are a faithful 1:1 port of the Python game.
   ===================================================================== */

"use strict";

/* Python's random.randrange(a, b) -> integer in [a, b) */
function randrange(a, b) {
  return Math.floor(Math.random() * (b - a)) + a;
}

const SAVE_KEY = "fighters.json";

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
  applyEffects(enemy, log) {
    if (enemy.burn_turns > 0) {
      enemy.health = enemy.health - 3;
      enemy.burn_turns = enemy.burn_turns - 1;
      log(`${enemy.name} lost an extra 3 health due to being burned. Turns remaining: ${enemy.burn_turns}`);
    }
    if (enemy.curse_turns > 0) {
      enemy.health = enemy.health - 4;
      enemy.curse_turns = enemy.curse_turns - 1;
      log(`${enemy.name} lost an extra 4 health due to being cursed. Turns remaining: ${enemy.curse_turns}`);
    }
    if (this.petrified > 0) {
      this.petrified = this.petrified - 1;
      log(`${this.name} has ${this.petrified} turns left of being partially petrified`);
    }
    if (enemy.health <= 0) {
      enemy.health = 0;
      log(`${enemy.name} is defeated!`);
    }
  }
}

class Swordsman extends Fighter {
  attack(enemy, log) {
    if (this.petrified > 0) { // Character attacking already has petrified status
      const chance = randrange(1, 3);
      if (chance === 1) { // prob of 1/2 of not attacking
        log(`${this.name} couldn't attack due to being petrified!`);
      } else {
        const hits = randrange(1, 3);
        enemy.health = enemy.health - (this.attack_power * hits);
        log(`${this.name} slashed ${enemy.name} ${hits} times`);
      }
    } else if (this.petrified === 0) {
      const hits = randrange(1, 3);
      enemy.health = enemy.health - (this.attack_power * hits);
      log(`${this.name} slashed ${enemy.name} ${hits} times`);
    }
    this.applyEffects(enemy, log);
  }
}

class Mage extends Fighter {
  attack(enemy, log) { // rimuru's attack
    if (this.petrified > 0) { // Character attacking already has petrified status
      const chance = randrange(1, 3);
      if (chance === 1) { // prob of 1/2 of not attacking
        log(`${this.name} couldn't attack due to being petrified!`);
      } else {
        enemy.health = enemy.health - this.attack_power;
        log(`${this.name} used the unique spell Megiddo on ${enemy.name}`);
        if (enemy.curse_turns === 0) {
          const amount = randrange(0, 4); // 3/4 chance of being cursed
          if (amount > 0) {
            enemy.curse_turns = amount;
            log(`${enemy.name} is now cursed for ${amount} turns`);
          }
        }
      }
    } else if (this.petrified === 0) {
      enemy.health = enemy.health - this.attack_power;
      log(`${this.name} used the unique spell Megiddo on ${enemy.name}`);
      if (enemy.curse_turns === 0) {
        const amount = randrange(0, 4);
        if (amount > 0) {
          enemy.curse_turns = amount;
          log(`${enemy.name} is now cursed for ${amount} turns`);
        }
      }
    }
    this.applyEffects(enemy, log);
  }

  // Senku specific attack - can't be petrified himself unless he attacks himself
  petrify(enemy, log) {
    enemy.health = enemy.health - this.attack_power;
    log(`${this.name} spoke 1 meter, 1 second into the petrification device and threw it at ${enemy.name}`);
    if (enemy.petrified === 0) {
      const amount = randrange(0, 4); // 3/4 chance of being petrified
      if (amount > 0) {
        enemy.petrified = amount;
        log(`${enemy.name} is partially petrified for ${amount} turns!`);
      }
    }
    this.applyEffects(enemy, log);
  }
}

class Brawler extends Fighter {
  attack(enemy, log) {
    if (this.petrified > 0) { // Character attacking already has petrified status
      const chance = randrange(1, 3);
      if (chance === 1) { // prob of 1/2 of not attacking
        log(`${this.name} couldn't attack due to being petrified!`);
      } else {
        enemy.health = enemy.health - this.attack_power;
        log(`${this.name} used the attack Red Hawk on ${enemy.name}`);
        if (enemy.burn_turns === 0) {
          const amount = randrange(0, 3); // 2/3 chance of being burned
          if (amount > 0) {
            enemy.burn_turns = amount;
            log(`${enemy.name} is now burned for ${amount} turns!`);
          }
        }
      }
    } else if (this.petrified === 0) {
      enemy.health = enemy.health - this.attack_power;
      log(`${this.name} used the attack Red Hawk on ${enemy.name}`);
      if (enemy.burn_turns === 0) {
        const amount = randrange(0, 3);
        if (amount > 0) {
          enemy.burn_turns = amount;
          log(`${enemy.name} is now burned for ${amount} turns!`);
        }
      }
    }
    this.applyEffects(enemy, log);
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

/* Senku always uses his petrification device in the original game loop;
   everyone else uses their class attack. */
const MOVE_LABEL = {
  Luffy: "Red Hawk",
  Senku: "Petrify Device",
  Asta: "Slash",
  Thorfinn: "Slash",
  Rimuru: "Megiddo",
};

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
      <img class="enemy-sprite" src="${SPRITES[enemy.name].front}" alt="${enemy.name}">
      <div class="mini-panel">
        <div class="mini-name"><span>${enemy.name}</span><span>ATK ${enemy.attack_power}</span></div>
        <div class="mini-hp-bar"><div class="mini-hp-fill" style="width:${Math.max(0, Math.min(100, enemy.health))}%; background:${hpColor(enemy.health)}"></div></div>
        <span class="mini-hp-text">HP ${enemy.health}/100</span>
        <div class="mini-status">${statusChips(enemy)}</div>
      </div>`;
    slot.addEventListener("click", () => onTargetChosen(enemy.name));
    enemyRow.appendChild(slot);
  }
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

function renderTurn() {
  const f = currentFighter();
  renderActivePanel();
  renderEnemyRow();
  hideTargetMenu();
  if (f.health === 0) {
    setMessage([
      `${f.name} | HP: ${f.health} | Attack: ${f.attack_power}`,
      "They are defeated so therefore can't attack or do anything - end the run or play without this character",
    ]);
  } else {
    setMessage([
      `${f.name} | HP: ${f.health} | Attack: ${f.attack_power}`,
      `Who should ${f.name} attack? Attack, heal to recover, or end the run.`,
    ]);
  }
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

/* ============================ Actions ============================ */

async function onTargetChosen(name) {
  if (busy) return;
  busy = true;
  hideTargetMenu();

  const attacker = currentFighter();
  const target = catalog.find((c) => c.name === name);
  const hpBefore = { attacker: attacker.health, target: target.health };
  const lines = [];
  const log = (msg) => lines.push(msg);

  // Same dispatch as the original game loop: Senku always petrifies,
  // everyone else uses their class attack.
  if (attacker.name === "Senku") {
    attacker.petrify(target, log);
  } else {
    attacker.attack(target, log);
  }

  // --- animations ---
  activeSprite.classList.add("attacking");
  await sleep(350);

  const slot = [...enemyRow.children].find((s) => s.dataset.name === name);
  const targetDamage = hpBefore.target - target.health;
  if (targetDamage > 0 && slot) {
    slot.classList.add("hit", "flash");
    popText(slot, "-" + targetDamage, "");
  } else if (slot) {
    popText(slot, "MISS", "status-pop");
  }
  const selfDamage = hpBefore.attacker - attacker.health; // burn/curse ticking on the attacker never happens here, but petrify count does
  if (selfDamage > 0) {
    popText(el("active-sprite-wrap"), "-" + selfDamage, "");
  }

  await sleep(450);
  activeSprite.classList.remove("attacking");
  if (slot) slot.classList.remove("hit", "flash");

  refreshBars();
  setMessage(lines);

  await sleep(1400);
  busy = false;
  nextTurn();
}

async function onHeal() {
  if (busy) return;
  busy = true;
  hideTargetMenu();

  const f = currentFighter();
  const lines = [];
  const healed = f.heal((msg) => lines.push(msg));

  activeSprite.classList.add("healing");
  popText(el("active-sprite-wrap"), "+" + healed, "heal-pop");
  await sleep(800);
  activeSprite.classList.remove("healing");

  refreshBars();
  setMessage(lines);

  await sleep(1200);
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
    await sleep(1400);
    busy = false;
    nextTurn();
    return;
  }
  showTargetMenu();
}

function nextTurn() {
  turnIndex = (turnIndex + 1) % catalog.length;
  renderTurn();
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
