(() => {
  'use strict';
  const c=window.JOURNEY_CONFIG, key='history-study-app.journey.v1';
  const $=id=>document.getElementById(id);
  const empty=()=>({version:1,points:0,distance:0,highestDistance:0,rewards:{},days:{}});
  let state=empty(),writable=true,timer;
  const valid=n=>Number.isFinite(n)&&n>=0;
  function notice(){ $('journeyNotice').hidden=false;$('journeyNotice').textContent='道のりの記録を保存できません。この画面では続けられますが、閉じると今回の前進が失われる場合があります。'; }
  try {
    const raw=localStorage.getItem(key);
    if(raw){const x=JSON.parse(raw);if(x.version!==1||![x.points,x.distance,x.highestDistance].every(valid)||!x.rewards||typeof x.rewards!=='object'||Array.isArray(x.rewards)||!x.days||typeof x.days!=='object'||Array.isArray(x.days)||!Object.values(x.days).every(valid))throw Error();state=x;state.distance=Math.max(x.distance,x.highestDistance);}
  }catch{writable=false;notice();}
  function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function distance(n){return n>=1000?`${(n/1000).toFixed(2)} km`:`${Math.round(n)} m`;}
  function render(){
    const total=c.totalDistanceMeters,at=state.highestDistance,remaining=Math.max(0,total-at),ratio=Math.min(1,at/total),today=new Date(),monday=new Date(today);
    monday.setDate(today.getDate()-(today.getDay()+6)%7);
    const start=dateKey(monday),end=dateKey(today);
    $('remainingDistance').textContent=remaining>0&&remaining<100?String(Math.ceil(remaining)):(remaining/1000).toFixed(2);
    $('distanceUnit').textContent=remaining>0&&remaining<100?'m':'km';
    $('currentDistance').textContent=distance(at);
    $('todayDistance').textContent='+'+distance(state.days[end]||0);
    $('weekDistance').textContent='+'+distance(Object.entries(state.days).reduce((n,[d,v])=>n+(d>=start&&d<=end?v:0),0));
    $('runner').style.left=`${ratio*100}%`;$('routeFill').style.width=`${ratio*100}%`;
    $('checkpoints').replaceChildren();
    for(const n of [0,...c.checkpoints.filter(n=>n>0&&n<total),total]){const e=document.createElement('span');e.textContent=n===0?'START':n===total?'GOAL':distance(n);e.className=at>=n?'reached':'';e.title=at>=n?'到達済み':'これから';$('checkpoints').append(e);}
    if(at>=total)$('journeyMessage').textContent='🎉 武南高校ゴールに到着！ 今日までの積み重ね、おめでとう！';
  }
  function reward(id,type,points){
    // Each learning milestone is rewarded once, including after unmastering or quiz resets.
    const token=JSON.stringify([id,type]);if(Object.hasOwn(state.rewards,token))return;
    const meters=points*c.metersPerPoint;if(!valid(meters)||!valid(points))return;
    const before=state.highestDistance;state.rewards[token]=true;state.points+=points;state.distance+=meters;state.highestDistance=Math.max(before,state.distance);
    const day=dateKey(new Date());state.days[day]=(state.days[day]||0)+meters;
    if(writable)try{localStorage.setItem(key,JSON.stringify(state));}catch{notice();}
    render();
    $('journeyMessage').textContent=`+${distance(meters)} ${type==='recovery'?'苦手をひとつ克服！':type==='mastery'?'単語をひとつ習得！':'わかった！ 一歩前へ。'}`;
    const crossed=[...c.checkpoints,c.totalDistanceMeters].filter(n=>n>before&&n<=state.highestDistance);
    if(crossed.length)$('journeyMessage').textContent+=crossed.includes(c.totalDistanceMeters)?' 🎉 学習のゴールに到着！':` ✨ ${distance(crossed.at(-1))}のチェックポイントに到着！`;
    clearTimeout(timer);$('runner').classList.remove('running');void $('runner').offsetWidth;$('runner').classList.add('running');timer=setTimeout(()=>$('runner').classList.remove('running'),1600);
  }
  window.studyJourney={answer(id,correct,wasWeak){if(correct){reward(id,'correct',c.correctPoints);if(wasWeak)reward(id,'recovery',c.weakRecoveryBonus);}},master(id){reward(id,'mastery',c.vocabularyMasteryPoints);}};
  $('vocabShortcut').onclick=()=>{document.querySelector('[data-subject="english"]').click();$('vocabularyMode').click();$('vocabulary').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  render();
})();
