import { makeRng } from '../engine/rng.js';
import { makeItem, factKeys } from '../engine/items/index.js';
import { newPlacement, applyProbe } from '../engine/placement.js';
import { inRelease } from '../engine/skills.js';
import { inWords } from '../js/numbers.js';

export const K = { WORLD: { w: 1400, h: 800 }, WALK_SPEED: 190, RADIUS: 18, REACH: 70, HOLD_REPEAT_MS: 250, DAY: { grass: 10859598, light: 16770484, shade: 6846537 } };
const validCount = n => Number.isSafeInteger(n) && n >= 0;
export function numberWord(n, capital = false) {
  if (!Number.isInteger(n) || n < 2 || n > 24) throw RangeError('number outside morning range');
  const w = inWords(n); return capital ? w[0].toUpperCase() + w.slice(1) : w;
}
export function pickItems(seed) {
  const rng = makeRng(seed);
  const pool = factKeys('facts-3-4').filter(key => key.split('x').map(Number).reduce((a,b)=>a*b) <= 24);
  const keys = {};
  for (const job of ['apples','eggs','extra']) { const key = rng.pick(pool); pool.splice(pool.indexOf(key),1); keys[job] = key; }
  keys.socks = rng.pick(factKeys('facts-2-5-10').filter(k=>/^2x[2-5]$/.test(k)));
  return Object.fromEntries(['apples','socks','eggs','extra'].map(job=>{
    const [a,b] = keys[job].split('x').map(Number), groups = job==='socks'?b:a, perGroup=job==='socks'?2:b;
    const skill=job==='socks'?'facts-2-5-10':'facts-3-4';
    const item=makeItem(skill,makeRng(`${seed}:${job}`),{sum:{op:'×',a:groups,b:perGroup}});
    return [job,{job,skill,item,groups,perGroup,carry:job==='socks'?2:perGroup,answer:item.answer.value}];
  }));
}
export function askLines(d) {
  const g=numberWord(d.groups,true), p=numberWord(d.perGroup);
  switch(d.job){
    case 'apples': return [`${g} rows of ${p} for the pie, little map.`];
    case 'socks': return [`${g} pairs on the line, little map.`];
    case 'eggs': return [`${g} nests, ${p} eggs from each.`, 'Into the crate, little map.'];
    case 'extra': return ['One more pie, little map.', `${g} rows of ${p}.`];
    default: throw Error('unknown job');
  }
}
export function allNumberedLines(){return [...new Set([101,202,303].flatMap(seed=>Object.values(pickItems(seed)).flatMap(d=>askLines(d).filter(s=>s!=='One more pie, little map.'&&s!=='Into the crate, little map.'))))].sort();}
export function newJob(d, _clock) { return {...d,carried:0,carriedGround:0,ground:[],set:0,misses:0,help:null,done:false,askFinishedAt:null,firstPickupAt:null,firstCheckAt:null,resumed:false,result:null}; }
export function pickUp(s,nowMs=Date.now()) {
  if(s.done || s.carriedGround || s.carried+s.carriedGround>=s.carry || !validCount(s.carried+1)) return false;
  s.carried++; if(s.firstPickupAt===null)s.firstPickupAt=nowMs; return true;
}
export function setDown(s){
  if(s.done||s.carried+s.carriedGround===0||!validCount(s.set+1)||(s.help==='copy'&&s.set>=s.answer))return false;
  if(s.carriedGround)s.carriedGround--;else s.carried--; s.set++;return true;
}
export function putBack(s){if(s.done||!s.carriedGround)return false;s.carriedGround--;return true;}
export function pickGround(s,pos){
  if(s.done)return false;let best=-1,dist=Infinity;
  s.ground.forEach((p,i)=>{const d=Math.hypot(p.x-pos.x,p.y-pos.y);if(d<=K.REACH&&d<dist){best=i;dist=d;}});
  if(best<0||!validCount(s.carriedGround+1)||!validCount(s.carried+s.carriedGround+1))return false;s.ground.splice(best,1);s.carriedGround++;return true;
}
export function cellAt(index,perGroup){if(!validCount(index)||!Number.isSafeInteger(perGroup)||perGroup<1)throw RangeError('invalid cell');return {row:Math.floor(index/perGroup),col:index%perGroup};}
export function goldCells(groups,perGroup){if(!Number.isSafeInteger(groups)||groups<1||!Number.isSafeInteger(perGroup)||perGroup<1)throw RangeError('invalid grid');return Array.from({length:groups*perGroup},(_,i)=>cellAt(i,perGroup));}
const legal=(p,obs,world)=>p.x>=K.RADIUS&&p.y>=K.RADIUS&&p.x<=world.w-K.RADIUS&&p.y<=world.h-K.RADIUS&&!obs.some(r=>{
  const dx=p.x-Math.max(r.x,Math.min(p.x,r.x+r.w)),dy=p.y-Math.max(r.y,Math.min(p.y,r.y+r.h));return dx*dx+dy*dy<K.RADIUS*K.RADIUS-1e-8;
});
export function groundRing(at,n,obstacles,world){
  if(!validCount(n))throw RangeError('invalid extras');if(!n)return [];
  const slots=[];for(let y=-60;y<=60;y+=20)for(let x=-60;x<=60;x+=20){const p={x:at.x+x,y:at.y+y};if(p.x>=K.RADIUS&&p.y>=K.RADIUS&&p.x<=world.w-K.RADIUS&&p.y<=world.h-K.RADIUS&&!obstacles.some(r=>p.x>r.x-K.RADIUS&&p.x<r.x+r.w+K.RADIUS&&p.y>r.y-K.RADIUS&&p.y<r.y+r.h+K.RADIUS))slots.push(p);}
  slots.sort((a,b)=>((a.x-at.x)**2+(a.y-at.y)**2)-((b.x-at.x)**2+(b.y-at.y)**2)||a.y-b.y||a.x-b.x);
  if(!slots.length)throw Error('no legal ground slot');return Array.from({length:n},(_,i)=>({...slots[i%slots.length]}));
}
export function check(s,nowMs,layout){
  if(s.done||s.set===0)return null;
  if(s.firstCheckAt===null)s.firstCheckAt=nowMs;
  const right=s.set===s.answer&&s.ground.length===0&&s.carriedGround===0;
  if(right){
    const copied=s.help==='copy',start=s.askFinishedAt??s.firstPickupAt;
    s.result={phase:copied?'helped':s.job==='socks'?'practice':'placement',correct:true,firstTry:s.misses===0&&s.help===null,ms:s.resumed||start===null?null:Math.max(0,s.firstCheckAt-start),method:s.item.method,...(copied?{shown:1}:{})};
    s.done=true;s.carried=0;s.carriedGround=0;s.ground=[];s.set=0;return {verdict:copied?'copy-done':'right',help:s.help,...s.result};
  }
  if(s.help==='copy')return {verdict:'short',help:'copy'};
  s.misses=Math.min(2,s.misses+1);
  if(s.misses===2){s.help='copy';s.carried=0;s.carriedGround=0;s.ground=[];s.set=Math.min(s.set,s.answer);return {verdict:s.set===s.answer?'many':'short',help:'copy'};}
  s.help='lines';
  if(s.set>s.answer){s.ground.push(...groundRing(layout.at,s.set-s.answer,layout.obstacles,layout.world));s.set=s.answer;return {verdict:'many',help:s.help};}
  return {verdict:s.ground.length||s.carriedGround?'many':'short',help:s.help};
}
export function actionTarget(pos,s,stage,objects){
  const found=[],add=(kind,id,at,rank)=>{if(!at)return;const distance=Math.hypot(pos.x-at.x,pos.y-at.y);if(distance<=K.REACH)found.push({kind,objectId:id,distance,rank});};
  if(['apples','socks','eggs','extra'].includes(stage)&&s&&!s.done){
    const source={apples:'appleTree',extra:'appleTree',eggs:'henHouse',socks:'sockBasket'}[stage],target={apples:'pieBasket',extra:'pieBasket',eggs:'eggCrate',socks:'washingLine'}[stage];
    for(const o of objects){if(o.id===source&&(s.carriedGround||s.carried+s.carriedGround<s.carry))add(s.carriedGround?'putBack':'pickUp',o.id,o.at,s.carried+s.carriedGround===0?(s.set>0?1:0):3);if(o.id===target&&s.carried+s.carriedGround>0&&!(s.help==='copy'&&s.set>=s.answer))add('setDown',o.id,o.at,0);if(o.id==='cottage'&&s.set>0)add('check',o.id,o.at,s.carried+s.carriedGround===0?0:2);}
    s.ground.forEach((p,i)=>add('pickGround',String(i),p,0));
  }
  // Collect reachable extras before offering to put a carried extra back on the target.
  const options=found.some(f=>f.kind==='pickGround')?found.filter(f=>f.kind!=='setDown'):found;
  options.sort((a,b)=>a.distance-b.distance||a.rank-b.rank||a.objectId.localeCompare(b.objectId));
  return options.length?{kind:options[0].kind,objectId:options[0].objectId}:{kind:'none',objectId:null};
}
export function step(pos,dir,dtSeconds,obstacles,world){
  const m=Math.hypot(dir.x,dir.y);if(!m||!Number.isFinite(m))return {...pos};
  const length=K.WALK_SPEED*Math.max(0,Math.min(.1,dtSeconds)),n=Math.max(1,Math.ceil(length/4)),dx=dir.x/m*length/n,dy=dir.y/m*length/n;
  let p={...pos};for(let i=0;i<n;i++){
    const x={x:Math.max(K.RADIUS,Math.min(world.w-K.RADIUS,p.x+dx)),y:p.y};if(legal(x,obstacles,world))p=x;
    const y={x:p.x,y:Math.max(K.RADIUS,Math.min(world.h-K.RADIUS,p.y+dy))};if(legal(y,obstacles,world))p=y;
  }return p;
}
export function reachable(start,at,obstacles,world,reach=K.REACH){
  const snap=p=>({x:K.RADIUS+Math.round((p.x-K.RADIUS)/20)*20,y:K.RADIUS+Math.round((p.y-K.RADIUS)/20)*20});
  const first=snap(start);if(!legal(first,obstacles,world))return false;
  const queue=[first],seen=new Set([`${first.x},${first.y}`]);
  for(let i=0;i<queue.length;i++){const p=queue[i];if(Math.hypot(p.x-at.x,p.y-at.y)<=reach)return true;for(const [dx,dy] of [[20,0],[-20,0],[0,20],[0,-20]]){const q={x:p.x+dx,y:p.y+dy},key=`${q.x},${q.y}`;if(!seen.has(key)&&legal(q,obstacles,world)){seen.add(key);queue.push(q);}}}return false;
}
export function probeResult(results){const right=results.filter(r=>r?.firstTry===true).length;return {needsExtra:results.length===2&&right===1,right};}
export function stageNext(stage,results={}){const order={start:'apples',apples:'socks',socks:'eggs',extra:'lantern',lantern:'grey',grey:'lamp',lamp:'ambrose',ambrose:'end'};if(stage==='eggs'){if(!results.apples||!results.eggs)throw Error('probe results missing');return probeResult([results.apples,results.eggs]).needsExtra?'extra':'lantern';}if(!order[stage])throw Error('illegal stage');return order[stage];}
export function placementEvents(right,runId){const p=newPlacement(inRelease(6).map(s=>s.id));return applyProbe(p,'facts-3-4',right).settled.map(r=>({type:'placed',data:{id:`unmapped-morning-${runId}-placed-${r.skill}`,...r}}));}
export function answerEvent(d,s,runId){if(!s.done||!s.result)throw Error('job unfinished');return {id:`unmapped-morning-${runId}-answer-${d.job}`,skill:d.skill,key:d.item.key,...s.result};}
