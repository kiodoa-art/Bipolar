const $ = (s, r=document) => r.querySelector(s);
const store = {
  get:k => JSON.parse(localStorage.getItem('mbg_'+k) || 'null'),
  set:(k,v) => localStorage.setItem('mbg_'+k, JSON.stringify(v))
};
let state = store.get('state') || {view:'home', chapter:0, slide:0};
let data = store.get('data') || {notes:{}, done:{}, plan:{dep:[], man:[], helps:'', contacts:'', acute:''}, timeline:[]};
function save(){ store.set('state', state); store.set('data', data); }
function pct(){ return Math.round(Object.keys(data.done||{}).length / CHAPTERS.length * 100); }
function currentProgress(){ const done = Object.keys(data.done||{}).length; return `${done} af ${CHAPTERS.length} kapitler`; }
function iconSVG(type='sun'){
return `<svg viewBox="0 0 200 150" aria-hidden="true"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#8d3145"/><stop offset="1" stop-color="#d8b56d"/></linearGradient></defs><circle cx="100" cy="61" r="34" fill="url(#g)" opacity=".95"/><path d="M16 123c30-31 55-38 78-20 20 16 41 16 68-16 10 13 18 25 22 36z" fill="#4b1d27" opacity=".22"/><path d="M26 119c36-23 62-23 88 0 20 18 41 17 61-2" fill="none" stroke="#4b1d27" stroke-width="10" stroke-linecap="round" opacity=".38"/><circle cx="45" cy="45" r="6" fill="#4b1d27" opacity=".25"/><circle cx="157" cy="41" r="8" fill="#4b1d27" opacity=".18"/></svg>`
}
function shell(content, active='home'){
 return `<main class="app"><div class="topbar"><div class="brand"><div class="logo">🧠</div><div>Min Bipolar Guide</div></div><button class="pill" data-action="reset">Nulstil</button></div>${content}</main><nav class="bottomnav"><button class="${active==='home'?'active':''}" data-go="home">Hjem</button><button class="${active==='chapters'?'active':''}" data-go="chapters">Forløb</button><button class="${active==='tools'?'active':''}" data-go="tools">Værktøjer</button></nav>`;
}
function render(){
 if(state.view==='chapter') return renderChapter();
 if(state.view==='chapters') return renderChapters();
 if(state.view==='tools') return renderTools();
 renderHome();
}
function renderHome(){
 const p = pct();
 $('#app').innerHTML = shell(`<section class="hero"><h1>Min Bipolar Guide</h1><p class="lead">Psykoedukation i lommen. Kort, roligt og skrevet til patienter — ikke som en bunke papirer.</p><div class="hero-actions"><button class="btn gold" data-action="continue">▶ Fortsæt</button><button class="btn secondary" data-go="chapters">Se kapitler</button></div></section><section class="progress-card"><b>${currentProgress()}</b><div class="bar" style="margin-top:8px"><span style="width:${p}%"></span></div><small>${p}% gennemført</small></section><section class="grid"><article class="card" data-open="0"><div class="emoji">📖</div><h3>Start forløbet</h3><small>15 korte kapitler</small></article><article class="card" data-open="0"><div class="emoji">❤️</div><h3>Recovery</h3><small>Håb og handlekraft</small></article><article class="card" data-open="1"><div class="emoji">⚡</div><h3>Symptomer</h3><small>Depression, hypomani og mani</small></article><article class="card" data-open="5"><div class="emoji">💊</div><h3>Behandling</h3><small>Medicin og samarbejde</small></article><article class="card" data-open="10"><div class="emoji">🌙</div><h3>Søvn</h3><small>Døgnrytme og stabilitet</small></article><article class="card" data-go="tools"><div class="emoji">🛠️</div><h3>Min plan</h3><small>Tegn og handlemuligheder</small></article></section>`, 'home');
 bind();
}
function renderChapters(){
 const list = CHAPTERS.map((c,i)=>`<article class="card chapter-card ${data.done[c.id]?'done':''}" data-open="${i}"><div class="num">${data.done[c.id]?'✓':i+1}</div><div><h3>${c.emoji} ${c.title}</h3><small>${c.slides.length} slides</small></div></article>`).join('');
 $('#app').innerHTML = shell(`<h2 class="page-title">Forløbet</h2><p class="lead" style="color:#eadcc8">Gå igennem kapitlerne i dit eget tempo. Alt gemmes lokalt på telefonen.</p><section class="chapter-list">${list}</section>`, 'chapters');
 bind();
}
function renderChapter(){
 const c = CHAPTERS[state.chapter]; const s = c.slides[state.slide];
 const noteKey = `${c.id}_${state.slide}`;
 const type = s[2] || 'text';
 let body = `<p>${s[1]}</p>`;
 if(type==='bullets') body = `<p>${s[1]}</p><ul>${(s[3]||'').split('|').map(x=>`<li>${x}</li>`).join('')}</ul>`;
 if(type==='note') body = `<p>${s[1]}</p><div class="noteBox"><label>✍️ ${s[3]||'Mine noter'}</label><textarea data-note="${noteKey}" placeholder="Skriv her...">${data.notes[noteKey]||''}</textarea></div>`;
 const sp = Math.round((state.slide+1)/c.slides.length*100);
 $('#app').innerHTML = `<main class="app slide-wrap"><div class="slide-meta"><button class="pill" data-go="chapters">← Kapitler</button><div class="dots">${state.slide+1} / ${c.slides.length}</div></div><div class="bar" style="margin-bottom:12px"><span style="width:${sp}%"></span></div><section class="slide"><div><div class="illus">${iconSVG()}</div><small style="font-weight:900;color:#8d3145">Kapitel ${state.chapter+1}: ${c.title}</small><h2>${s[0]}</h2>${body}</div></section><div class="navrow"><button class="btn secondary" data-action="prev" ${state.slide===0?'disabled':''}>← Forrige</button><button class="btn gold" data-action="next">${state.slide===c.slides.length-1?'Afslut kapitel':'Næste →'}</button></div></main>`;
 bind();
}
function renderTools(){
 const dep = DEFAULT_DEPRESSION.map(x=>check('dep',x)).join('');
 const man = DEFAULT_MANIA.map(x=>check('man',x)).join('');
 const tl = (data.timeline||[]).map((it,i)=>`<div class="timelineItem"><input data-tl="year" data-i="${i}" value="${it.year||''}" placeholder="År"><input data-tl="text" data-i="${i}" value="${it.text||''}" placeholder="Hvad skete der?"><button class="pill" data-del-tl="${i}">×</button></div>`).join('');
 $('#app').innerHTML = shell(`<h2 class="page-title">Værktøjer</h2><section class="tool"><h3>🚦 Mine tegn på depression</h3><div class="checkgrid">${dep}</div></section><section class="tool"><h3>⚡ Mine tegn på hypomani/mani</h3><div class="checkgrid">${man}</div></section><section class="tool"><h3>🛠️ Min handleplan</h3>${field('helps','Hvad hjælper mig?')}${field('contacts','Hvem kan jeg kontakte?')}${field('acute','Hvornår skal jeg søge akut hjælp?')}</section><section class="tool"><h3>🧭 Min livslinje</h3><p style="color:#6d5455;margin-top:6px">Skriv vigtige perioder, episoder, belastninger eller vendepunkter.</p><div id="timeline">${tl}</div><button class="btn" data-action="addTimeline" style="margin-top:12px">+ Tilføj punkt</button></section>`, 'tools');
 bind();
}
function check(kind,label){ const arr=data.plan[kind]||[]; const checked=arr.includes(label)?'checked':''; return `<label class="check"><input type="checkbox" data-check="${kind}" value="${label}" ${checked}><span>${label}</span></label>` }
function field(key,label){ return `<div class="field"><label><b>${label}</b><textarea data-plan="${key}" placeholder="Skriv her...">${data.plan[key]||''}</textarea></label></div>`; }
function bind(){
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.view=b.dataset.go; save(); render();});
 document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{state.view='chapter'; state.chapter=+b.dataset.open; state.slide=0; save(); render();});
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));
 document.querySelectorAll('[data-note]').forEach(t=>t.oninput=()=>{data.notes[t.dataset.note]=t.value; save();});
 document.querySelectorAll('[data-plan]').forEach(t=>t.oninput=()=>{data.plan[t.dataset.plan]=t.value; save();});
 document.querySelectorAll('[data-check]').forEach(ch=>ch.onchange=()=>{const k=ch.dataset.check; data.plan[k]=data.plan[k]||[]; if(ch.checked&&!data.plan[k].includes(ch.value)) data.plan[k].push(ch.value); if(!ch.checked) data.plan[k]=data.plan[k].filter(x=>x!==ch.value); save();});
 document.querySelectorAll('[data-tl]').forEach(inp=>inp.oninput=()=>{const i=+inp.dataset.i; data.timeline[i]=data.timeline[i]||{}; data.timeline[i][inp.dataset.tl]=inp.value; save();});
 document.querySelectorAll('[data-del-tl]').forEach(btn=>btn.onclick=()=>{data.timeline.splice(+btn.dataset.delTl,1); save(); renderTools();});
}
function action(a){
 if(a==='continue'){ state.view='chapter'; state.chapter=state.chapter||0; state.slide=state.slide||0; }
 if(a==='prev' && state.slide>0) state.slide--;
 if(a==='next'){
   const c=CHAPTERS[state.chapter];
   if(state.slide < c.slides.length-1) state.slide++;
   else { data.done[c.id]=true; state.view='chapters'; }
 }
 if(a==='addTimeline'){ data.timeline.push({year:'',text:''}); }
 if(a==='reset' && confirm('Nulstil alle noter, fremskridt og planer?')){ localStorage.removeItem('mbg_state'); localStorage.removeItem('mbg_data'); state={view:'home',chapter:0,slide:0}; data={notes:{},done:{},plan:{dep:[],man:[],helps:'',contacts:'',acute:''},timeline:[]}; }
 save(); render();
}
window.addEventListener('load', ()=>{render(); if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');});
let deferredPrompt; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')}); $('#installBtn')?.addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt=null; $('#installBtn').classList.add('hidden'); });
