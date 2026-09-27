(()=>{
'use strict';
const lessons=window.STUDY_LESSONS||[];
const guides=window.STUDY_GUIDES||{};
const main=document.getElementById('main');
const storeKey='cs336-a1-guided-study-v1';
const originalRepo='https://github.com/stanford-cs336/assignment1-basics/tree/main';
const chapterNames={
 '01':'Assignment overview','02':'BPE tokenizer','03':'Transformer architecture','04':'Training mathematics','05':'Training loop','06':'Generating text','07':'Experiments'
};
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readState(){try{const saved=JSON.parse(localStorage.getItem(storeKey)||'{}');return {current:typeof saved.current==='string'?saved.current:null,done:Array.isArray(saved.done)?saved.done:[]}}catch{return {current:null,done:[]}}}
let state=readState();
function saveState(){try{localStorage.setItem(storeKey,JSON.stringify(state))}catch{}}
function go(hash){if(location.hash===hash){render()}else{location.hash=hash}}
function chapterNum(lesson){return lesson.chapter.slice(0,2)}
function overview(){
 const allProblems=lessons.flatMap(l=>l.problems);
 const groups=Object.keys(chapterNames).map(n=>({n,name:chapterNames[n],items:lessons.filter(l=>chapterNum(l)===n),problems:lessons.filter(l=>chapterNum(l)===n).flatMap(l=>l.problems)}));
 const done=lessons.filter(l=>state.done.includes(l.id)).length;
 const continueLesson=lessons.find(l=>l.id===state.current);
 main.className='overview';
 main.innerHTML=`<p class="eyebrow">A complete first look</p><h1>Build a language model<br>from scratch.</h1><p class="lede">This assignment takes you from raw text to a trained Transformer that can generate new text. Here is the complete set of work before you begin the guided lessons.</p>
 <div class="intro-actions"><button class="primary-button" id="start-learning" type="button">Start learning →</button>${continueLesson?`<button class="secondary-button" id="continue-learning" type="button">Continue: ${escapeHTML(continueLesson.title)}</button>`:''}<span class="progress-note">${done} of ${lessons.length} lessons marked complete</span>${continueLesson||done?'<button class="text-button" id="reset-overview" type="button">Reset progress</button>':''}</div>
 <img class="overview-diagram" src="assets/diagrams/orientation.svg" alt="Text passes through BPE and token IDs to model training and generation.">
 <section class="overview-block" aria-labelledby="required-heading"><h2 class="section-title" id="required-heading">Everything you need to do</h2><div class="requirements">
 <div class="requirement"><h3>1. Build the components</h3><ul><li>Train a byte-level BPE tokenizer and implement encoding, streaming, and decoding.</li><li>Build a decoder-only Transformer LM: embeddings, RMSNorm, SwiGLU, RoPE, causal multi-head attention, and blocks.</li><li>Implement cross-entropy, AdamW, learning-rate scheduling, and gradient clipping.</li><li>Build batching, checkpointing, a training loop, and text decoding.</li></ul></div>
 <div class="requirement"><h3>2. Run the pipeline</h3><ul><li>Train TinyStories and OpenWebText tokenizers; encode train and validation data.</li><li>Train and evaluate a TinyStories model; report validation loss and generated text.</li><li>Log learning curves, tune learning rate and batch size, and run four architecture ablations.</li><li>Train on OpenWebText and compare results; for full handout completion, run the leaderboard experiment under its constraints.</li></ul></div>
 <div class="requirement"><h3>3. Check the work</h3><ul><li>Connect your own modules through <code>tests/adapters.py</code>; do not change the staff tests.</li><li>Use <code>uv run pytest</code> and targeted tests as components are finished.</li><li>Record shapes, numerical checks, compute budgets, seeds, and experiment settings.</li></ul></div>
 <div class="requirement"><h3>4. Submit the evidence</h3><ul><li>A typeset <code>writeup.pdf</code> answering the written and experimental prompts.</li><li>A <code>code.zip</code> made with the repository’s submission script, excluding large data and checkpoints.</li><li>For leaderboard participation, a separate run record and submission following the official repository.</li></ul></div>
 </div><div class="notice"><strong>Academic integrity:</strong> This unofficial, AI-assisted guide explains concepts and equations and offers conceptual implementation hints. Write and submit all code, experiments, and answers yourself, and follow the <a href="https://cs336.stanford.edu/" target="_blank" rel="noopener">course AI policy</a>. <a href="about.html">Read the full disclosure</a>.</div></section>
 <section class="overview-block" aria-labelledby="chapters-heading"><h2 class="section-title" id="chapters-heading">The guided lessons</h2><div class="chapter-list">${groups.map(g=>`<div class="chapter-row"><span class="chapter-num">${g.n}</span><div><strong>${escapeHTML(g.name)}</strong><small>${g.items.length} lessons · ${g.problems.length} Problem${g.problems.length===1?'':'s'}</small></div><span class="chapter-count">PDF ${g.items[0]?.section||''}</span></div>`).join('')}</div>
 <details class="problem-details"><summary>View all ${allProblems.length} Problem IDs</summary><div class="problem-groups">${groups.map(g=>`<div><h3>${g.n} · ${escapeHTML(g.name)}</h3><p>${g.problems.length?g.problems.map(p=>`<span class="problem-id">${escapeHTML(p)}</span>`).join(''):'No numbered Problem in this chapter.'}</p></div>`).join('')}</div></details></section>
 <section class="overview-block"><h2 class="section-title">Your source of truth</h2><p class="lede" style="font-size:.9rem;margin-bottom:8px">The local 47-page Spring 2026 handout (v26.0.3) is bundled with this site. Every lesson links to its PDF page. Requirements and submission rules should be checked against that handout.</p><div class="source-links"><a href="${originalRepo}" target="_blank" rel="noopener">Original Stanford GitHub repository ↗</a><a href="assets/handout.pdf" target="_blank" rel="noopener">Open the assignment handout ↗</a></div></section>`;
 document.getElementById('start-learning').addEventListener('click',()=>go('#lesson/'+lessons[0].id));
 document.getElementById('continue-learning')?.addEventListener('click',()=>go('#lesson/'+continueLesson.id));
 document.getElementById('reset-overview')?.addEventListener('click',resetProgress);
 document.title='CS336 Assignment 1 · Overview';
}
function directoryContent(index){
 const current=lessons[index];
 const chapters=Object.keys(chapterNames).map(n=>({n,name:chapterNames[n],items:lessons.map((lesson,i)=>({lesson,i})).filter(x=>chapterNum(x.lesson)===n)}));
 return `<div class="directory-heading">All ${lessons.length} lessons</div><p class="directory-position">Now studying ${index+1} of ${lessons.length} · ${escapeHTML(current.section)}</p><button class="directory-math" data-scroll-formulas type="button">Mathematics in this lesson <span>${current.formulas.length} ↓</span></button><nav aria-label="All lessons">${chapters.map(group=>`<div class="toc-chapter"><div class="toc-chapter-title${chapterNum(current)===group.n?' active':''}"><span>${group.n}</span>${escapeHTML(group.name)}</div><ol>${group.items.map(({lesson,i})=>`<li><a data-toc-lesson-id="${lesson.id}" class="toc-lesson${i===index?' current':''}${state.done.includes(lesson.id)?' completed':''}" href="#lesson/${lesson.id}" ${i===index?'aria-current="step"':''}><span class="toc-index">${String(i+1).padStart(2,'0')}</span><span class="toc-name">${escapeHTML(lesson.title)}</span><span class="toc-check" aria-hidden="true">${state.done.includes(lesson.id)?'✓':''}</span></a></li>`).join('')}</ol></div>`).join('')}</nav>`;
}
function directoryMarkup(index){const content=directoryContent(index);return `<aside class="desktop-directory" aria-label="All ${lessons.length} lessons">${content}</aside><details class="mobile-directory"><summary>All ${lessons.length} lessons · now at ${index+1}</summary><div class="mobile-directory-content">${content}</div></details>`}
function resetProgress(){if(confirm('Reset saved lesson progress on this browser?')){state={current:null,done:[]};saveState();go('#overview')}}
function formulaCard(f){let rendered;try{rendered=katex.renderToString(f.tex,{displayMode:true,throwOnError:false,output:'htmlAndMathml',strict:'warn'})}catch{rendered=`<code>${escapeHTML(f.tex)}</code>`}
 const numbered=typeof f.number==='number';const label=numbered?`Handout equation (${f.number})`:'Concept relation';
 return `<div class="equation-card"><div class="equation-head"><span>${label}</span><span>${numbered?`(${f.number})`:'Study note'}</span></div><div class="equation-body" role="math" aria-label="${escapeHTML(f.tex)}">${rendered}</div><div class="equation-notes"><p><strong>Read it:</strong> ${escapeHTML(f.explain)}</p><p><strong>Symbols and shapes:</strong> ${escapeHTML(f.symbols)}</p>${f.watch?`<p class="watch"><strong>Watch for:</strong> ${escapeHTML(f.watch)}</p>`:''}</div></div>`}
function buildGuide(lesson){const guide=guides[lesson.id];if(!guide)return '';
 const first=`hint-principle-${lesson.id}`,second=`hint-pseudocode-${lesson.id}`;
 return `<section class="lesson-section build-section" aria-labelledby="build-heading"><h2 id="build-heading">What to write or run</h2><p class="build-scope">${escapeHTML(guide.scope)}</p><ul class="build-list">${guide.tasks.map(task=>`<li>${escapeHTML(task)}</li>`).join('')}</ul><div class="hint-flow"><button class="hint-button" type="button" data-hint-toggle="principle" aria-controls="${first}" aria-expanded="false">Reveal level 1 · Principle</button><div class="hint-panel" id="${first}" hidden><p>${escapeHTML(guide.principle)}</p><button class="hint-button" type="button" data-hint-toggle="pseudocode" aria-controls="${second}" aria-expanded="false">Reveal level 2 · Pseudocode</button><div class="hint-panel pseudo-panel" id="${second}" hidden><pre><code>${escapeHTML(guide.pseudocode.join('\n'))}</code></pre><p class="hint-note">Use this outline to design your own implementation and verify it against the official handout.</p></div></div></div></section>`}
function lessonView(index){const l=lessons[index];state.current=l.id;saveState();const complete=state.done.includes(l.id);main.className='lesson-shell';
 main.innerHTML=`<div class="lesson-top"><strong>${escapeHTML(l.chapter)}</strong><span>Lesson ${String(index+1).padStart(2,'0')} of ${lessons.length}</span></div><div class="progress-bar" aria-hidden="true"><span style="width:${((index+1)/lessons.length*100).toFixed(1)}%"></span></div>
 <div class="study-layout">${directoryMarkup(index)}<article class="lesson"><p class="chapter-label">${escapeHTML(l.section)}</p><h1>${escapeHTML(l.title)}</h1><p class="goal">${escapeHTML(l.goal)}</p><div class="lesson-meta"><span>Handout page ${l.page}</span><a href="assets/handout.pdf#page=${l.page}" target="_blank" rel="noopener">Read this part in the PDF ↗</a><a href="${originalRepo}" target="_blank" rel="noopener">Original GitHub ↗</a></div>
 <figure class="figure"><img src="assets/diagrams/${escapeHTML(l.diagram)}.svg" alt="${escapeHTML(l.diagramAlt)}"><figcaption>${escapeHTML(l.diagramAlt)}</figcaption></figure>
 <section class="lesson-section"><h2>Understand the idea</h2>${l.explain.map(p=>`<p>${escapeHTML(p)}</p>`).join('')}</section>
 <section class="lesson-section"><h2>Keep these points in mind</h2><ul class="concept-list">${l.concepts.map(p=>`<li>${escapeHTML(p)}</li>`).join('')}</ul></section>
 ${l.formulas.length?`<section class="lesson-section" id="equations"><h2>Mathematics</h2>${l.formulas.map(formulaCard).join('')}</section>`:''}
 ${buildGuide(l)}
 <section class="lesson-section"><h2>Assignment connection</h2><div class="assignment-box"><strong>${l.problems.length?`${l.problems.length} Problem${l.problems.length===1?'':'s'}`:'Foundation lesson'}</strong><div>${l.problems.map(p=>`<span class="problem-id">${escapeHTML(p)}</span>`).join('')}</div><p><strong>Check:</strong> ${escapeHTML(l.test)}</p></div></section>
 <section class="lesson-section"><h2>Check yourself</h2><ol class="check-list">${l.check.map(q=>`<li>${escapeHTML(q)}</li>`).join('')}</ol></section>
 <div class="lesson-actions"><label class="complete-label"><input id="complete-toggle" type="checkbox" ${complete?'checked':''}> Mark lesson complete</label><div class="nav-actions"><button class="secondary-button" id="back-button" type="button">← ${index===0?'Overview':'Back'}</button><button class="primary-button" id="next-button" type="button">${index===lessons.length-1?'Overview':'Next lesson →'}</button></div></div>
 <div class="reset-area"><span>Progress is saved only in this browser.</span><button class="text-button" id="reset-button" type="button">Reset progress</button></div></article></div>`;
 document.getElementById('complete-toggle').addEventListener('change',e=>{state.done=e.target.checked?[...new Set([...state.done,l.id])]:state.done.filter(id=>id!==l.id);saveState();main.querySelectorAll(`[data-toc-lesson-id="${l.id}"]`).forEach(a=>{a.classList.toggle('completed',e.target.checked);a.querySelector('.toc-check').textContent=e.target.checked?'✓':''})});
 main.querySelectorAll('[data-scroll-formulas]').forEach(button=>button.addEventListener('click',()=>document.getElementById('equations')?.scrollIntoView({block:'start',behavior:'smooth'})));
 document.getElementById('back-button').addEventListener('click',()=>go(index===0?'#overview':'#lesson/'+lessons[index-1].id));
 document.getElementById('next-button').addEventListener('click',()=>go(index===lessons.length-1?'#overview':'#lesson/'+lessons[index+1].id));
 document.getElementById('reset-button').addEventListener('click',resetProgress);
 document.title=`${l.title} · CS336 Assignment 1`;
}
function render(){const match=location.hash.match(/^#lesson\/([a-z0-9-]+)$/);const index=match?lessons.findIndex(l=>l.id===match[1]):-1;if(index>=0)lessonView(index);else overview();window.scrollTo?.(0,0)}
document.getElementById('overview-button').addEventListener('click',()=>go('#overview'));
main.addEventListener('click',event=>{const button=event.target.closest('[data-hint-toggle]');if(!button||!main.contains(button))return;const panel=document.getElementById(button.getAttribute('aria-controls'));if(!panel)return;panel.hidden=!panel.hidden;const expanded=!panel.hidden;button.setAttribute('aria-expanded',String(expanded));button.textContent=`${expanded?'Hide':'Reveal'} level ${button.dataset.hintToggle==='principle'?'1 · Principle':'2 · Pseudocode'}`;if(button.dataset.hintToggle==='principle'&&!expanded){const nested=panel.querySelector('[data-hint-toggle="pseudocode"]'),nestedPanel=nested&&document.getElementById(nested.getAttribute('aria-controls'));if(nested&&nestedPanel){nestedPanel.hidden=true;nested.setAttribute('aria-expanded','false');nested.textContent='Reveal level 2 · Pseudocode'}}});
window.addEventListener('hashchange',render);
document.addEventListener('keydown',event=>{if(!event.altKey||event.ctrlKey||event.metaKey)return;const match=location.hash.match(/^#lesson\/([a-z0-9-]+)$/);const index=match?lessons.findIndex(l=>l.id===match[1]):-1;if(index<0)return;if(event.key==='ArrowRight'){event.preventDefault();go(index<lessons.length-1?'#lesson/'+lessons[index+1].id:'#overview')}if(event.key==='ArrowLeft'){event.preventDefault();go(index>0?'#lesson/'+lessons[index-1].id:'#overview')}});
if(!lessons.length){main.innerHTML='<div class="error">Lesson content could not be loaded. Check that lessons.js is beside this page.</div>'}else render();
})();
