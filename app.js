// ============================================================
// アプリケーションロジック
// DATA と EXAMS は questions.js で定義されています
// ============================================================

function catStyle(n){
  if(n.includes('読み'))       return{icon:'📖',color:'#1a56db'};
  if(n.includes('同音')||n.includes('同訓'))return{icon:'🔀',color:'#15803d'};
  if(n.includes('熟語の構成')) return{icon:'🧩',color:'#6d28d9'};
  if(n.includes('熟語'))       return{icon:'📚',color:'#92400e'};
  if(n.includes('部首'))       return{icon:'🔍',color:'#065f46'};
  if(n.includes('対義')||n.includes('類義'))return{icon:'↔️',color:'#9d174d'};
  if(n.includes('送り'))       return{icon:'✏️',color:'#7c2d12'};
  if(n.includes('四字'))       return{icon:'⛩️',color:'#4c1d95'};
  if(n.includes('誤字'))       return{icon:'❌',color:'#991b1b'};
  if(n.includes('書き取'))     return{icon:'🖊️',color:'#164e63'};
  return{icon:'📝',color:'#374151'};
}

function genOpts(a, h){
  if(h){
    const ms=[...h.matchAll(/[アイウエオカキクケコ]\s+\S+/g)].map(m=>{const s=m[0].trim();return s.includes('（')?s:s.replace(/）$/,'');});
    if(ms.length>=2) return ms;
    const lines=h.split('\n').map(l=>l.trim()).filter(l=>l.match(/^[アイウエオ]/));
    if(lines.length>=2) return shuffle(lines);
    const bare=(h.includes('・')?h.split('・'):h.split('\n')).map(l=>l.trim()).filter(l=>l.length>0);
    if(bare.length>=2) return shuffle(bare);
  }
  const pool=['きゅう','かい','はく','しん','こう','よう','たい','きょう','せい','ほう','ちょう','りょう','じょう','そく','えい','じゅ','すい','とく','ふく','もく','れん','しゃ','かく','はん','ぼう','てん','ねん','らく','ぎょう','どう','かん','ぜん','めい','ちん','ふう','こん','ろく','みょう','しょく','ねん'];
  const ts=[s=>s.replace(/う$/,'い'),s=>s.replace(/い$/,'う'),s=>s.replace(/ん$/,'く'),s=>s.replace(/く$/,'ん'),
    s=>{const m={か:'さ',さ:'か',き:'し',し:'き',く:'す',す:'く',け:'せ',せ:'け',こ:'そ',そ:'こ',た:'な',な:'た',ち:'に',に:'ち',て:'ね',と:'の',は:'ま',ま:'は',ひ:'み',み:'ひ',ふ:'む',む:'ふ',へ:'め',め:'へ',ほ:'も',も:'ほ',ら:'な',り:'に',る:'ぬ',れ:'ね',ろ:'の'};return s.replace(/^(.)/,c=>m[c]||c);},
    s=>s.length>1?s.slice(0,-1)+'し':s+'し',s=>s.length>1?s.slice(0,-1)+'く':s+'く'];
  const v=new Set();for(const t of ts){try{const x=t(a);if(x&&x!==a)v.add(x);}catch(e){}}
  for(const p of pool)if(p!==a)v.add(p);
  const oth=[...v].filter(x=>x!==a).slice(0,3);while(oth.length<3)oth.push('？？？');
  return shuffle([...oth,a]);
}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

const CK='k4v24c',AK='k4v24a';
const wk=(e,c)=>`k4v24w_${e}_${c.slice(0,4)}`;
const ls=k=>{try{return new Set(JSON.parse(localStorage.getItem(k)||'[]'));}catch(e){return new Set();}};
const ss=(k,s)=>{try{localStorage.setItem(k,JSON.stringify([...s]));}catch(e){}};
let C=ls(CK),A=ls(AK);
const qid=q=>q.s+'|'+q.q.slice(0,6);

function clrCat(e,c){(DATA[e]?.[c]||[]).forEach(q=>{C.delete(qid(q));A.delete(qid(q));});ss(CK,C);ss(AK,A);ss(wk(e,c),new Set());}
function clrAll(){C=new Set();A=new Set();ss(CK,C);ss(AK,A);EXAMS.forEach(e=>Object.keys(DATA[e]).forEach(c=>ss(wk(e,c),new Set())));}
function buildQ(e,c){const raw=DATA[e]?.[c]||[];const pw=ls(wk(e,c));if(pw.size>0){const r=raw.filter(q=>pw.has(qid(q)));if(r.length)return r;}const un=raw.filter(q=>!C.has(qid(q)));return un.length>0?un:raw;}
function calcStats(e){let tot=0,ans=0,cor=0;Object.values(DATA[e]||{}).forEach(qs=>{tot+=qs.length;ans+=qs.filter(q=>A.has(qid(q))).length;cor+=qs.filter(q=>C.has(qid(q))).length;});return{tot,ans,cor};}

let selE=1,ST={};

function renderHome(){
  C=ls(CK);A=ls(AK);
  const{tot,ans,cor}=calcStats(selE);
  document.getElementById('slabel').textContent='試験'+selE;
  document.getElementById('st0').textContent=tot;
  document.getElementById('st1').textContent=ans;
  document.getElementById('st2').textContent=cor;
  const tabs=document.getElementById('tabs');tabs.innerHTML='';
  EXAMS.forEach(e=>{const b=document.createElement('button');b.className='tab'+(e===selE?' on':'');b.textContent='試験'+e;b.addEventListener('click',()=>{selE=e;renderHome();});tabs.appendChild(b);});
  const cards=document.getElementById('cards');cards.innerHTML='';
  Object.entries(DATA[selE]).forEach(([c,qs])=>{
    const t=qs.length,co=qs.filter(q=>C.has(qid(q))).length,ao=qs.filter(q=>A.has(qid(q))).length;
    const pw=ls(wk(selE,c)),p=Math.round(co/t*100),done=co===t&&pw.size===0;
    const cs=catStyle(c);
    const bh=pw.size>0?`<span class="cbadge cb-wip">要復習 ${pw.size}問</span>`:co===t?`<span class="cbadge cb-done">完了</span>`:ao===0?`<span class="cbadge cb-new">未挑戦</span>`:`<span class="cbadge cb-wip">${co}/${t}正解</span>`;
    const d=document.createElement('div');d.className='card'+(done?' done':'');
    d.innerHTML=`<span style="font-size:18px;flex-shrink:0">${cs.icon}</span><div class="cinfo"><div class="cname">${c}<small style="font-weight:400;color:#888;margin-left:6px">${t}問</small></div><div class="crow"><span class="ctxt">${co}/${t}</span><div class="pbg"><div class="pfill" style="width:${p}%;background:${co===t?'#16a34a':cs.color}"></div></div>${bh}</div></div><button class="clr">クリア</button>`;
    d.querySelector('.clr').addEventListener('click',ev=>{ev.stopPropagation();openModal(selE,c);});
    d.addEventListener('click',()=>startCat(selE,c));
    cards.appendChild(d);
  });
  document.getElementById('btn-practice').textContent=`試験${selE}をまとめて練習`;
}

document.getElementById('btn-practice').addEventListener('click',()=>startExam(selE));
document.getElementById('btn-clrall').addEventListener('click',()=>openModal(-1,''));
document.getElementById('btn-back').addEventListener('click',()=>goHome());
document.getElementById('btn-nxt').addEventListener('click',()=>nextQ());
document.getElementById('btn-rhome').addEventListener('click',()=>goHome());
document.getElementById('mcan').addEventListener('click',()=>closeModal());

let _me,_mc;
function openModal(e,c){_me=e;_mc=c;const all=e===-1;document.getElementById('mt').textContent=all?'全データをクリア':`試験${e}「${c}」をクリア`;document.getElementById('mm').textContent=all?'全試験の正解履歴をリセットします。':'この科目の正解履歴をリセットします。';document.getElementById('mok').onclick=()=>{if(all)clrAll();else clrCat(_me,_mc);closeModal();renderHome();};document.getElementById('modal').className='mover show';}
function closeModal(){document.getElementById('modal').className='mover';}

function makeQ(q,e,c){const lines=q.q.split('\n');return{...q,mainQ:lines[0],hint:lines.slice(1).join('\n'),opts:genOpts(q.a,q.h||lines.slice(1).join('\n')),cat:`試験${e} ${c}`};}

function startCat(e,c){const qs=buildQ(e,c).map(q=>makeQ(q,e,c));if(!qs.length){alert('出題する問題がありません。');return;}ST={name:`試験${e} ${c}`,queue:qs,idx:0,sW:new Set(),sC:new Set(),eN:e,cN:c};showPg('pg-quiz');renderQ();}
function startExam(e){const allQ=[];Object.entries(DATA[e]).forEach(([c,qs])=>{const pw=ls(wk(e,c));let run=pw.size>0?qs.filter(q=>pw.has(qid(q))):qs.filter(q=>!C.has(qid(q)));if(!run.length)run=qs;run.forEach(q=>allQ.push(makeQ(q,e,c)));});if(!allQ.length){alert('出題する問題がありません。');return;}ST={name:`試験${e} 全問`,queue:allQ,idx:0,sW:new Set(),sC:new Set(),eN:e,cN:'__all'};showPg('pg-quiz');renderQ();}

function renderQ(){
  const q=ST.queue[ST.idx],tot=ST.queue.length;
  document.getElementById('qlbl').textContent=ST.name+'  問'+q.s;
  document.getElementById('pbar2').style.width=(ST.idx/tot*100)+'%';
  document.getElementById('pcnt').textContent=(ST.idx+1)+'/'+tot;
  document.getElementById('qbdg').textContent=q.cat;
  if(q.u&&q.u!=='□'&&!q.cat.includes('誤字訂正')){const esc=q.u.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');document.getElementById('qtxt').innerHTML=q.mainQ.replace(new RegExp('(?<![ァ-ン])'+esc),'<u>'+q.u+'</u>');}
  else document.getElementById('qtxt').textContent=q.mainQ;
  document.getElementById('qhint').textContent=q.hint||'';
  const g=document.getElementById('opts');const long=q.opts.some(o=>o.length>8);g.className='opts '+(long?'g1':'g2');g.innerHTML='';
  q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';b.textContent=o;b.addEventListener('click',()=>selAns(i));g.appendChild(b);});
  g.style.pointerEvents='none';setTimeout(()=>{g.style.pointerEvents='';},350);
  document.getElementById('fb').className='fb';document.getElementById('btn-nxt').className='nxt';
}

function selAns(idx){
  const q=ST.queue[ST.idx],ok=q.opts[idx]===q.a,id=qid(q);
  if(!ST.sC.has(id)&&!ST.sW.has(id)){if(ok)ST.sC.add(id);else ST.sW.add(id);}
  A.add(id);ss(AK,A);if(ok){C.add(id);ss(CK,C);}
  document.querySelectorAll('.opt').forEach((b,i)=>{b.disabled=true;if(q.opts[i]===q.a)b.classList.add('ok');else if(i===idx&&!ok)b.classList.add('ng');});
  document.getElementById('fbi').textContent=ok?'✓':'✗';
  document.getElementById('fbody').innerHTML=ok?'<b>正解！</b>':'<b>不正解。</b>　正解：'+q.a;
  document.getElementById('fb').className='fb show '+(ok?'ok2':'ng2');
  if(ok){setTimeout(()=>nextQ(),800);}else{document.getElementById('btn-nxt').className='nxt show';}
}

function nextQ(){ST.idx++;if(ST.idx>=ST.queue.length)showResult();else renderQ();}

function showResult(){
  showPg('pg-result');
  if(ST.eN>=0&&ST.cN!=='__all')ss(wk(ST.eN,ST.cN),ST.sW);
  else if(ST.eN>=0)Object.entries(DATA[ST.eN]).forEach(([c,qs])=>ss(wk(ST.eN,c),new Set(qs.map(qid).filter(id=>ST.sW.has(id)))));
  const tot=ST.queue.length,cor=ST.queue.filter(q=>ST.sC.has(qid(q))).length,pct=Math.round(cor/tot*100);
  document.getElementById('rs').textContent=cor;document.getElementById('rd').textContent='/'+tot;document.getElementById('rp').textContent=pct+'%';
  const pass=pct>=80;let msg=pass?'合格ライン達成！よくできました！':pct>=60?'もう少し！':'基礎からしっかり練習しよう。';
  if(ST.sW.size>0)msg+=` 次回は${ST.sW.size}問を出題します。`;
  document.getElementById('rm').textContent=msg;document.getElementById('rg').textContent=pass?'合格レベル':'要復習';document.getElementById('rg').className='rgr '+(pass?'gp':'gf');
  const list=document.getElementById('revlist');list.innerHTML='';
  ST.queue.forEach(q=>{const id=qid(q),ok=ST.sC.has(id),ng=ST.sW.has(id);if(!ok&&!ng)return;const d=document.createElement('div');d.className='ritem';d.innerHTML=`<div class="rdot ${ok?'dok':'dng'}"></div><div><div class="rq">${q.mainQ}</div><div class="ra">正解：${q.a}</div></div>`;list.appendChild(d);});
}

function goHome(){if(ST.eN)selE=ST.eN;showPg('pg-home');renderHome();}
function showPg(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}

renderHome();
