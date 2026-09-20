(() => {
'use strict';
const el=id=>document.getElementById(id),main=document.querySelector('main');
const surface=document.createElement('div');surface.id='studySurface';
main.insertBefore(surface,el('englishModes'));
for(const id of ['englishModes','vocabulary','home','quiz','finish'])surface.append(el(id));
const nav=document.createElement('nav');nav.className='app-nav';nav.setAttribute('aria-label','メインメニュー');
nav.innerHTML='<div class="nav-brand">✿ きょうも、一歩。<small>わたしの未来へ、少しずつ。</small></div>'+[['home','⌂','ホーム'],['study','▣','学習'],['review','↻','復習'],['records','▥','記録'],['more','⋯','その他']].map(([id,icon,label])=>`<button data-view="${id}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')+'<p class="nav-message">小さな「わかった！」が、<br>未来のわたしの力になる。<br>✧ 自分のペースでいこう。</p>';
document.body.prepend(nav);
const dashboard=document.createElement('section');dashboard.id='dashboardPanel';dashboard.className='dashboard-grid';
dashboard.innerHTML='<div class="card"><h2>☀ 今日の学習</h2><div id="dailyMetrics"></div><p class="tiny">今日も、ひとつの「わかった！」から。</p></div><div class="card encourage"><span class="eyebrow">A LITTLE EVERY DAY</span><h2>昨日より、ちょっと前へ。</h2><p>まちがえた問題は、伸びしろ。<br>自分のペースで、何度でも。</p><button id="dailyReview">↻ 苦手をひとつ復習する</button></div>';
main.insertBefore(dashboard,surface);
for(const [id,html] of [
['reviewPanel','<h2 class="panel-heading" tabindex="-1">↻ もう一度で、自信に。</h2><p>苦手や「ふりかえる」に保存した問題を、少しずつ。</p><div class="review-cards" id="reviewCards"></div><h2>英単語1800</h2><p>レベルごとの「苦手だけ復習」から始めよう。</p><button id="reviewVocabulary" class="primary">英単語の復習へ →</button>'],
['recordsPanel','<h2 class="panel-heading" tabindex="-1">✧ 積み重ねた、わたしの記録</h2><p>小さな一歩も、ちゃんと力になっている。</p><div id="recordContent"></div>'],
['morePanel','<h2 class="panel-heading" tabindex="-1">その他</h2><h2>学習のヒント</h2><p>「わかる」で単語を習得済みに。「ふりかえる」で問題を保存できます。</p><p>発音は端末の音声機能を使います。音が聞こえないときは、音量と消音設定を確認してください。</p><h2>記録について</h2><p>学習進捗は、この端末・ブラウザに保存されます。</p><details><summary>教科の記録を整理する</summary><p class="tiny">学習画面で選択中の教科が対象です。道のりの最高到達距離は維持されます。</p><div id="resetContainer"></div></details><h2>道のりのゴール</h2><p>ここでのゴールは学習の達成を表します。受験結果を保証するものではありません。</p>']]){
const section=document.createElement('section');section.id=id;section.innerHTML=html;section.hidden=true;main.insertBefore(section,main.querySelector('footer'));
}
el('resetContainer').append(el('reset'));
const flags=document.createElement('div');flags.className='milestone-flags';flags.setAttribute('aria-hidden','true');
flags.innerHTML=window.JOURNEY_CONFIG.checkpoints.filter(n=>n<window.JOURNEY_CONFIG.totalDistanceMeters).map(n=>`<span>${n/1000}km</span>`).join('');document.querySelector('.landscape').append(flags);
// Read existing records without changing their keys, structure or ownership.
function read(key,fallback={}){try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}}
const subjects=[['history','歴史'],['civics','公民'],['english','北辰英語']];
function totals(s){const qs=Q.filter(q=>q.subject===s);let seen=0,correct=0,weak=0,star=0;for(const q of qs){const r=records[s][q.id]||{};seen+=Number(r.seen)||0;correct+=Number(r.correct)||0;weak+=Number(typeof r.weak==='boolean'?r.weak:(r.wrong||0)>(r.correct||0));star+=Number(!!r.star);}return {seen,correct,weak,star,rate:seen?Math.round(correct/seen*100):0};}
function metric(label,value){const row=document.createElement('div');row.className='metric-row';const a=document.createElement('span'),b=document.createElement('b');a.textContent=label;b.textContent=value;row.append(a,b);return row;}
const activityKey='history-study-app.activity.v1';let daily=read(activityKey);let activityWritable=typeof daily==='object'&&!Array.isArray(daily);if(!activityWritable)daily={};
const day=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function refresh(){
for(const [s] of subjects){const b=document.querySelector(`.subjects [data-subject="${s}"]`),t=totals(s);let meter=b.querySelector('.subject-meter');if(!meter){meter=document.createElement('span');meter.className='subject-meter';meter.innerHTML='<i></i>';const score=document.createElement('span');score.className='subject-score';b.append(meter,score);}meter.firstChild.style.width=t.rate+'%';b.querySelector('.subject-score').textContent=t.seen?`正答率 ${t.rate}% · ${t.seen}回`:'ここから、はじめよう';}
const d=daily[day()]||{};el('dailyMetrics').replaceChildren(metric('解いた問題',(d.seen||0)+' 問'),metric('正解した問題',(d.correct||0)+' 問'),metric('今日の前進',el('todayDistance').textContent));
el('recordContent').replaceChildren(metric('最高到達距離',el('currentDistance').textContent),metric('今週の前進',el('weekDistance').textContent));
for(const [s,label] of subjects){const t=totals(s);el('recordContent').append(metric(label,`${t.seen}回解答 / 正答率 ${t.seen?t.rate+'%':'—'}`));}
const vocab=read('history-study-app.target1800.v1').words||{};el('recordContent').append(metric('英単語の習得',Object.values(vocab).filter(v=>v.status==='mastered').length+' 語'));
el('reviewCards').replaceChildren();for(const [s,label] of subjects){const t=totals(s);for(const [mode,count,name] of [['weak',t.weak,'苦手'],['review',t.star,'ふりかえる']]){const b=document.createElement('button');b.innerHTML=`<b>${label}</b><small>${name} ${count}問 →</small>`;b.onclick=()=>{document.querySelector(`.subjects [data-subject="${s}"]`).click();if(s==='english')el('hokushinMode').click();el('mode').value=mode;el('selectAll').click();el('mode').dispatchEvent(new Event('change'));setView('study');el('mode').focus();};el('reviewCards').append(b);}}
}
function setView(view){document.body.dataset.view=view;for(const b of nav.querySelectorAll('button')){if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}for(const [id,v] of [['reviewPanel','review'],['recordsPanel','records'],['morePanel','more']])el(id).hidden=view!==v;refresh();window.scrollTo({top:0,behavior:'instant'});if(view!=='study'&&'speechSynthesis' in window)speechSynthesis.cancel();}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setView(b.dataset.view);});
for(const b of document.querySelectorAll('.subjects button'))b.addEventListener('click',()=>setView('study'));
el('vocabShortcut').addEventListener('click',()=>setView('study'));
el('dailyReview').onclick=()=>setView('review');el('reviewVocabulary').onclick=()=>el('vocabShortcut').click();
// Decorate generated level cards, leaving quiz logic and handlers intact.
const levels=new MutationObserver(()=>{for(const card of el('vocabLevels').children){if(card.querySelector('.master-meter'))continue;const values=card.querySelectorAll('.stats b');const mastered=Number(values[0]?.textContent)||0,left=Number(values[1]?.textContent)||0;const meter=document.createElement('div');meter.className='master-meter';meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','単語の習得率');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');const rate=Math.round(mastered/Math.max(1,mastered+left)*100);meter.setAttribute('aria-valuenow',String(rate));meter.innerHTML=`<span style="width:${rate}%"></span>`;card.querySelector('.stats').after(meter);}});levels.observe(el('vocabLevels'),{childList:true});
let toastTimer;function celebrate(){document.querySelector('.celebration')?.remove();const box=document.createElement('div');box.className='celebration';box.setAttribute('aria-hidden','true');for(let i=0;i<18;i++){const p=document.createElement('i');p.style.cssText=`--c:${['#f56caa','#7cbdee','#71cbb2','#ffd58e'][i%4]};--x:${Math.cos(i)*150}px;--y:${70+Math.sin(i)*120}px;--r:${i*31}deg`;box.append(p);}document.body.append(box);setTimeout(()=>box.remove(),1100);}
const journey=window.studyJourney;if(journey){const answer=journey.answer.bind(journey),master=journey.master.bind(journey);journey.answer=(id,correct,wasWeak)=>{answer(id,correct,wasWeak);const d=daily[day()]||{seen:0,correct:0};d.seen=(Number(d.seen)||0)+1;d.correct=(Number(d.correct)||0)+Number(correct);daily[day()]=d;if(activityWritable)try{localStorage.setItem(activityKey,JSON.stringify(daily));}catch{}if(correct)celebrate();};journey.master=id=>{master(id);celebrate();};}
new MutationObserver(()=>{let toast=document.querySelector('.reward-toast');if(!toast){toast=document.createElement('div');toast.className='reward-toast';document.body.append(toast);}toast.replaceChildren();const sprite=document.createElement('img');sprite.src='runner.png';sprite.alt='';toast.append(sprite,document.createTextNode(el('journeyMessage').textContent));clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.remove(),2800);}).observe(el('journeyMessage'),{childList:true});
setView('home');
})();
