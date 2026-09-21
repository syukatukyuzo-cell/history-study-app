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
 return {day,later,update,shuffle,select};
})();
