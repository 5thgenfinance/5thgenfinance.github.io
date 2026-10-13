
import { createBoard } from './board.js';
import { DEFAULT_RULES, rewardFor } from './rules.js';
import { prepareDeck, draw } from './cards.js';
export function newGame({names=['Player 1','Player 2'],words,cards=[],assassinCards=[],rules={},rng=Math.random}) {
  const config={...DEFAULT_RULES,...rules};
  return {format:'duet-evening',version:1,rules:config,
    players:names.map(name=>({name:name.trim().slice(0,40)||'Player',clothing:config.startingClothing,tourniquets:config.tourniquetsPerPlayer})),
    board:createBoard(words,rng),decks:{romantic:prepareDeck(cards,rng),assassin:prepareDeck(assassinCards,rng)},
    turn:{number:1,giver:0,guesser:1,clueNumber:null,correct:0,attempts:0,allowance:0,tourniquetsUsed:0},
    phase:'handoff_key',strikes:0,pending:null,queue:[],after:null,endedReason:null,log:[]};
}
function requirePhase(s,p) {if(s.phase!==p) throw new Error('Action is unavailable in this phase.');}
function note(s,text) {s.log.push({turn:s.turn.number,text}); if(s.log.length>200)s.log.shift();}
function beginEvents(s,events,after) {
  s.queue=events; s.after=after; nextEvent(s);
}
function nextEvent(s) {
  s.pending=s.queue.shift()||null;
  if(s.pending) {s.phase='activity';return;}
  const after=s.after; s.after=null;
  if(after==='handoff_guess')s.phase='handoff_guess';
  else if(after==='guess')s.phase='guess';
  else advance(s);
}
function clothing(player,reason) {return {kind:'clothing',player,reason};}
function advance(s) {
  const reason=s.board.found.length===15?'All agents found':s.strikes>=s.rules.assassinStrikeLimit?'Assassin strike limit reached':s.turn.number>=s.rules.turnLimit?'Turn limit reached':null;
  if(reason){s.phase='finished';s.endedReason=reason;return;}
  const giver=s.turn.guesser;
  s.turn={number:s.turn.number+1,giver,guesser:1-giver,clueNumber:null,correct:0,attempts:0,allowance:0,tourniquetsUsed:0};
  s.phase='handoff_key';
}
function endEvents(s,events=[]) {
  const reward=rewardFor(s.turn.correct,s.rules.rewardThreshold);
  if(reward==='kiss') events.push({kind:'reward',giver:s.turn.giver,receiver:s.turn.guesser,card:{id:'kiss',name:'A kiss',text:'Offer a kiss if you both want to.',duration_sec:30}});
  if(reward==='romantic') {
    const card=draw(s.decks.romantic);
    if(card)events.push({kind:'reward',giver:s.turn.giver,receiver:s.turn.guesser,card});
  }
  beginEvents(s,events,'advance');
}
export function openKey(s) {requirePhase(s,'handoff_key');s.phase='private';}
export function submitClue(s,n) {
  requirePhase(s,'private');
  if(!Number.isInteger(n)||n<1||n>s.rules.maxClue)throw new Error('Invalid clue number.');
  s.turn.clueNumber=n;s.turn.allowance=n+(s.rules.extraGuess?1:0);
  note(s,`${s.players[s.turn.giver].name} offered ${n}.`);
  if(n===1)beginEvents(s,[clothing(s.turn.giver,'Clue number 1')],'handoff_guess');
  else s.phase='handoff_guess';
}
export function openGuess(s){requirePhase(s,'handoff_guess');s.phase='guess';}
export function guess(s,i) {
  requirePhase(s,'guess');
  if(!Number.isInteger(i)||i<0||i>=25||s.board.found.includes(i)||s.board.misses[s.turn.giver].includes(i))throw new Error('This tile is unavailable.');
  s.turn.attempts++;
  const type=s.board.keys[s.turn.giver][i];
  note(s,`${s.players[s.turn.guesser].name} selected ${s.board.words[i]}: ${type}.`);
  if(type==='agent') {
    s.board.found.push(i);s.turn.correct++;
    if(s.board.found.length===15||s.turn.attempts>=s.turn.allowance)endEvents(s);
    return type;
  }
  s.board.misses[s.turn.giver].push(i);
  if(type==='assassin') {
    s.strikes++;
    const card=draw(s.decks.assassin);
    const events=card?[{kind:'assassin',giver:s.turn.guesser,receiver:s.turn.giver,card}]:[];
    // An assassin uses the strike rule, not an additional clothing penalty.
    endEvents(s,events);return type;
  }
  if(s.turn.correct===0){endEvents(s,[clothing(s.turn.guesser,'First guess hit a bystander')]);return type;}
  const p=s.players[s.turn.guesser];
  if(s.turn.tourniquetsUsed<s.rules.tourniquetsPerTurn&&p.tourniquets>0) {
    s.phase='tourniquet';s.pending={kind:'tourniquet'};
  } else endEvents(s);
  return type;
}
export function endTurn(s){requirePhase(s,'guess');endEvents(s);}
export function chooseTourniquet(s,use){
  requirePhase(s,'tourniquet');s.pending=null;
  if(!use){endEvents(s);return;}
  beginEvents(s,[{kind:'clothing',player:s.turn.guesser,reason:'Optional tourniquet',tourniquet:true}],'guess');
}
function payTourniquet(s,e){
  if(e.tourniquet){s.players[e.player].tourniquets--;s.turn.tourniquetsUsed++;s.turn.allowance++;}
}
export function resolveActivity(s,accept){
  requirePhase(s,'activity');const e=s.pending;
  if(e.kind==='clothing') {
    if(!accept){note(s,'Clothing activity passed without penalty.');
      if(e.tourniquet){s.queue=[];endEvents(s);return;}
    } else if(s.players[e.player].clothing>0){
      s.players[e.player].clothing--;payTourniquet(s,e);note(s,'One clothing item spent.');
    } else {
      const card=draw(s.decks.romantic);
      if(!card){
        note(s,'No enabled exchange card: cost waived.');
        if(e.tourniquet){s.queue=[];endEvents(s);return;}
      } else {
        s.pending={kind:'exchange',player:e.player,partner:1-e.player,card,original:e};return;
      }
    }
  } else if(e.kind==='exchange') {
    const partner=s.players[e.partner];
    if(accept&&partner.clothing>0){partner.clothing--;payTourniquet(s,e.original);note(s,'Mutually accepted exchange: partner item spent.');}
    else {note(s,'Exchange passed without penalty.');if(e.original.tourniquet){s.queue=[];endEvents(s);return;}}
  } else note(s,accept?'Activity acknowledged.':'Activity passed without penalty.');
  nextEvent(s);
}
export function resumeCurtain(s){
  if(s.phase==='private')s.phase='handoff_key';
  if(s.phase==='guess')s.phase='handoff_guess';
  return s;
}
