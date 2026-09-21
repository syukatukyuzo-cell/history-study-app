// Pure scheduling and balanced selection, independent of the screen.
window.ShortStudyCore = (() => {
 const day=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const later=(date,n)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return day(d);};
 function update(previous,correct,today=day()) {
  const r={seen:0,correct:0,wrong:0,streak:0,weak:false,...previous};
  r.seen++;r.correct+=Number(correct);r.wrong+=Number(!correct);
  if(!correct){r.streak=0;r.weak=true;r.lastSuccess=null;r.due=later(today,1);}
  else if(r.lastSuccess!==today&&r.last!==today){r.streak=Math.min(3,r.streak+1);r.lastSuccess=today;r.due=later(today,[1,3,7,14][r.streak]);if(r.streak>=3)r.weak=false;}
  r.last=today;return r;
 }
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 function select(bank,records,size,today=day()) {
  const groups={};for(const q of shuffle(bank)){(groups[q.category]??=[]).push(q);}
  const priority=q=>{const r=records[q.id];return !r?1:r.due&&r.due<=today?0:r.weak?2:3;};
  Object.values(groups).forEach(a=>a.sort((a,b)=>priority(a)-priority(b)));
  const result=[],cats=shuffle(Object.keys(groups));while(result.length<size){let added=false;for(const c of cats){if(groups[c].length&&result.length<size){result.push(groups[c].shift());added=true;}}if(!added)break;}return shuffle(result);
 }
 function belongs(q,scope){
  if(scope==='mission')return true;
  if(scope==='history')return q.legacy?.subject==='history'||q.subject==='social'&&q.category!=='通常問題';
  if(scope==='civics')return q.legacy?.subject==='civics';
  if(scope==='biology')return q.subject==='science'&&['細胞分裂','生殖','遺伝・進化'].includes(q.category);
  if(scope==='physics')return q.subject==='science'&&['物体の運動','力・浮力'].includes(q.category);
  return q.subject===scope;
 }
 function mission(bank,records,size=5,today=day()){
  const tiers=[[],[],[],[]];
  for(const q of bank){const r=records[q.id];tiers[r?.due&&r.due<=today?0:r?.weak?1:!r||!r.seen?2:3].push(q);}
  const result=[];for(const tier of tiers){result.push(...select(tier,records,size-result.length,today));if(result.length>=size)break;}return shuffle(result);
 }
 return {day,later,update,shuffle,select,belongs,mission};
})();
