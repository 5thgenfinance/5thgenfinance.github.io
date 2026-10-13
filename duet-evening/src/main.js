
import './ui/styles.css';
import words from '../content/words.json';
import romantic from '../content/romantic-cards.json';
import assassin from '../content/assassin-cards.json';
import {newGame,openKey,submitClue,openGuess,guess,endTurn,chooseTourniquet,resolveActivity,resumeCurtain} from './engine/game.js';
import {autosave,recover,downloadSave,parseSave,STORAGE_KEY} from './storage/save-load.js';
const app=document.querySelector('#app');
let game=null,paused=false,error='',storageNotice='',timer=null;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{game=recover();if(game){resumeCurtain(game);paused=true;}}catch(e){error=e.message;}
function name(i){return esc(game.players[i].name);}
function stopTimer(){clearInterval(timer);timer=null;}
function persist(){try{autosave(game);storageNotice='';}catch{storageNotice='Automatic recovery unavailable. Use Save JSON to keep a backup.';}}
function act(fn){try{stopTimer();fn();error='';persist();render();}catch(e){error=e.message;render();}}
function button(id,text,cls=''){return `<button id="${id}" class="${cls}">${text}</button>`;}
function bind(id,fn){document.getElementById(id)?.addEventListener('click',fn);}
function render(){
  stopTimer();
  const toolbar=`<header class="toolbar"><strong>Duet Evening</strong><div class="row">${game?button('save','Save JSON')+button('pause',paused?'Resume':'Pause'):''}${button('load','Load JSON')}${button('new','New game')}</div></header><input id="file" type="file" accept=".json,application/json" hidden>`;
  let body='';
  if(!game)body=setup();
  else if(paused)body=`<section class="curtain"><h1>Game paused</h1><p>Private keys are hidden. Resume when both of you are ready.</p>${button('resume','Resume game','primary')}</section>`;
  else body=screen();
  app.innerHTML=toolbar+(error?`<p class="error" role="alert">${esc(error)}</p>`:'')+(storageNotice?`<p class="notice">${esc(storageNotice)}</p>`:'')+body+'<p class="footer">Activities are optional. Either person may pass or stop without penalty. Private keys exist in this browser and in save files; this is trust-based pass-and-play.</p>';
  bind('save',()=>act(()=>downloadSave(game)));
  bind('pause',()=>{if(paused){paused=false;}else{resumeCurtain(game);paused=true;}persist();render();});
  bind('resume',()=>{paused=false;render();});
  bind('new',()=>{if(!game||confirm('Start over? Export your current game first if you want to keep it.')){game=null;paused=false;try{localStorage.removeItem(STORAGE_KEY);}catch{}render();}});
  bind('load',()=>document.getElementById('file').click());
  document.getElementById('file').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>2000000){error='Save file is too large.';render();return;}
    try{const loaded=parseSave(await f.text());game=resumeCurtain(loaded);paused=true;error='';persist();render();}catch(e){error=e.message;render();}
  });
  if(!game){bindSetup();return;}
  if(paused)return;
  bind('open-key',()=>act(()=>openKey(game)));
  bind('submit',()=>act(()=>submitClue(game,Number(document.getElementById('clue-number').value))));
  bind('open-guess',()=>act(()=>openGuess(game)));
  bind('end',()=>act(()=>endTurn(game)));
  app.querySelectorAll('[data-tile]').forEach(b=>b.addEventListener('click',()=>act(()=>guess(game,Number(b.dataset.tile)))));
  bind('tq-yes',()=>act(()=>chooseTourniquet(game,true)));
  bind('tq-no',()=>act(()=>chooseTourniquet(game,false)));
  bind('accept',()=>act(()=>resolveActivity(game,true)));
  bind('pass',()=>act(()=>resolveActivity(game,false)));
  bind('start-timer',()=>{
    let left=game.pending.card?.duration_sec||0;
    const el=document.getElementById('timer');el.textContent=left+'s';
    document.getElementById('start-timer').disabled=true;
    timer=setInterval(()=>{left--;el.textContent=left>0?left+'s':'Time complete — stop or finish whenever you wish.';if(left<=0)stopTimer();},1000);
  });
}
function setup(){return `<h1>A cooperative evening</h1><p>One device. Spoken clues. Private keys. Save your progress as JSON.</p><form id="setup" class="panel">
<label>Player 1 <input id="p1" type="text" maxlength="40" value="Robert" required></label>
<label>Player 2 <input id="p2" type="text" maxlength="40" value="Player 2" required></label>
<label>Starting clothing items each <input id="clothing" type="number" min="1" max="10" value="4" required></label>
<label>Turn limit <input id="turns" type="number" min="2" max="50" value="9" required></label>
<label><input id="extra" type="checkbox" checked> Allow clue number + 1 guesses</label>
<p class="muted">Defaults: 2 tourniquets per player, 1 per turn, 3 assassin strikes. Assassin hits use strikes, not an extra clothing cost.</p>
<details><summary>Enabled romantic cards — deselect anything either person does not want</summary><div class="checks">${romantic.map(c=>`<label><input type="checkbox" name="card" value="${esc(c.id)}" checked> ${esc(c.name)} — ${esc(c.text)}</label>`).join('')}</div></details>
<label><input id="agree" type="checkbox" required> Both players approve the enabled activities and understand that every activity can be passed.</label>
<button class="primary" type="submit">Start game</button></form>`;}
function bindSetup(){document.getElementById('setup').addEventListener('submit',e=>{e.preventDefault();act(()=>{
 const ids=[...document.querySelectorAll('input[name=card]:checked')].map(x=>x.value);
 game=newGame({names:[document.getElementById('p1').value,document.getElementById('p2').value],words,cards:romantic.filter(c=>ids.includes(c.id)),assassinCards:assassin,rules:{startingClothing:Number(document.getElementById('clothing').value),turnLimit:Number(document.getElementById('turns').value),extraGuess:document.getElementById('extra').checked}});paused=false;
 });});}
function status(){return `<div class="row"><span class="badge">Turn ${game.turn.number}/${game.rules.turnLimit}</span><span class="badge">Agents ${game.board.found.length}/15</span><span class="badge">Strikes ${game.strikes}/${game.rules.assassinStrikeLimit}</span></div><p>${name(0)}: ${game.players[0].clothing} items · ${name(1)}: ${game.players[1].clothing} items</p>`;}
function board(privateView=false){return `<div class="board" aria-label="Word board">${game.board.words.map((w,i)=>{
 const found=game.board.found.includes(i),miss=game.board.misses[game.turn.giver].includes(i);
 const type=privateView?game.board.keys[game.turn.giver][i]:found?'found':miss?'miss':'';
 return `<button class="tile ${type}" ${privateView||found||miss?'disabled':''} ${privateView?'':`data-tile="${i}"`}><span>${esc(w)}</span>${privateView?`<span class="mark">${type}${found?' · found':''}</span>`:found?'<span class="mark">FOUND</span>':miss?'<span class="mark">MISSED this key</span>':''}</button>`;
 }).join('')}</div>`;}
function screen(){const t=game.turn;
 if(game.phase==='handoff_key')return `<section class="curtain"><h1>${name(t.giver)}, give the next clue</h1><p>${name(t.guesser)}, look away before the key is opened.</p>${button('open-key',`I’m ${name(t.giver)} — show my key`,'primary')}<p class="muted">Turn ${t.number} · Private viewing next</p></section>`;
 if(game.phase==='private')return `<h1>${name(t.giver)} · Private key</h1>${status()}<p class="muted">Green: agent · Tan: bystander · Rose: assassin. Your partner should look away.</p>${board(true)}<section class="panel"><label>How many words does your spoken clue cover? <select id="clue-number">${Array.from({length:game.rules.maxClue},(_,i)=>`<option value="${i+1}" ${i===1?'selected':''}>${i+1}</option>`).join('')}</select></label><p>Choosing 1 offers a clothing-removal activity. Give the clue aloud after hiding the key.</p>${button('submit','Hide key & pass device','primary')}</section>`;
 if(game.phase==='handoff_guess')return `<section class="curtain"><h1>Your turn, ${name(t.guesser)}</h1><p>${name(t.giver)}’s private key is hidden.</p><p>Listen for the spoken clue. It covers ${t.clueNumber} words.</p><p class="muted">If resuming, the giver should repeat the original clue.</p>${button('open-guess','Ready — show board','primary')}</section>`;
 if(game.phase==='guess')return `<h1>${name(t.guesser)} · Guessing</h1>${status()}<h2>Spoken clue · ${t.clueNumber} words</h2><p>Correct this turn: ${t.correct} · Attempts remaining: ${t.allowance-t.attempts}<br>Tourniquets remaining: ${game.players[t.guesser].tourniquets}</p>${board()}${button('end','End turn')}<details><summary>Public turn log</summary>${game.log.slice(-10).map(l=>`<p>${esc(l.text)}</p>`).join('')}</details>`;
 if(game.phase==='tourniquet')return `<section class="panel"><h1>Bystander uncovered</h1><p>You have ${t.correct} correct. End the turn, or offer one clothing item to continue with one replacement attempt.</p><p>${name(t.guesser)} has ${game.players[t.guesser].clothing} items and ${game.players[t.guesser].tourniquets} tourniquets.</p><div class="row">${button('tq-yes','Offer a tourniquet','primary')}${button('tq-no','End turn')}</div></section>`;
 if(game.phase==='activity')return activity();
 return `<section class="panel"><h1>Board complete</h1><h2>${esc(game.endedReason)}</h2>${status()}<p>Thank each other for playing. No activity is owed.</p><details><summary>Game log</summary>${game.log.map(l=>`<p>Turn ${l.turn}: ${esc(l.text)}</p>`).join('')}</details></section>`;
}
function activity(){const e=game.pending;
 if(e.kind==='clothing')return `<section class="panel"><h1>Clothing activity</h1><p>${name(e.player)}: ${esc(e.reason)}.</p><p>${game.players[e.player].clothing>0?'Choose one available item to remove, if you want to.':'No clothing remains. You may offer an optional romantic-card exchange for one of your partner’s available items.'}</p><div class="row">${button('accept',game.players[e.player].clothing>0?'Confirm one item':'Show optional exchange','primary')}${button('pass','Pass — no penalty')}</div></section>`;
 const exchange=e.kind==='exchange';
 return `<section class="panel"><h1>${exchange?'Optional exchange':e.kind==='assassin'?'Assassin reset':'Your reward'}</h1><h2>${esc(e.card.name)}</h2><p>${esc(e.card.text)}</p><p>${exchange?`${name(e.player)} offers this activity to ${name(e.partner)}. If both accept, one partner item is spent; no future activity debt is created.`:`${name(e.giver)} offers this to ${name(e.receiver)} if welcomed.`}</p>${exchange&&game.players[e.partner].clothing===0?'<p class="notice">Neither player has clothing available. Pass to continue; no item or activity is owed.</p>':''}${e.card.duration_sec?`<div id="timer">Up to ${e.card.duration_sec}s</div>${button('start-timer','Start optional timer')}`:''}<div class="row" style="margin-top:18px">${button('accept',exchange?'Both accept & confirm item':'Done / acknowledge','primary')}${button('pass','Pass — no penalty')}</div><p class="muted">Either person can stop at any time. The timer never creates an obligation.</p></section>`;
}
window.addEventListener('pagehide',()=>{if(game){resumeCurtain(game);persist();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game){resumeCurtain(game);paused=true;persist();render();}});
render();
