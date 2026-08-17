# Hydrostatika

Interaktivní simulace hydrostatiky.

**Online verze:** https://frantisekvvb.github.io/hydrostatika/

**Záložní odkaz (funguje hned):** https://cdn.jsdelivr.net/gh/FrantisekVvb/hydrostatika@main/index.html

Pokud GitHub Pages ještě neběží, v repozitáři jednou zapni **Settings → Pages → Deploy from a branch → `gh-pages` → `/ (root)`**. Po pushi na `main` se větev `gh-pages` vytvoří automaticky.

## Spuštění lokálně

Potřebuješ [Node.js](https://nodejs.org/) 18 nebo novější.

### Terminál

```bash
cd /Users/Frantisek/dev2/hydrostatika
npm start
```

Aplikace poběží na adrese **http://localhost:3481**. Po uložení změn v HTML, CSS, JS nebo SVG se stránka automaticky obnoví.

Pokud je port obsazený:

```bash
PORT=3490 npm start
```

### macOS — dvojklik

Ve Finderu spusť soubor **`spustit.command`**.

### Otevření bez serveru

Soubor **`index.html`** lze otevřít přímo v prohlížeči.
