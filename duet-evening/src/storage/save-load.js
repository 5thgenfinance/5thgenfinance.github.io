
export const STORAGE_KEY='duet-evening-recovery-v1';
const phases=['handoff_key','private','handoff_guess','guess','tourniquet','activity','finished'];
const types=['agent','bystander','assassin'];
const int=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
function check(ok,message){if(!ok)throw new Error(`Invalid save: ${message}`);}
function indices(a){return Array.isArray(a)&&a.length<=25&&a.every(x=>int(x,0,24))&&new Set(a).size===a.length;}
function card(c){return c&&typeof c.id==='string'&&typeof c.name==='string'&&typeof c.text==='string'&&c.name.length<=200&&c.text.length<=4000&&(c.duration_sec===null||c.duration_sec===undefined||int(c.duration_sec,0,3600));}
function event(e){
  if(!e||typeof e!=='object')return false;
  if(e.kind==='tourniquet')return true;
  if(e.kind==='clothing')return int(e.player,0,1)&&typeof e.reason==='string';
  if(e.kind==='exchange')return int(e.player,0,1)&&e.partner===1-e.player&&card(e.card)&&e.original?.kind==='clothing'&&event(e.original);
  return ['reward','assassin'].includes(e.kind)&&int(e.giver,0,1)&&e.receiver===1-e.giver&&card(e.card);
}
export function validateSave(s){
  check(s&&s.format==='duet-evening'&&s.version===1,'unsupported format/version');
  check(phases.includes(s.phase),'phase');
  check(Array.isArray(s.players)&&s.players.length===2,'players');
  s.players.forEach(p=>check(typeof p.name==='string'&&p.name.length<=40&&int(p.clothing,0,20)&&int(p.tourniquets,0,20),'player counters'));
  const b=s.board;
  check(b&&Array.isArray(b.words)&&b.words.length===25&&b.words.every(w=>typeof w==='string'&&w.length>0&&w.length<=80)&&new Set(b.words).size===25,'words');
  check(Array.isArray(b.keys)&&b.keys.length===2,'keys');
  b.keys.forEach(k=>check(Array.isArray(k)&&k.length===25&&k.every(t=>types.includes(t))&&k.filter(t=>t==='agent').length===9&&k.filter(t=>t==='assassin').length===3,'key distribution'));
  const union=b.keys[0].map((_,i)=>i).filter(i=>b.keys.some(k=>k[i]==='agent'));
  check(union.length===15,'agent union');
  check(indices(b.found)&&b.found.every(i=>union.includes(i)),'found agents');
  check(Array.isArray(b.misses)&&b.misses.length===2&&b.misses.every((m,p)=>indices(m)&&m.every(i=>b.keys[p][i]!=='agent')),'miss markers');
  const r=s.rules;
  check(r&&int(r.turnLimit,1,50)&&int(r.startingClothing,1,20)&&int(r.tourniquetsPerPlayer,0,20)&&int(r.tourniquetsPerTurn,0,5)&&int(r.maxClue,1,9)&&typeof r.extraGuess==='boolean'&&int(r.assassinStrikeLimit,1,10)&&int(r.rewardThreshold,3,9),'rules');
  check(int(s.strikes,0,r.assassinStrikeLimit),'strikes');
  const t=s.turn;
  check(t&&int(t.number,1,r.turnLimit)&&int(t.giver,0,1)&&t.guesser===1-t.giver&&int(t.correct,0,15)&&int(t.attempts,0,30)&&int(t.allowance,0,30)&&int(t.tourniquetsUsed,0,r.tourniquetsPerTurn)&&(t.clueNumber===null||int(t.clueNumber,1,r.maxClue)),'turn');
  check(Array.isArray(s.queue)&&s.queue.length<=10&&s.queue.every(event),'event queue');
  check(s.pending===null||event(s.pending),'pending activity');
  check(['activity','tourniquet'].includes(s.phase)?s.pending!==null:s.pending===null,'pending phase');
  check(s.phase!=='tourniquet'||s.pending.kind==='tourniquet','tourniquet phase');
  check(s.after===null||['advance','guess','handoff_guess'].includes(s.after),'continuation');
  check(Array.isArray(s.log)&&s.log.length<=200&&s.log.every(x=>int(x.turn,1,50)&&typeof x.text==='string'&&x.text.length<=1000),'log');
  check(s.decks&&typeof s.decks==='object','decks');
  for(const name of ['romantic','assassin']){
    const d=s.decks[name];
    check(d&&Array.isArray(d.cards)&&d.cards.length<=500&&d.cards.every(card),'cards');
    const ids=d.cards.map(c=>c.id);
    check(new Set(ids).size===ids.length&&Array.isArray(d.order)&&d.order.length===ids.length&&new Set(d.order).size===ids.length&&d.order.every(id=>ids.includes(id))&&int(d.position,0,d.order.length),'deck order');
  }
  return s;
}
export function serialize(s){validateSave(s);return JSON.stringify(s,null,2);}
export function parseSave(text){if(text.length>2000000)throw new Error('Save file is too large.');return validateSave(JSON.parse(text));}
export function downloadSave(s){
  const blob=new Blob([serialize(s)],{type:'application/json'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='duet-evening-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function recover(){const text=localStorage.getItem(STORAGE_KEY);return text?parseSave(text):null;}
export function autosave(s){localStorage.setItem(STORAGE_KEY,serialize(s));}
