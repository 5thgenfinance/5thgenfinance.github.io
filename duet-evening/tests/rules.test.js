
import {describe,it,expect} from 'vitest';
import {newGame,openKey,submitClue,openGuess,guess,resolveActivity,chooseTourniquet,endTurn} from '../src/engine/game.js';
import words from '../content/words.json';
const cards=[{id:'r',name:'Hug',text:'Offer a hug.',duration_sec:30}];
function start(n=3,rules={}){const s=newGame({words,cards,assassinCards:cards,rules});openKey(s);submitClue(s,n);if(n===1)resolveActivity(s,true);openGuess(s);return s;}
const tile=(s,type)=>s.board.keys[s.turn.giver].findIndex((v,i)=>v===type&&!s.board.found.includes(i)&&!s.board.misses[s.turn.giver].includes(i));
describe('rules',()=>{
 it('first bystander costs one item only on acceptance',()=>{const s=start();guess(s,tile(s,'bystander'));expect(s.pending.kind).toBe('clothing');resolveActivity(s,true);expect(s.players[1].clothing).toBe(3);expect(s.phase).toBe('handoff_key');});
 it('pass has no clothing penalty',()=>{const s=start();guess(s,tile(s,'bystander'));resolveActivity(s,false);expect(s.players[1].clothing).toBe(4);});
 it('one correct then bystander is neutral if no tourniquet is used',()=>{const s=start();guess(s,tile(s,'agent'));guess(s,tile(s,'bystander'));chooseTourniquet(s,false);expect(s.players[1].clothing).toBe(4);expect(s.phase).toBe('handoff_key');});
 it('tourniquet spends one item and adds one replacement attempt',()=>{const s=start();guess(s,tile(s,'agent'));guess(s,tile(s,'bystander'));chooseTourniquet(s,true);resolveActivity(s,true);expect(s.phase).toBe('guess');expect(s.players[1].clothing).toBe(3);expect(s.players[1].tourniquets).toBe(1);expect(s.turn.allowance).toBe(5);});
 it('two correct offers kiss once and three correct offers deck card',()=>{for(const n of [2,3]){const s=start();for(let i=0;i<n;i++)guess(s,tile(s,'agent'));endTurn(s);expect(s.pending.card.id).toBe(n===2?'kiss':'r');resolveActivity(s,true);expect(s.phase).toBe('handoff_key');}});
 it('assassin ends turn and increments strike without clothing stack',()=>{const s=start();guess(s,tile(s,'assassin'));expect(s.strikes).toBe(1);expect(s.pending.kind).toBe('assassin');resolveActivity(s,false);expect(s.players[1].clothing).toBe(4);});
 it('rejects duplicate agent and out-of-phase guesses',()=>{const s=start();const i=tile(s,'agent');guess(s,i);expect(()=>guess(s,i)).toThrow();endTurn(s);expect(()=>guess(s,tile(s,'agent'))).toThrow();});
 it('zero-clothing exchange spends partner item and never produces negative count',()=>{const s=start();s.players[1].clothing=0;guess(s,tile(s,'bystander'));resolveActivity(s,true);expect(s.pending.kind).toBe('exchange');resolveActivity(s,true);expect(s.players[0].clothing).toBe(3);expect(s.players[1].clothing).toBe(0);});
 it('clue one affects giver only before guessing',()=>{const s=start(1);expect(s.players[0].clothing).toBe(3);expect(s.players[1].clothing).toBe(4);});
});
