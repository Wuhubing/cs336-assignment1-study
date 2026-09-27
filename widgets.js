/* Small offline interactive visualizations. Each widget renders into its container and keeps its own state.
   All numbers are toy examples for intuition, not assignment outputs. */
(()=>{
'use strict';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const softmax=z=>{const m=Math.max(...z.filter(Number.isFinite));const e=z.map(v=>Number.isFinite(v)?Math.exp(v-m):0);const s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s)};
const fmt=(v,d=2)=>Number.isFinite(v)?v.toFixed(d):'∞';
const shell=(title,lede,body)=>`<div class="widget-head"><span class="widget-kicker">Try it</span><strong>${esc(title)}</strong><p>${esc(lede)}</p></div>${body}<p class="widget-note">Toy numbers for intuition — not assignment outputs.</p>`;

/* Cross-entropy: drag logits, pick the target, watch probability, loss and perplexity. */
function crossEntropy(root){
  const vocab=['the','cat','sat','on','mat'];
  const presets={start:[0.2,2.6,0.9,0.1,1.2],uniform:[1,1,1,1,1],right:[0,7,0,0,0],wrong:[0,-2,0,0,7]};
  let z=[...presets.start],target=1;
  root.innerHTML=shell('One prediction, one loss','Drag logits or click a token to make it the target. The loss only looks at the target’s probability.',
   `<div class="ce-context">Context <code>“the”</code> → next token?</div><div class="ce-rows" role="group" aria-label="Vocabulary logits"></div>
    <div class="widget-presets"><button type="button" data-p="uniform">Uniform guess</button><button type="button" data-p="right">Confident &amp; right</button><button type="button" data-p="wrong">Confident &amp; wrong</button><button type="button" data-p="start">Reset</button></div>
    <div class="ce-readout" aria-live="polite"></div>`);
  const rows=root.querySelector('.ce-rows'),out=root.querySelector('.ce-readout');
  rows.innerHTML=vocab.map((t,i)=>`<div class="ce-row" data-i="${i}"><button type="button" class="ce-token" aria-pressed="false">${t}</button><input type="range" min="-4" max="8" step="0.1" aria-label="logit for ${t}"><span class="ce-logit mono"></span><div class="ce-bar"><span></span></div><span class="ce-p mono"></span></div>`).join('');
  const draw=()=>{const p=softmax(z);const lse=Math.log(z.reduce((a,v)=>a+Math.exp(v-Math.max(...z)),0))+Math.max(...z);const loss=lse-z[target];
    rows.querySelectorAll('.ce-row').forEach((r,i)=>{const on=i===target;r.classList.toggle('is-target',on);r.querySelector('.ce-token').setAttribute('aria-pressed',on);r.querySelector('input').value=z[i];r.querySelector('.ce-logit').textContent=(z[i]>=0?'+':'')+z[i].toFixed(1);r.querySelector('.ce-bar span').style.width=(p[i]*100).toFixed(1)+'%';r.querySelector('.ce-p').textContent=p[i].toFixed(3)});
    const level=loss<0.3?'good':loss<1.6?'ok':'bad';
    out.innerHTML=`<div><small>p(target)</small><strong class="mono">${p[target].toFixed(3)}</strong></div><div><small>loss ℓ = −log p</small><strong class="mono tone-${level}">${fmt(loss,3)}</strong></div><div><small>perplexity e<sup>ℓ</sup></small><strong class="mono">${fmt(Math.exp(loss),2)}</strong></div>
      <p class="ce-lse mono">stable form: logsumexp(o) − o[target] = ${lse.toFixed(3)} − (${z[target].toFixed(1)}) = ${loss.toFixed(3)}</p>
      <p class="ce-hint">${level==='bad'?'The model gave the true token little probability, so the surprise is large.':level==='good'?'Almost all probability sits on the true token: loss near 0, perplexity near 1.':`For reference, a uniform guess over ${vocab.length} tokens gives ℓ = log ${vocab.length} ≈ ${Math.log(vocab.length).toFixed(2)} and perplexity ${vocab.length}.`}</p>`};
  rows.addEventListener('input',e=>{const r=e.target.closest('.ce-row');if(!r)return;z[+r.dataset.i]=+e.target.value;draw()});
  rows.addEventListener('click',e=>{if(!e.target.classList.contains('ce-token'))return;target=+e.target.closest('.ce-row').dataset.i;draw()});
  root.querySelector('.widget-presets').addEventListener('click',e=>{const k=e.target.dataset?.p;if(!k)return;z=[...presets[k]];draw()});
  draw();
}

/* Attention: pick a head pattern, toggle the causal mask, sharpen scores, inspect one query row. */
function attention(root){
  const toks=['the','cat','sat','on','the','mat'],n=toks.length;
  const noise=(i,j)=>((i*7+j*13)%5)/10;
  const heads={
    previous:{label:'Previous-token head',score:(i,j)=>j===i-1?3:j===i?1:noise(i,j)},
    same:{label:'Same-word head',score:(i,j)=>toks[i]===toks[j]?2.6:noise(i,j)},
    content:{label:'Content head',score:(i,j)=>([[1,0,0,0,0,0],[0.4,2,0,0,0,0],[0.2,2.4,1,0,0,0],[0,0.6,2.2,0.8,0,0],[1.5,0.3,0.2,0.6,1,0],[0.3,1.8,0.6,1.4,0.9,1]][i][j])}
  };
  let head='previous',causal=true,scale=1,q=5;
  root.innerHTML=shell('Attention weights, live','Rows are queries, columns are keys. Click a row to see how that token mixes the values.',
   `<div class="widget-controls"><div class="seg" role="group" aria-label="Head pattern">${Object.entries(heads).map(([k,h])=>`<button type="button" data-h="${k}">${h.label}</button>`).join('')}</div>
    <label class="check"><input type="checkbox" checked data-causal> causal mask</label>
    <label class="slider">score scale <input type="range" min="0.2" max="4" step="0.1" value="1" data-scale><span class="mono"></span></label></div>
    <div class="attn-layout"><div class="attn-grid" role="group" aria-label="Attention weight matrix"></div><div class="attn-detail" aria-live="polite"></div></div>`);
  const grid=root.querySelector('.attn-grid'),detail=root.querySelector('.attn-detail');
  const weights=()=>toks.map((_,i)=>softmax(toks.map((_,j)=>causal&&j>i?-Infinity:heads[head].score(i,j)*scale)));
  const draw=()=>{const W=weights();
    root.querySelectorAll('[data-h]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.h===head));
    root.querySelector('.slider span').textContent='×'+scale.toFixed(1);
    grid.style.setProperty('--n',n);
    grid.innerHTML=`<span></span>${toks.map(t=>`<span class="attn-col">${t}</span>`).join('')}`+W.map((row,i)=>`<button type="button" class="attn-rowlabel${i===q?' is-q':''}" data-q="${i}">${toks[i]}</button>`+row.map((w,j)=>{const masked=causal&&j>i;return `<span class="attn-cell${masked?' masked':''}${i===q?' is-q':''}" style="--w:${w.toFixed(3)}" data-q="${i}" title="query ${toks[i]} → key ${toks[j]}: ${w.toFixed(2)}">${masked?'':w.toFixed(2).replace(/^0/,'')}</span>`}).join('')).join('');
    const row=W[q];
    detail.innerHTML=`<small>query <strong>“${toks[q]}”</strong> (position ${q+1}) mixes:</small>${row.map((w,j)=>`<div class="attn-bar${causal&&j>q?' masked':''}"><span>${toks[j]}<sub>${j+1}</sub></span><i style="width:${(w*100).toFixed(1)}%"></i><b class="mono">${w.toFixed(2)}</b></div>`).join('')}
      <p class="mono">out = ${row.map((w,j)=>w>0.005?`${w.toFixed(2)}·v${j+1}`:'').filter(Boolean).join(' + ')}</p>
      ${causal?'':'<p class="warn">Without the mask, early tokens can read later ones — the model would see the answer it is supposed to predict.</p>'}
      <p>${scale>1.6?'Large scores make softmax nearly one-hot.':scale<0.6?'Small scores flatten attention toward uniform.':'Dividing by √d_k keeps scores in this moderate range.'}</p>`};
  root.addEventListener('click',e=>{const h=e.target.closest('[data-h]');if(h){head=h.dataset.h;draw();return}const c=e.target.closest('[data-q]');if(c){q=+c.dataset.q;draw()}});
  root.querySelector('[data-causal]').addEventListener('change',e=>{causal=e.target.checked;draw()});
  root.querySelector('[data-scale]').addEventListener('input',e=>{scale=+e.target.value;draw()});
  draw();
}


/* ---------- shared toy BPE (byte-level, GPT-2-style pre-tokenizer, lexicographically-greater tie-break) ---------- */
const PRETOK=/'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:false});
const showBytes=b=>{const t=dec.decode(new Uint8Array(b));return /�/.test(t)?b.map(x=>x.toString(16).toUpperCase().padStart(2,'0')).join(' '):t.replace(/ /g,'␠').replace(/\n/g,'↵')};
function bpeCounts(words){const pc=new Map();for(const w of words){const s=w.seq;for(let i=0;i<s.length-1;i++){const k=s[i]+'\u0001'+s[i+1];pc.set(k,(pc.get(k)||0)+w.count)}}return pc}
function bpeBest(pc){let best=null;for(const [k,c] of pc){if(!best||c>best[1]||(c===best[1]&&k.split('\u0001')>best[0].split('\u0001')))best=[k,c]}return best}
function applyMerge(seq,a,b){const o=[];for(let i=0;i<seq.length;i++){if(i<seq.length-1&&seq[i]===a&&seq[i+1]===b){o.push(a+b);i++}else o.push(seq[i])}return o}

/* UTF-8 explorer: type text, see code points and bytes. */
function utf8(root){
  root.innerHTML=shell('Type anything, see its bytes','Each character becomes one code point and 1–4 UTF-8 bytes. Try an accent, Chinese, or an emoji.',
   `<div class="widget-controls"><input class="u8-input" type="text" value="héllo 中文 🙂" aria-label="Text to encode" spellcheck="false"><label class="check"><input type="checkbox" data-nfd> decompose accents (NFD)</label></div><div class="u8-cells" aria-live="polite"></div><div class="u8-sum"></div>`);
  const input=root.querySelector('.u8-input'),cells=root.querySelector('.u8-cells'),sum=root.querySelector('.u8-sum'),nfd=root.querySelector('[data-nfd]');
  const draw=()=>{const text=nfd.checked?input.value.normalize('NFD'):input.value.normalize('NFC');const cps=[...text];let bytes=0,u16=0;
    cells.innerHTML=cps.map(ch=>{const cp=ch.codePointAt(0);const b=[...enc.encode(ch)];bytes+=b.length;u16+=ch.length;const combining=/\p{M}/u.test(ch);return `<div class="u8-cell n${b.length}"><span class="u8-glyph">${combining?'◌'+esc(ch):ch===' '?'␠':esc(ch)}</span><span class="u8-cp mono">U+${cp.toString(16).toUpperCase().padStart(4,'0')}</span><span class="u8-bytes">${b.map(x=>`<i class="mono">${x.toString(16).toUpperCase().padStart(2,'0')}</i>`).join('')}</span></div>`}).join('');
    sum.innerHTML=`<span><strong>${cps.length}</strong> code points</span><span><strong>${bytes}</strong> UTF-8 bytes</span><span><strong>${u16}</strong> UTF-16 units</span><span class="u8-key"><i class="n1"></i>1 byte <i class="n2"></i>2 <i class="n3"></i>3 <i class="n4"></i>4</span>`};
  input.addEventListener('input',draw);nfd.addEventListener('change',draw);draw();
}

/* BPE trainer: step through merges on an editable toy corpus. */
function bpeTrain(root){
  const start='low low low low low lower lower widest widest widest newest newest newest newest newest newest';
  let words,merges,pc;
  root.innerHTML=shell('Train BPE one merge at a time','The handout’s toy corpus, split on spaces. Edit it, then step through merges and watch the pair counts change.',
   `<textarea class="bpe-corpus mono" rows="2" aria-label="Training corpus" spellcheck="false">${start}</textarea>
    <div class="widget-presets"><button type="button" data-step="1">Next merge →</button><button type="button" data-step="5">+5 merges</button><button type="button" data-reset>Reset</button></div>
    <div class="bpe-layout"><div><small class="w-label">pre-tokens × count</small><div class="bpe-words"></div></div><div><small class="w-label">top pair counts</small><div class="bpe-pairs"></div></div><div><small class="w-label">merge list</small><ol class="bpe-merges"></ol></div></div>`);
  const $=q=>root.querySelector(q);
  const reset=()=>{const counts=new Map();for(const w of $('.bpe-corpus').value.split(/\s+/).filter(Boolean))counts.set(w,(counts.get(w)||0)+1);words=[...counts].map(([w,count])=>({w,count,seq:[...w]}));merges=[];draw()};
  const step=n=>{for(let i=0;i<n;i++){const best=bpeBest(bpeCounts(words));if(!best)break;const [a,b]=best[0].split('\u0001');merges.push([a,b,best[1]]);words.forEach(w=>w.seq=applyMerge(w.seq,a,b))}draw()};
  const draw=()=>{pc=bpeCounts(words);const best=bpeBest(pc);const top=[...pc].sort((x,y)=>y[1]-x[1]||(x[0].split('\u0001')<y[0].split('\u0001')?1:-1)).slice(0,7);const max=top[0]?.[1]||1;
    $('.bpe-words').innerHTML=words.map(w=>`<div class="bpe-word">${w.seq.map(t=>`<span class="tok${t.length>1?' merged':''}">${esc(t)}</span>`).join('')}<b class="mono">×${w.count}</b></div>`).join('');
    $('.bpe-pairs').innerHTML=top.length?top.map(([k,c])=>{const [a,b]=k.split('\u0001');const win=best&&k===best[0];const tie=!win&&best&&c===best[1];return `<div class="bpe-pair${win?' win':''}${tie?' tie':''}"><span class="mono">${esc(a)} ${esc(b)}</span><i style="width:${(c/max*100).toFixed(0)}%"></i><b class="mono">${c}</b></div>`}).join('')+(top.some(([k,c])=>best&&k!==best[0]&&c===best[1])?'<p class="w-note">Tie: the lexicographically greater pair wins.</p>':''):'<p class="w-note">Nothing left to merge.</p>';
    $('.bpe-merges').innerHTML=merges.map(([a,b,c],i)=>`<li${i===merges.length-1?' class="new"':''}><span class="mono">${esc(a)} ${esc(b)}</span><small class="mono">id ${256+i}</small></li>`).join('')||'<li class="empty">no merges yet</li>'};
  root.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)step(+b.dataset.step);if(e.target.closest('[data-reset]'))reset()});
  $('.bpe-corpus').addEventListener('change',reset);
  reset();
}

/* Toy tokenizer: learn a few hundred merges from a small built-in text, then encode whatever you type. */
function tokenizer(root){
  const corpus=`Once upon a time there was a little fox. The fox liked to play in the forest with her friends. One day the little fox found a shiny red ball. She wanted to share the ball with everyone. The friends played together and they were very happy. At the end of the day the fox went home and said thank you to the sun.`.repeat(3);
  const special='<|endoftext|>';
  const counts=new Map();for(const m of corpus.match(PRETOK))counts.set(m,(counts.get(m)||0)+1);
  const words=[...counts].map(([w,count])=>({count,seq:[...enc.encode(w)].map(b=>String.fromCharCode(b))}));
  const merges=new Map();for(let i=0;i<220;i++){const best=bpeBest(bpeCounts(words));if(!best||best[1]<2)break;const [a,b]=best[0].split('\u0001');merges.set(a+'\u0001'+b,i);words.forEach(w=>w.seq=applyMerge(w.seq,a,b))}
  const nMerges=merges.size;
  const vocabId=new Map();[...merges.keys()].forEach((k,i)=>vocabId.set(k.replace('\u0001',''),256+i));
  const encodeWord=w=>{let seq=[...enc.encode(w)].map(b=>String.fromCharCode(b));for(;;){let best=null;for(let i=0;i<seq.length-1;i++){const r=merges.get(seq[i]+'\u0001'+seq[i+1]);if(r!==undefined&&(best===null||r<best[0]))best=[r,i]}if(!best)break;seq=applyMerge(seq,seq[best[1]],seq[best[1]+1])}return seq};
  const idOf=t=>t.length===1?t.charCodeAt(0):vocabId.get(t);
  root.innerHTML=shell('Encode your own text','A toy tokenizer trained on one short story paragraph (≈'+nMerges+' merges). Words it saw often become single tokens; unfamiliar text falls back to bytes.',
   `<textarea class="tok-input" rows="2" aria-label="Text to tokenize" spellcheck="false">The little fox played with a ball.${special}Zebras juggle 中文!</textarea><div class="widget-controls"><label class="check"><input type="checkbox" checked data-special> treat ${esc(special)} as special</label><label class="check"><input type="checkbox" data-ids> show IDs</label></div><div class="tok-out" aria-live="polite"></div><div class="tok-stats"></div>`);
  const $=q=>root.querySelector(q);
  const draw=()=>{const text=$('.tok-input').value;const useSpecial=$('[data-special]').checked;const parts=useSpecial?text.split(/(<\|endoftext\|>)/):[text];const toks=[];
    for(const p of parts){if(!p)continue;if(useSpecial&&p===special){toks.push({special:true,id:256+nMerges});continue}for(const w of p.match(PRETOK)||[])for(const t of encodeWord(w))toks.push({bytes:[...t].map(c=>c.charCodeAt(0)),id:idOf(t)})}
    const ids=$('[data-ids]').checked;
    $('.tok-out').innerHTML=toks.map((t,i)=>t.special?`<span class="tok special" title="id ${t.id}">${esc(special)}${ids?`<sub>${t.id}</sub>`:''}</span>`:`<span class="tok c${i%5}${t.bytes.length===1&&t.bytes[0]>127?' byte':''}" title="id ${t.id}">${esc(showBytes(t.bytes))}${ids?`<sub>${t.id}</sub>`:''}</span>`).join('');
    const nBytes=enc.encode(text).length;
    const roundOk=dec.decode(new Uint8Array(toks.flatMap(t=>t.special?[...enc.encode(special)]:t.bytes)))===text;
    $('.tok-stats').innerHTML=`<span><strong>${nBytes}</strong> bytes → <strong>${toks.length}</strong> tokens · <strong>${(nBytes/Math.max(1,toks.length)).toFixed(2)}</strong> bytes/token</span><span class="${roundOk?'tone-good':'tone-bad'}">decode(encode(text)) ${roundOk?'= text ✓':'≠ text ✗'}</span>`};
  root.querySelectorAll('textarea,input').forEach(el=>el.addEventListener('input',draw));draw();
}

/* Embedding lookup: click tokens; identical tokens give identical rows. */
function embedding(root){
  const vocab=['the','cat','sat','on','mat'],d=6;
  const W=vocab.map((_,r)=>Array.from({length:d},(_,c)=>+(Math.sin(r*2.3+c*1.7)*0.9).toFixed(1)));
  const sent=['the','cat','sat','on','the','mat'];let pick=0;
  root.innerHTML=shell('Look up a sentence','Each token ID selects one row of the (vocab × d_model) table. Click a token; notice both “the”s get the same vector.',
   `<div class="emb-sent"></div><div class="emb-layout"><div><small class="w-label">embedding table (5 × 6)</small><div class="emb-table"></div></div><div><small class="w-label">output (T × d_model)</small><div class="emb-out"></div></div></div>`);
  const cell=v=>`<span class="emb-cell mono" style="--v:${v}">${v>0?'+':''}${v.toFixed(1)}</span>`;
  const draw=()=>{const id=vocab.indexOf(sent[pick]);
    root.querySelector('.emb-sent').innerHTML=sent.map((t,i)=>`<button type="button" class="tok${i===pick?' merged':''}" data-i="${i}">${t}<sub>${vocab.indexOf(t)}</sub></button>`).join('');
    root.querySelector('.emb-table').innerHTML=W.map((row,r)=>`<div class="emb-row${r===id?' on':''}"><b class="mono">${r} ${vocab[r]}</b>${row.map(cell).join('')}</div>`).join('');
    root.querySelector('.emb-out').innerHTML=sent.map((t,i)=>`<div class="emb-row${vocab.indexOf(t)===id?' on':''}${i===pick?' pick':''}"><b class="mono">${i}</b>${W[vocab.indexOf(t)].map(cell).join('')}</div>`).join('')};
  root.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){pick=+b.dataset.i;draw()}});draw();
}

/* RMSNorm: edit a vector, rescale it, watch the output stay put. */
function rmsnorm(root){
  const a=[2,-1,3,0.5,-2.5,1],g=[1,1,1,1,1,1];let scale=1;
  const col=(i,editable)=>`<div class="rms-col"><div class="rms-track"><i></i></div>${editable?`<input type="range" min="-4" max="4" step="0.1" value="${a[i]}" data-f="${i}" aria-label="feature ${i+1}">`:''}<span class="mono"></span></div>`;
  root.innerHTML=shell('Normalize a vector','Drag the features or the overall scale. RMSNorm divides by one shared RMS, so scaling the whole input leaves the output unchanged.',
   `<div class="widget-controls"><label class="slider">scale whole input <input type="range" min="-1" max="1.3" step="0.01" value="0" data-scale><span class="mono"></span></label><label class="slider">gain g₃ <input type="range" min="0" max="2" step="0.05" value="1" data-gain><span class="mono"></span></label></div>
    <div class="rms-layout"><div><small class="w-label">input a × scale (drag sliders)</small><div class="rms-bars in">${a.map((_,i)=>col(i,true)).join('')}</div></div><div><small class="w-label">RMSNorm(a × scale)</small><div class="rms-bars out">${a.map((_,i)=>col(i,false)).join('')}</div></div></div><p class="rms-read mono"></p>`);
  const $=q=>root.querySelector(q);
  const paint=(sel,vals,max)=>root.querySelectorAll(sel+' .rms-col').forEach((c,i)=>{const v=vals[i],h=Math.min(50,Math.abs(v)/max*50);const bar=c.querySelector('i');bar.className=v<0?'neg':'';bar.style.cssText=v>=0?`bottom:50%;height:${h}%`:`top:50%;height:${h}%`;c.querySelector('span').textContent=v.toFixed(2)});
  const draw=()=>{const x=a.map(v=>v*scale);const rms=Math.sqrt(x.reduce((s,v)=>s+v*v,0)/x.length+1e-5);const y=x.map((v,i)=>v/rms*g[i]);
    paint('.rms-bars.in',x,Math.max(4,...x.map(Math.abs)));paint('.rms-bars.out',y,3);
    $('[data-scale]+span').textContent='×'+scale.toFixed(2);$('[data-gain]+span').textContent=g[2].toFixed(2);
    $('.rms-read').textContent=`RMS = ${rms.toFixed(3)}   →   output = (a × scale) / ${rms.toFixed(3)} × g`};
  root.addEventListener('input',e=>{const t=e.target;if(t.dataset.f!==undefined)a[+t.dataset.f]=+t.value;else if('scale' in t.dataset)scale=10**(+t.value);else if('gain' in t.dataset)g[2]=+t.value;draw()});
  draw();
}

/* SiLU curve and a gate. */
function swiglu(root){
  const W=520,H=220,X=x=>W/2+x*42,Y=y=>H-40-y*25;
  const sig=x=>1/(1+Math.exp(-x)),silu=x=>x*sig(x),relu=x=>Math.max(0,x);
  const path=f=>{let d='';for(let x=-6;x<=6.001;x+=0.1)d+=(d?'L':'M')+X(x).toFixed(1)+' '+Y(f(x)).toFixed(1);return d};
  root.innerHTML=shell('SiLU and the gate','Move x along the curve, then set the other branch value b to see the gated product SiLU(a) · b.',
   `<div class="widget-controls"><label class="slider">a = W₁x <input type="range" min="-6" max="6" step="0.1" value="-1" data-a><span class="mono"></span></label><label class="slider">b = W₃x <input type="range" min="-3" max="3" step="0.1" value="2" data-b><span class="mono"></span></label></div>
    <svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="SiLU and ReLU curves"><line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" class="axis"/><line x1="${X(0)}" x2="${X(0)}" y1="0" y2="${H}" class="axis"/><path d="${path(relu)}" class="c-grey"/><path d="${path(silu)}" class="c-red"/><path d="${path(sig)}" class="c-blue dashed"/><text x="${X(3.6)}" y="${Y(4.3)}" class="lbl red">SiLU(x)</text><text x="${X(4.1)}" y="${Y(3.2)}" class="lbl grey">ReLU</text><text x="${X(3.4)}" y="${Y(1)-6}" class="lbl blue">σ(x)</text><circle r="5" class="dot"/><line class="guide"/></svg>
    <div class="ce-readout sg-read" aria-live="polite"></div>`);
  const $=q=>root.querySelector(q);
  const draw=()=>{const a=+$('[data-a]').value,b=+$('[data-b]').value;$('[data-a]+span').textContent=a.toFixed(1);$('[data-b]+span').textContent=b.toFixed(1);
    const dot=$('.dot');dot.setAttribute('cx',X(a));dot.setAttribute('cy',Y(silu(a)));const gl=$('.guide');gl.setAttribute('x1',X(a));gl.setAttribute('x2',X(a));gl.setAttribute('y1',Y(0));gl.setAttribute('y2',Y(silu(a)));
    $('.sg-read').innerHTML=`<div><small>σ(a)</small><strong class="mono">${sig(a).toFixed(3)}</strong></div><div><small>SiLU(a) = a·σ(a)</small><strong class="mono">${silu(a).toFixed(3)}</strong></div><div><small>gated: SiLU(a) · b</small><strong class="mono tone-${Math.abs(silu(a)*b)<0.1?'ok':'good'}">${(silu(a)*b).toFixed(3)}</strong></div><p>${a<-3?'Very negative a closes the gate: almost nothing of b passes.':a<0?'SiLU is slightly negative here — unlike ReLU, it is smooth and not exactly zero.':'Positive a opens the gate roughly in proportion to a.'}</p>`};
  root.addEventListener('input',draw);draw();
}

/* RoPE: rotate q at position m and k at position n; the score depends only on m − n. */
function rope(root){
  const q=[1,0.3,0.8,0.2],k=[0.6,0.7,0.5,-0.4],theta=[1,0.1];
  const rot=(v,pos)=>[0,1].flatMap(p=>{const a=pos*theta[p],c=Math.cos(a),s=Math.sin(a),x=v[2*p],y=v[2*p+1];return [x*c-y*s,x*s+y*c]});
  root.innerHTML=shell('Relative position from rotation','q sits at position m, k at position n. Move them together with “shift both”: every vector turns, but the score q·k stays the same.',
   `<div class="widget-controls"><label class="slider">m (query) <input type="range" min="0" max="20" step="1" value="5" data-m><span class="mono"></span></label><label class="slider">n (key) <input type="range" min="0" max="20" step="1" value="2" data-n><span class="mono"></span></label><label class="slider">shift both <input type="range" min="0" max="30" step="1" value="0" data-s><span class="mono"></span></label></div>
    <div class="rope-planes"></div><div class="ce-readout rope-read" aria-live="polite"></div>`);
  const $=q=>root.querySelector(q);
  const plane=(qx,qy,kx,ky,lab)=>{const R=62,c=80,P=(x,y)=>`${(c+x*R).toFixed(1)},${(c-y*R).toFixed(1)}`;return `<figure><svg viewBox="0 0 160 160" role="img" aria-label="${lab}"><circle cx="${c}" cy="${c}" r="${R}" class="ring"/><line x1="${c}" y1="${c}" x2="${P(qx,qy).split(',')[0]}" y2="${P(qx,qy).split(',')[1]}" class="v-q"/><line x1="${c}" y1="${c}" x2="${P(kx,ky).split(',')[0]}" y2="${P(kx,ky).split(',')[1]}" class="v-k"/><text x="${P(qx,qy).split(',')[0]}" y="${P(qx,qy).split(',')[1]}" dy="-4" class="lbl red">q</text><text x="${P(kx,ky).split(',')[0]}" y="${P(kx,ky).split(',')[1]}" dy="-4" class="lbl blue">k</text></svg><figcaption>${lab}</figcaption></figure>`};
  const draw=()=>{const sh=+$('[data-s]').value,m=+$('[data-m]').value+sh,n=+$('[data-n]').value+sh;$('[data-m]+span').textContent=m;$('[data-n]+span').textContent=n;$('[data-s]+span').textContent='+'+sh;
    const rq=rot(q,m),rk=rot(k,n);const dot=rq.reduce((s,v,i)=>s+v*rk[i],0);
    $('.rope-planes').innerHTML=plane(rq[0],rq[1],rk[0],rk[1],'pair 1 · fast (θ = 1)')+plane(rq[2],rq[3],rk[2],rk[3],'pair 2 · slow (θ = 0.1)');
    $('.rope-read').innerHTML=`<div><small>offset m − n</small><strong class="mono">${m-n}</strong></div><div><small>score q·k after RoPE</small><strong class="mono">${dot.toFixed(3)}</strong></div><div><small>absolute positions</small><strong class="mono">${m}, ${n}</strong></div><p>Change only “shift both”: the vectors move, the score does not. Change m or n: the offset and the score change.</p>`};
  root.addEventListener('input',draw);draw();
}

/* Optimizer paths: SGD vs AdamW on an elongated quadratic valley. */
function optimizer(root){
  const W=560,H=280,X=x=>(x+4.2)/8*W,Y=y=>H-(y+1.6)/4*H,cx=2,cy=0.5;
  const grad=(x,y)=>[x-cx,25*(y-cy)];
  const run=(kind,lr,b1,lam)=>{let x=-3.5,y=-1,m=[0,0],v=[0,0];const pts=[[x,y]];const b2=0.999,eps=1e-8;
    for(let t=1;t<=80;t++){const g=grad(x,y);
      if(kind==='sgd'){x-=lr*g[0];y-=lr*g[1]}
      else{m=m.map((mi,i)=>b1*mi+(1-b1)*g[i]);v=v.map((vi,i)=>b2*vi+(1-b2)*g[i]*g[i]);const at=lr*Math.sqrt(1-b2**t)/(1-b1**t);x-=at*m[0]/(Math.sqrt(v[0])+eps);y-=at*m[1]/(Math.sqrt(v[1])+eps);x-=lr*lam*x;y-=lr*lam*y}
      if(!isFinite(x)||Math.abs(x)>50||Math.abs(y)>50){pts.push([x>0?9:-9,y>0?9:-9]);break}pts.push([x,y])}return pts};
  let contours='';for(const c of [0.3,1,2.5,5,9,15]){let d='';for(let a=0;a<=64;a++){const th=a/64*2*Math.PI;const x=cx+Math.sqrt(2*c)*Math.cos(th),y=cy+Math.sqrt(2*c/25)*Math.sin(th);d+=(a?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1)}contours+=`<path d="${d}" class="contour"/>`}
  root.innerHTML=shell('SGD versus AdamW on a narrow valley','The valley is 25× steeper vertically. SGD’s one step size must suit the steep direction; AdamW rescales each coordinate by its own gradient history.',
   `<div class="widget-controls"><label class="slider">SGD α <input type="range" min="-3" max="-0.9" step="0.01" value="-1.16" data-lr><span class="mono"></span></label><label class="slider">AdamW α <input type="range" min="-2.5" max="-0.3" step="0.01" value="-1" data-alr><span class="mono"></span></label><label class="slider">β₁ <input type="range" min="0" max="0.99" step="0.01" value="0.9" data-b1><span class="mono"></span></label><label class="slider">λ <input type="range" min="0" max="0.3" step="0.01" value="0" data-lam><span class="mono"></span></label></div>
    <svg class="plot opt-plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Optimizer trajectories"><defs><clipPath id="optclip"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#optclip)">${contours}<path class="c-gold sgd"/><path class="c-green adam"/><circle cx="${X(cx)}" cy="${Y(cy)}" r="5" class="dot"/><circle cx="${X(-3.5)}" cy="${Y(-1)}" r="5" class="start"/></g><text x="10" y="18" class="lbl gold">SGD</text><text x="10" y="36" class="lbl green">AdamW</text><text x="${X(cx)+8}" y="${Y(cy)-8}" class="lbl red">minimum</text></svg><div class="ce-readout opt-read" aria-live="polite"></div>`);
  const $=q=>root.querySelector(q);const P=pts=>'M'+pts.map(([x,y])=>X(x).toFixed(1)+' '+Y(y).toFixed(1)).join('L');
  const draw=()=>{const lr=10**+$('[data-lr]').value,alr=10**+$('[data-alr]').value,b1=+$('[data-b1]').value,lam=+$('[data-lam]').value;
    $('[data-lr]+span').textContent=lr.toFixed(3);$('[data-alr]+span').textContent=alr.toFixed(3);$('[data-b1]+span').textContent=b1.toFixed(2);$('[data-lam]+span').textContent=lam.toFixed(2);
    const a=run('sgd',lr),b=run('adam',alr,b1,lam);$('.sgd').setAttribute('d',P(a));$('.adam').setAttribute('d',P(b));
    const end=p=>p[p.length-1],dist=p=>Math.hypot(end(p)[0]-cx,end(p)[1]-cy);const div=a.some(([x])=>Math.abs(x)>=9);
    $('.opt-read').innerHTML=`<div><small>SGD after 80 steps</small><strong class="mono tone-${div?'bad':dist(a)<0.1?'good':'ok'}">${div?'diverged':'dist '+dist(a).toFixed(2)}</strong></div><div><small>AdamW after 80 steps</small><strong class="mono tone-${dist(b)<0.1?'good':'ok'}">dist ${dist(b).toFixed(2)}</strong></div><div><small>SGD stability limit</small><strong class="mono">α &lt; 2/25 = 0.08</strong></div><p>${div?'SGD overshoots the steep direction and blows up — the same α is fine for the flat direction.':lr<0.02?'SGD is stable but crawls along the flat direction.':'Near its limit SGD zig-zags across the valley.'} ${lam>0?'Weight decay pulls AdamW’s end point toward the origin, away from the loss minimum.':''}</p>`};
  root.addEventListener('input',draw);draw();
}

/* Learning-rate schedule explorer. */
function schedule(root){
  const W=560,H=220,N=1000;
  root.innerHTML=shell('Shape the schedule','Warmup to α_max, cosine down to α_min, then hold. Drag t to read the rate at any step; check the boundaries.',
   `<div class="widget-controls"><label class="slider">T_w <input type="range" min="0" max="400" step="10" value="100" data-tw><span class="mono"></span></label><label class="slider">T_c <input type="range" min="100" max="1000" step="10" value="800" data-tc><span class="mono"></span></label><label class="slider">α_min / α_max <input type="range" min="0" max="0.9" step="0.05" value="0.1" data-min><span class="mono"></span></label><label class="slider">t <input type="range" min="0" max="${N}" step="1" value="100" data-t><span class="mono"></span></label></div>
    <svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Learning-rate schedule"><line x1="30" x2="${W}" y1="${H-24}" y2="${H-24}" class="axis"/><line x1="30" x2="30" y1="0" y2="${H-24}" class="axis"/><path class="c-red"/><line class="guide"/><circle r="5" class="dot"/><text x="4" y="22" class="lbl red">α_max</text></svg><div class="ce-readout sch-read" aria-live="polite"></div>`);
  const $=q=>root.querySelector(q);
  const draw=()=>{let tw=+$('[data-tw]').value,tc=+$('[data-tc]').value;if(tc<=tw){tc=tw+10;$('[data-tc]').value=tc}const mn=+$('[data-min]').value,t=+$('[data-t]').value;
    const lr=t=>t<tw?t/tw:t<=tc?mn+(1+Math.cos(Math.PI*(t-tw)/(tc-tw)))/2*(1-mn):mn;const X=t=>30+t/N*(W-40),Y=v=>H-24-v*(H-44);
    let d='';for(let u=0;u<=N;u+=5)d+=(u?'L':'M')+X(u).toFixed(1)+' '+Y(lr(u)).toFixed(1);$('.c-red').setAttribute('d',d);
    const dot=$('.dot');dot.setAttribute('cx',X(t));dot.setAttribute('cy',Y(lr(t)));const g=$('.guide');g.setAttribute('x1',X(t));g.setAttribute('x2',X(t));g.setAttribute('y1',H-24);g.setAttribute('y2',Y(lr(t)));
    $('[data-tw]+span').textContent=tw;$('[data-tc]+span').textContent=tc;$('[data-min]+span').textContent=mn.toFixed(2);$('[data-t]+span').textContent=t;
    const phase=t<tw?'warmup':t<=tc?'cosine decay':'hold';
    $('.sch-read').innerHTML=`<div><small>phase at t = ${t}</small><strong>${phase}</strong></div><div><small>α_t / α_max</small><strong class="mono">${lr(t).toFixed(3)}</strong></div><div><small>boundaries</small><strong class="mono" style="font-size:.85rem">α(0)=${lr(0).toFixed(2)} · α(T_w)=${lr(tw).toFixed(2)} · α(T_c)=${lr(tc).toFixed(2)}</strong></div>`};
  root.addEventListener('input',draw);draw();
}

/* Gradient clipping on a 2-D gradient. */
function clipping(root){
  const S=240,C=S/2;
  root.innerHTML=shell('Clip a gradient','Change the gradient’s size and direction and the threshold M. Only its length changes when clipped — never its direction.',
   `<div class="widget-controls"><label class="slider">‖g‖ <input type="range" min="0.1" max="5" step="0.05" value="3" data-g><span class="mono"></span></label><label class="slider">direction <input type="range" min="0" max="360" step="1" value="35" data-a><span class="mono"></span></label><label class="slider">M <input type="range" min="0.2" max="4" step="0.05" value="1.5" data-m><span class="mono"></span></label></div>
    <div class="clip-layout"><svg class="plot clip-plot" viewBox="0 0 ${S} ${S}" role="img" aria-label="Gradient before and after clipping"><defs><marker id="clip-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs><circle cx="${C}" cy="${C}" class="ball"/><line x1="${C}" y1="${C}" class="g-raw"/><line x1="${C}" y1="${C}" class="g-clip"/></svg><div class="ce-readout clip-read" aria-live="polite"></div></div>`);
  const $=q=>root.querySelector(q);
  const draw=()=>{const g=+$('[data-g]').value,a=+$('[data-a]').value*Math.PI/180,M=+$('[data-m]').value,scale=Math.min(1,M/(g+1e-6)),k=(C-10)/5;
    $('[data-g]+span').textContent=g.toFixed(2);$('[data-a]+span').textContent=$('[data-a]').value+'°';$('[data-m]+span').textContent=M.toFixed(2);
    $('.ball').setAttribute('r',M*k);const set=(el,len)=>{el.setAttribute('x2',C+len*k*Math.cos(a));el.setAttribute('y2',C-len*k*Math.sin(a))};set($('.g-raw'),g);set($('.g-clip'),g*scale);
    $('.clip-read').innerHTML=`<div><small>scale = min(1, M / (‖g‖+ε))</small><strong class="mono">${scale.toFixed(3)}</strong></div><div><small>‖g′‖ after clipping</small><strong class="mono tone-${scale<1?'ok':'good'}">${(g*scale).toFixed(2)}</strong></div><p>${scale<1?'Too long: every coordinate is multiplied by the same factor, so the arrow shrinks onto the circle.':'Inside the circle: the gradient passes through unchanged.'}</p>`};
  root.addEventListener('input',draw);draw();
}

/* get_batch: sample random windows from a token stream. */
function batch(root){
  const words='Once upon a time there was a little fox . <eot> The dog ran home to eat . <eot> A red kite flew over the big hill and the kids waved . <eot> She smiled'.split(' ');
  let starts=[2,11,20],T=5,seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  root.innerHTML=shell('Sample a batch','Each row picks a random start s; x is T tokens from s, y is the same window shifted one to the right.',
   `<div class="widget-controls"><button type="button" class="w-btn" data-sample>Sample new batch ↻</button><label class="slider">context T <input type="range" min="2" max="8" step="1" value="5" data-T><span class="mono"></span></label></div><div class="batch-stream"></div><div class="batch-rows"></div>`);
  const $=q=>root.querySelector(q);const cols=['red','blue','green'];
  const draw=()=>{$('[data-T]+span').textContent=T;
    $('.batch-stream').innerHTML=words.map((w,i)=>{const hit=starts.findIndex(s=>i>=s&&i<=s+T);return `<span class="bt${w==='<eot>'?' eot':''}${hit>=0?' in-'+cols[hit]:''}" title="index ${i}">${esc(w)}<sub>${i}</sub></span>`}).join('');
    $('.batch-rows').innerHTML=starts.map((s,b)=>`<div class="batch-row ${cols[b]}"><b class="mono">b=${b} s=${s}</b><div><span class="mono lbl">x</span>${words.slice(s,s+T).map(w=>`<span class="bt">${esc(w)}</span>`).join('')}</div><div><span class="mono lbl">y</span><span class="bt ghost"></span>${words.slice(s+1,s+T+1).map(w=>`<span class="bt tgt">${esc(w)}</span>`).join('')}</div></div>`).join('')};
  const sample=()=>{starts=[0,1,2].map(()=>Math.floor(rnd()*(words.length-T-1)));draw()};
  $('[data-sample]').addEventListener('click',sample);$('[data-T]').addEventListener('input',e=>{T=+e.target.value;starts=starts.map(s=>Math.min(s,words.length-T-1));draw()});draw();
}

/* Temperature + top-p sampling with a tiny hand-written next-word table. */
function sampling(root){
  const table={'Once':{upon:8,more:1,again:1},'upon':{a:9,the:1},'a':{time:6,little:2,day:1,big:1,red:1},'time':{',':5,there:3,the:1,a:1},',':{there:5,a:2,the:2,she:1},'there':{was:8,lived:3,were:1},'was':{a:6,the:2,very:1,happy:1},'lived':{a:6,the:2},'little':{fox:4,girl:3,dog:2,boy:1},'big':{dog:4,tree:3,hill:2},'red':{ball:5,kite:3,hat:2},'day':{',':5,the:3,she:2},'the':{fox:3,dog:3,sun:2,end:1,little:2},'fox':{'.':4,ran:3,was:2,liked:2},'girl':{'.':3,ran:2,was:2,liked:3},'dog':{'.':4,ran:3,was:2},'boy':{'.':3,ran:3,was:2},'ran':{home:5,away:3,to:2},'liked':{to:6,the:3},'to':{play:6,the:2,run:2},'play':{'.':6,with:4},'with':{the:5,a:4},'home':{'.':8,to:2},'away':{'.':8},'.':{'<eot>':5,The:3,She:3},'The':{fox:3,dog:3,sun:2},'She':{was:4,liked:4,ran:2},'sun':{was:5,'.':3},'very':{happy:6,big:4},'happy':{'.':8},'tree':{'.':8},'hill':{'.':8},'ball':{'.':8},'kite':{'.':8},'hat':{'.':8},'more':{',':8},'again':{',':8},'were':{happy:8},'end':{'.':8},'run':{'.':8},'<eot>':{}};
  let text=['Once'],seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  root.innerHTML=shell('Sample the next token','A tiny hand-made next-word table stands in for the LM. Change τ and p, then sample and watch the text grow.',
   `<div class="widget-controls"><label class="slider">temperature τ <input type="range" min="0.1" max="2.5" step="0.05" value="1" data-tau><span class="mono"></span></label><label class="slider">top-p <input type="range" min="0.1" max="1" step="0.01" value="0.9" data-p><span class="mono"></span></label><button type="button" class="w-btn" data-go>Sample next →</button><button type="button" class="w-btn ghost" data-reset>Reset</button></div>
    <div class="gen-text mono" aria-live="polite"></div><div class="gen-dist"></div>`);
  const $=q=>root.querySelector(q);
  const dist=()=>{const last=text[text.length-1],row=table[last]||{};const toks=Object.keys(row);if(!toks.length)return [];const tau=+$('[data-tau]').value,p=+$('[data-p]').value;
    const logits=toks.map(t=>Math.log(row[t]));const pr=softmax(logits.map(l=>l/tau));const order=toks.map((t,i)=>({t,p:pr[i]})).sort((a,b)=>b.p-a.p);let acc=0;
    for(const o of order){o.keep=acc<p;acc+=o.p}const z=order.filter(o=>o.keep).reduce((s,o)=>s+o.p,0);order.forEach(o=>o.q=o.keep?o.p/z:0);return order};
  const draw=()=>{$('[data-tau]+span').textContent=(+$('[data-tau]').value).toFixed(2);$('[data-p]+span').textContent=(+$('[data-p]').value).toFixed(2);
    $('.gen-text').innerHTML=text.map((w,i)=>`<span class="${i===text.length-1?'last':''}">${esc(w)}</span>`).join(' ');const d=dist();
    $('.gen-dist').innerHTML=d.length?`<small class="w-label">next-token distribution after “${esc(text[text.length-1])}” (bar = after τ, fill = kept by top-p)</small>`+d.map(o=>`<div class="gd-row${o.keep?'':' cut'}"><span class="mono">${esc(o.t)}</span><i><b style="width:${(o.p*100).toFixed(1)}%"></b></i><em class="mono">${o.p.toFixed(2)}${o.keep?` → ${o.q.toFixed(2)}`:' cut'}</em></div>`).join(''):'<p class="w-note">End of text reached — reset to sample again.</p>';
    $('[data-go]').disabled=!d.length};
  $('[data-go]').addEventListener('click',()=>{const d=dist().filter(o=>o.keep);let r=rnd(),pick=d[d.length-1];for(const o of d){if((r-=o.q)<=0){pick=o;break}}text.push(pick.t);if(text.length>40)text=text.slice(-40);draw()});
  $('[data-reset]').addEventListener('click',()=>{text=['Once'];draw()});root.addEventListener('input',draw);draw();
}

/* Schematic learning-rate sweep (a made-up model of curve shapes, not real training). */
function lrSweep(root){
  const W=560,H=240;
  const curve=lr=>{const edge=3e-3,best=1.2e-3;const pts=[];for(let s=0;s<=100;s++){const t=s/100;const speed=Math.min(lr/best,1.6)*5;let v=1.4+Math.abs(Math.log10(lr/best))*0.35+2.6*Math.exp(-t*speed);if(lr>edge){const tb=Math.max(0.08,0.5-(lr-edge)/edge*0.4);if(t>tb)v+= (t-tb)*25}pts.push([t,Math.min(v,6)])}return pts};
  root.innerHTML=shell('Sweep the learning rate','A made-up model of how validation curves change with α — for building intuition only. Push α up until the run diverges.',
   `<div class="widget-controls"><label class="slider">α <input type="range" min="-4.3" max="-2" step="0.01" value="-3.2" data-lr><span class="mono"></span></label><label class="check"><input type="checkbox" data-keep checked> keep previous runs</label><button type="button" class="w-btn ghost" data-clear>Clear</button></div>
    <svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Schematic validation loss curves"><line x1="30" x2="${W}" y1="${H-20}" y2="${H-20}" class="axis"/><line x1="30" x2="30" y1="0" y2="${H-20}" class="axis"/><g class="ghosts"></g><path class="c-red now"/><text x="36" y="14" class="lbl grey">val loss (schematic)</text><text x="${W-4}" y="${H-4}" text-anchor="end" class="lbl grey">steps</text></svg><div class="ce-readout sweep-read" aria-live="polite"></div>`);
  const $=q=>root.querySelector(q);const X=t=>30+t*(W-40),Y=v=>H-20-(v-1)/5*(H-30);const P=pts=>'M'+pts.map(([t,v])=>X(t).toFixed(1)+' '+Y(v).toFixed(1)).join('L');let last=null;
  const draw=(commit)=>{const lr=10**+$('[data-lr]').value;$('[data-lr]+span').textContent=lr.toExponential(1);const pts=curve(lr);
    if(commit&&last&&$('[data-keep]').checked)$('.ghosts').insertAdjacentHTML('beforeend',`<path d="${P(last)}" class="c-grey ghost-run"/>`);last=pts;$('.now').setAttribute('d',P(pts));
    const fin=pts[pts.length-1][1],div=fin>=5.9;$('.sweep-read').innerHTML=`<div><small>final (schematic)</small><strong class="mono tone-${div?'bad':fin<1.6?'good':'ok'}">${div?'diverged':fin.toFixed(2)}</strong></div><p>${div?'Too high: the run blows up. Report at least one divergent run, then back off.':lr<5e-4?'Too low: stable but slow; the budget ends before convergence.':'Good region: fast and stable. The best α is often just below where runs start to diverge.'}</p>`};
  $('[data-lr]').addEventListener('change',()=>draw(true));$('[data-lr]').addEventListener('input',()=>draw(false));$('[data-clear]').addEventListener('click',()=>{$('.ghosts').innerHTML=''});draw(false);
}

/* Submission checklist, remembered in this browser only. */
function audit(root){
  const key='cs336-a1-audit';const items=['All unit tests pass with uv run pytest','writeup.pdf is typeset and answers every Problem ID','Every experiment has its curve, settings and a sentence of interpretation','Learning curves show steps and wall-clock time','code.zip made with the repository script — no data or checkpoints inside','Leaderboard run: OWT data only, within the time limit, final val loss reported','Re-read the current handout and leaderboard README for changes'];
  let done=[];try{done=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
  root.innerHTML=shell('Your submission checklist','Tick items as you finish them. Saved only in this browser.',`<ul class="audit-list">${items.map((t,i)=>`<li><label><input type="checkbox" data-i="${i}" ${done.includes(i)?'checked':''}> ${esc(t)}</label></li>`).join('')}</ul><p class="audit-count"></p>`);
  const count=()=>{root.querySelector('.audit-count').textContent=`${done.length} of ${items.length} done`};
  root.querySelector('.widget-note')?.remove();
  root.addEventListener('change',e=>{const i=+e.target.dataset.i;done=e.target.checked?[...new Set([...done,i])]:done.filter(x=>x!==i);try{localStorage.setItem(key,JSON.stringify(done))}catch{}count()});count();
}

window.STUDY_WIDGETS={'cross-entropy':crossEntropy,attention,utf8,'bpe-train':bpeTrain,tokenizer,embedding,rmsnorm,swiglu,rope,optimizer,schedule,clipping,batch,sampling,'lr-sweep':lrSweep,audit};
})();
