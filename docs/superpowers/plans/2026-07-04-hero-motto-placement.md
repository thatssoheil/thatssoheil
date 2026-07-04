# Hero Motto Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the hero motto into a lower grid-caption position while keeping it centered, quiet, and aligned with the hero/grid axis.

**Architecture:** This is a single-component spacing adjustment in the hero lockup. The motto remains in `HeroSection`; only its responsive vertical offset changes, preserving the existing eyebrow, name, grid, and page structure.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS utility classes, existing browser geometry checks through Chrome DevTools protocol.

## Global Constraints

- Keep the motto text and font-size aligned with the hero eyebrow.
- Preserve the motto as a single centered line.
- Move the motto downward enough that it reads as an architectural annotation, not a subtitle.
- Keep the motto above the scroll cue so the bottom of the hero does not feel crowded.
- Keep the motto visually quieter than the name and eyebrow; do not add new accent color.
- Do not change the name size, eyebrow layout, grid rail placement, header, or section spacing.
- Maintain no horizontal overflow on narrow mobile widths.

---

### Task 1: Lower The Hero Motto Into A Grid Caption

**Files:**
- Modify: `src/components/sections/hero.tsx`

**Interfaces:**
- Consumes: Existing `HeroSection` markup and Tailwind classes.
- Produces: A hero motto paragraph with increased responsive top margin, same font-size clamp as the eyebrow, and no text/content changes.

- [ ] **Step 1: Record the current motto geometry**

Run this browser geometry check against the local dev server:

```bash
node <<'NODE'
const http = require('http');
function get(path){return new Promise((resolve,reject)=>http.get({host:'127.0.0.1',port:9227,path},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve(JSON.parse(d)));}).on('error',reject));}
function once(ws, id){return new Promise((resolve,reject)=>{const on=(event)=>{const msg=JSON.parse(event.data); if(msg.id===id){ws.removeEventListener('message',on); msg.error?reject(JSON.stringify(msg.error)):resolve(msg.result);}}; ws.addEventListener('message',on);});}
(async()=>{const tabs=await get('/json'); const tab=tabs.find(t=>t.url.includes('localhost:3000'))||tabs[0]; const ws=new WebSocket(tab.webSocketDebuggerUrl); let id=0; const send=(method,params={})=>{const i=++id; ws.send(JSON.stringify({id:i,method,params})); return once(ws,i);}; ws.addEventListener('open',async()=>{await send('Page.enable'); await send('Runtime.enable'); for (const [w,h,mobile] of [[390,844,true],[768,1024,true],[1440,900,false]]) { await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:mobile?2:1,mobile}); await send('Page.navigate',{url:'http://localhost:3000/'}); await new Promise(r=>setTimeout(r,900)); const {result}=await send('Runtime.evaluate',{returnByValue:true,expression:`(() => { const ps=[...document.querySelectorAll('#hero p')]; const eyebrow=ps.find(el=>el.textContent.includes('Frontend Engineer')); const motto=ps.find(el=>el.textContent.includes('Coding vision')); const cue=document.querySelector('#hero button[aria-label="Scroll to content"]'); const er=eyebrow.getBoundingClientRect(); const mr=motto.getBoundingClientRect(); const cr=cue.getBoundingClientRect(); return {viewport:'${w}x${h}', eyebrowFont:getComputedStyle(eyebrow).fontSize, mottoFont:getComputedStyle(motto).fontSize, nameToMottoGap:+(mr.top-document.querySelector('#hero h1').getBoundingClientRect().bottom).toFixed(2), mottoCenter:+((mr.left+mr.right)/2).toFixed(2), pageCenter:+(document.documentElement.clientWidth/2).toFixed(2), mottoToCueGap:+(cr.top-mr.bottom).toFixed(2), mottoOverflow:+Math.max(0, mr.width-document.documentElement.clientWidth).toFixed(2), eyebrowTop:+er.top.toFixed(2), mottoTop:+mr.top.toFixed(2)} })()`}); console.log(JSON.stringify(result.value,null,2)); } ws.close();});})();
NODE
```

Expected: command prints geometry for mobile, tablet, and desktop. Record mentally that `mottoFont` equals `eyebrowFont`; this must remain true.

- [ ] **Step 2: Move the motto downward**

In `src/components/sections/hero.tsx`, replace the motto paragraph class:

```tsx
<p className="mt-4 whitespace-nowrap font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] leading-none tracking-[0.16em] sm:tracking-[0.18em] uppercase text-text-faint">
	Coding vision into existence
</p>
```

with:

```tsx
<p className="mt-10 whitespace-nowrap font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] leading-none tracking-[0.16em] text-text-faint uppercase sm:mt-12 sm:tracking-[0.18em] md:mt-14">
	Coding vision into existence
</p>
```

- [ ] **Step 3: Verify geometry after the change**

Run the Step 1 browser geometry check again.

Expected:
- `mottoFont` equals `eyebrowFont` for every viewport.
- `mottoCenter` equals `pageCenter` within 0.5px.
- `mottoOverflow` is `0`.
- `mottoToCueGap` is positive for every viewport, so the motto remains above the scroll cue.
- `nameToMottoGap` is larger than before, so the motto reads as a lower caption instead of a subtitle.

- [ ] **Step 4: Run repo checks**

```bash
pnpm test
git diff --check
```

Expected:
- `pnpm test` exits 0. Existing eslint resolver warnings about `TSSatisfiesExpression` may print.
- `git diff --check` exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/hero.tsx
git commit -m "style(hero): lower motto as grid caption"
```

Expected: one commit touching only `src/components/sections/hero.tsx`.
