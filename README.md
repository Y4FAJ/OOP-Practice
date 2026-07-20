# Anime Fighter Arena

A web version of the original terminal game (`OOP Fighter Game.py`). Same five fighters, same attacks, same status effects, same numbers — now with a battle screen, custom pixel-art sprites, and Pokemon-style back views when a character attacks.

## Play it

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Host it on GitHub Pages

1. Push this branch to GitHub.
2. In the repository, go to **Settings > Pages**.
3. Under **Build and deployment**, pick **Deploy from a branch**, choose this branch and the `/ (root)` folder, then save.
4. Your game will be live at `https://<your-username>.github.io/<repo-name>/`.

## How it plays (identical to the Python game)

- Fighters take turns in a fixed order: Luffy, Senku, Asta, Thorfinn, Rimuru.
- On your turn you can **attack** (then pick a target by clicking their button or their sprite), **heal**, or **end the run**.
- The fighter whose turn it is appears from behind (back sprite), facing the others — just like the player's Pokemon.

### Fighters

| Fighter | Class | HP | Attack | Move |
|---|---|---|---|---|
| Luffy | Brawler | 100 | 35 | Red Hawk — 2/3 chance to burn (1–2 turns) |
| Senku | Mage | 100 | 30 | Medusa — 2/4 chance to petrify (1–3 turns) |
| Asta | Swordsman | 100 | 22 | Slash — hits 1–2 times |
| Thorfinn | Swordsman | 100 | 20 | Slash — hits 1–2 times |
| Rimuru | Mage | 100 | 36 | Megiddo — 3/4 chance to curse (1–3 turns) |

### Status effects

- **Burn**: lose 3 extra HP at the start of your own turn and whenever you are attacked, for the remaining turns.
- **Curse**: lose 4 extra HP at the start of your own turn and whenever you are attacked, for the remaining turns.
- **Petrify**: 2/4 chance your attack fails while petrified (ticks down when you attack).

### Other rules

- **Heal** restores half of your current HP, capped at 100.
- A fighter at 0 HP is defeated and their turn is skipped automatically; the run continues with the remaining fighters.
- When only one fighter is left standing, a victory screen declares the winner, then takes you to the save / new run page.
- **End Run** shows everyone's final stats and lets you save them. Saved runs are stored in your browser (localStorage) and can be loaded from the title screen — the web equivalent of the original `fighters.json` save file.

## Files

- `index.html`, `css/style.css`, `js/game.js` — the web game
- `assets/` — custom pixel-art sprites (front + back for each fighter) and the battle background
- `OOP Fighter Game.py`, `fighters.json` — the original terminal game, kept unchanged
