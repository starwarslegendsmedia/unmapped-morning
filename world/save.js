import { K, pickItems, newJob, stageNext, probeResult, placementEvents, answerEvent } from './logic.js';
import { EVENTS_KEY } from '../engine/store.js';

export const SAVE_KEY = 'unmapped-morning.save.v1';
const NAMES=['apples','socks','eggs','extra'];
const STAGES=['start',...NAMES,'lantern','grey','lamp','ambrose','end'];
const FIELDS=['job','carried','carriedGround','ground','set','misses','help','done','askFinishedAt','firstPickupAt','firstCheckAt','resumed','result'];
const ROOT=['v','runId','rev','variant','stage','jobIndex','jobs','pending','pos','savedAt'];
const leases=new WeakSet();
const count=n=>Number.isSafeInteger(n)&&n>=0;
const time=n=>Number.isFinite(n)&&n>=0;
const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const keys=(x,names)=>record(x)&&Object.keys(x).length===names.length&&names.every(k=>Object.hasOwn(x,k));
const canonical=x=>Array.isArray(x)?x.map(canonical):record(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const point=p=>keys(p,['x','y'])&&time(p.x)&&time(p.y)&&p.x<=K.WORLD.w&&p.y<=K.WORLD.h;
const pristine=j=>!j.done&&!j.carried&&!j.carriedGround&&!j.set&&!j.ground.length&&!j.misses&&j.help===null&&j.result===null&&!j.resumed&&j.askFinishedAt===null&&j.firstPickupAt===null&&j.firstCheckAt===null;
const resultMap=s=>Object.fromEntries(s.jobs.map(j=>[j.job,j.result]));
function definition(variant){return pickItems([101,202,303][variant-1]);}
function expected(s,destination){
  if(destination.nextStage==='start')return [{type:'story',data:{id:`unmapped-morning-${s.runId}-story-start`,story:'unmapped-morning',scene:'start'}}];
  const out=[],j=s.jobs[s.jobIndex];
  if(NAMES.includes(s.stage))out.push({type:'answer',data:answerEvent(j,j,s.runId)});
  if(destination.nextStage==='lantern')out.push(...placementEvents(probeResult([s.jobs[0].result,s.jobs[2].result,...(s.jobIndex===3?[s.jobs[3].result]:[])]).right,s.runId));
  out.push({type:'story',data:{id:`unmapped-morning-${s.runId}-story-${destination.nextStage}`,story:'unmapped-morning',scene:destination.nextStage}});return out;
}
function destinationOK(s,d){
  if(!keys(d,['nextStage','nextJobIndex']))return false;
  if(s.stage==='start'&&d.nextStage==='start')return d.nextJobIndex===0;
  if(NAMES.includes(s.stage)&&!s.jobs[s.jobIndex].done)return false;
  try{const next=stageNext(s.stage,resultMap(s));return d.nextStage===next&&d.nextJobIndex===(NAMES.includes(next)?NAMES.indexOf(next):s.jobIndex);}catch{return false;}
}
function pendingOK(s,p){
  if(!keys(p,['nextStage','nextJobIndex','events'])||!Array.isArray(p.events)||!p.events.length||!destinationOK(s,{nextStage:p.nextStage,nextJobIndex:p.nextJobIndex}))return false;
  let want;try{want=expected(s,p);}catch{return false;}
  if(want.length!==p.events.length)return false;
  const ids=new Set();
  return p.events.every((e,i)=>{
    if(!keys(e,['type','data'])||!record(e.data)||!time(e.data.t)||typeof e.data.device!=='string'||!e.data.device||ids.has(e.data.id))return false;
    ids.add(e.data.id);const {t,device,...data}=e.data;return equal({type:e.type,data},want[i]);
  });
}
function valid(doc){
  if(!keys(doc,ROOT)||doc.v!==1||typeof doc.runId!=='string'||!doc.runId||!count(doc.rev)||![1,2,3].includes(doc.variant)||!STAGES.includes(doc.stage)||!point(doc.pos)||!time(doc.savedAt)||!Array.isArray(doc.jobs)||doc.jobs.length!==4||!count(doc.jobIndex)||doc.jobIndex>3)return false;
  const defs=definition(doc.variant);
  for(let i=0;i<4;i++){
    const j=doc.jobs[i],d=defs[NAMES[i]];
    if(!keys(j,FIELDS)||j.job!==NAMES[i]||!count(j.carried)||!count(j.carriedGround)||!count(j.carried+j.carriedGround)||!count(j.set)||j.carried>d.carry||!Array.isArray(j.ground)||!j.ground.every(point)||!Number.isInteger(j.misses)||j.misses<0||j.misses>2||![null,'lines','copy'].includes(j.help)||typeof j.done!=='boolean'||typeof j.resumed!=='boolean'||![j.askFinishedAt,j.firstPickupAt,j.firstCheckAt].every(x=>x===null||time(x)))return false;
    if(j.help==='copy'&&(j.set>d.answer||j.misses!==2))return false;
    if(j.help==='lines'&&j.misses!==1)return false;
    if(j.help===null&&j.misses!==0)return false;
    if(j.done){
      const r=j.result,phase=j.help==='copy'?'helped':j.job==='socks'?'practice':'placement';
      if(!keys(r,['phase','correct','firstTry','ms','method',...(phase==='helped'?['shown']:[])])||r.phase!==phase||r.correct!==true||typeof r.firstTry!=='boolean'||r.firstTry!==(j.misses===0&&j.help===null)||(r.ms!==null&&!time(r.ms))||r.method!==d.item.method||j.resumed&&r.ms!==null||(phase==='helped'&&r.shown!==1)||j.carried||j.carriedGround||j.ground.length||j.set)return false;
    }else if(j.result!==null)return false;
  }
  const s=rehydrate(doc,false),idx=NAMES.indexOf(doc.stage);
  if(doc.stage==='start'){
    if(doc.jobIndex!==0||doc.jobs.some(j=>!pristine(j)))return false;
  }else if(idx>=0){
    if(doc.jobIndex!==idx||doc.jobs.slice(0,idx).some(j=>!j.done)||doc.jobs.slice(idx+1).some(j=>!pristine(j))||doc.jobs[idx].done&&doc.pending===null)return false;
    if(doc.stage==='extra'&&!probeResult([doc.jobs[0].result,doc.jobs[2].result]).needsExtra)return false;
  }else{
    if(doc.jobs.slice(0,3).some(j=>!j.done))return false;
    const split=probeResult([doc.jobs[0].result,doc.jobs[2].result]).needsExtra;
    if(doc.jobIndex!==(split?3:2)||doc.jobs[3].done!==split||!split&&!pristine(doc.jobs[3]))return false;
  }
  return doc.pending===null||pendingOK(s,doc.pending);
}
function encode(s){
  return {v:s.v,runId:s.runId,rev:s.rev,variant:s.variant,stage:s.stage,jobIndex:s.jobIndex,jobs:s.jobs.map(j=>Object.fromEntries(FIELDS.map(k=>[k,j[k]]))),pending:s.pending,pos:s.pos,savedAt:s.savedAt};
}
function rehydrate(doc,resume){
  const defs=definition(doc.variant),s=structuredClone(doc);
  s.jobs=s.jobs.map(j=>({...newJob(defs[j.job]),...j}));
  if(resume&&NAMES.includes(s.stage)&&!s.jobs[s.jobIndex].done)s.jobs[s.jobIndex].resumed=true;
  return s;
}
export function loadSave(storage){try{const raw=JSON.parse(storage.getItem(SAVE_KEY));return valid(raw)?rehydrate(raw,true):null;}catch{return null;}}
export function saveNow(state,storage){
  try{
    const doc=JSON.parse(JSON.stringify(encode(state)));if(!valid(doc))return false;
    const text=storage.getItem(SAVE_KEY),old=text?JSON.parse(text):null;
    if(old){
      if(old.runId!==state.runId||!count(old.rev))return false;
      if(old.rev!==state.rev&&STAGES.indexOf(state.stage)<=STAGES.indexOf(old.stage))return false;
    }
    doc.rev=(old?.rev??state.rev)+1;if(!count(doc.rev))return false;doc.savedAt=Date.now();
    storage.setItem(SAVE_KEY,JSON.stringify(doc));state.rev=doc.rev;state.savedAt=doc.savedAt;return true;
  }catch{return false;}
}
export function openSession(locks){
  return new Promise(resolve=>{
    if(!locks?.request){resolve(null);return;}
    try{
      Promise.resolve(locks.request('unmapped-morning.session',{mode:'exclusive',ifAvailable:true},lock=>{
        if(!lock){resolve(null);return;}
        let finish;const waiting=new Promise(r=>{finish=r;});
        const lease={release(){if(leases.has(lease)){leases.delete(lease);finish();}}};leases.add(lease);resolve(lease);return waiting;
      })).catch(()=>resolve(null));
    }catch{resolve(null);}
  });
}
export function beginNewRun(completed,proposed,{storage,lease}){
  if(!leases.has(lease))return false;
  try{
    const old=JSON.parse(storage.getItem(SAVE_KEY)),p=JSON.parse(JSON.stringify(encode(proposed)));
    if(!valid(p)||p.stage!=='start')return false;
    if(old?.runId===p.runId){
      const wanted={...p,rev:old.rev,savedAt:old.savedAt};
      if(old.rev!==1||!equal(wanted,old))return false;
      const live=rehydrate(old,false);Object.assign(proposed,live);Object.assign(completed,structuredClone(live));return true;
    }
    if(!valid(old)||old.stage!=='end'||old.runId!==completed.runId||old.rev!==completed.rev||p.runId===completed.runId)return false;
    const candidate={...p,rev:1,savedAt:Date.now()};storage.setItem(SAVE_KEY,JSON.stringify(candidate));
    const live=rehydrate(candidate,false);Object.assign(proposed,live);Object.assign(completed,structuredClone(live));return true;
  }catch{return false;}
}
export function commitTransition(state,destination,descriptors,{store,storage,clock=Date.now}){
  try{
    if(!state.pending){
      if(!destinationOK(state,destination)||!equal(descriptors,expected(state,destination)))return false;
      const t=clock(),device=store.device;
      state.pending={...destination,events:descriptors.map(e=>({type:e.type,data:{...structuredClone(e.data),t,device}}))};
    }
    if(!pendingOK(state,state.pending)||!saveNow(state,storage))return false;
    return drainPending(state,store,storage);
  }catch{return false;}
}
export function drainPending(state,store,storage){
  try{
    const p=state.pending;if(!p)return true;if(!pendingOK(state,p))return false;
    const retained=JSON.parse(storage.getItem(SAVE_KEY));if(retained?.runId!==state.runId||retained.rev!==state.rev||!equal(retained.pending,p))return false;
    const saved=()=>{const text=storage.getItem(EVENTS_KEY);if(text===null)return [];try{const a=JSON.parse(text);return Array.isArray(a)?a:[];}catch{return [];}};
    for(const e of p.events){
      const full={type:e.type,...e.data};let existing=saved().find(x=>x.id===e.data.id);
      if(existing&&!equal(existing,full))return false;
      if(!existing){store.add(e.type,e.data);existing=saved().find(x=>x.id===e.data.id);if(!existing){store.save();existing=saved().find(x=>x.id===e.data.id);}if(!equal(existing,full))return false;}
    }
    const candidate=structuredClone(state);candidate.stage=p.nextStage;candidate.jobIndex=p.nextJobIndex;candidate.pending=null;
    if(!saveNow(candidate,storage))return false;
    Object.assign(state,candidate);return true;
  }catch{return false;}
}
