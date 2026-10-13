
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,openKey,submitClue,openGuess,guess,endTurn,resolveActivity,chooseTourniquet,resumeCurtain} from './src/engine/game.js';
import {serialize,parseSave} from './src/storage/save-load.js';
const words=JSON.parse(fs.readFileSync('./content/words.json','utf8'));
const cards=JSON.parse(fs.readFileSync('./content/romantic-cards.json','utf8'));
const assassinCards=JSON.parse(fs.readFileSync('./content/assassin-cards.json','utf8'));
let assertions=0;
function valid(s){assert.deepEqual(parseSave(serialize(s)),s);assertions++;}
function tile(s,type){return s.board.keys[s.turn.giver].findIndex((v,i)=>v===type&&!s.board.found.includes(i)&&!s.board.misses[s.turn.giver].includes(i));}
function start(n=3){let s=newGame({words,cards,assassinCards});openKey(s);submitClue(s,n);if(n===1)resolveActivity(s,true);openGuess(s);return s;}
{
 const s=start();guess(s,tile(s,'bystander'));valid(s);resolveActivity(s,true);assert.equal(s.players[1].clothing,3);valid(s);assertions++;
}
{
 const s=start();guess(s,tile(s,'agent'));guess(s,tile(s,'bystander'));valid(s);chooseTourniquet(s,true);valid(s);resolveActivity(s,true);assert.equal(s.phase,'guess');assert.equal(s.turn.allowance,5);valid(s);assertions+=2;
}
{
 const s=start();s.players[1].clothing=0;guess(s,tile(s,'bystander'));resolveActivity(s,true);assert.equal(s.pending.kind,'exchange');valid(s);resolveActivity(s,true);assert.equal(s.players[0].clothing,3);valid(s);assertions+=2;
}
for(let run=0;run<500;run++){
 const s=newGame({words,cards,assassinCards});
 for(let steps=0;steps<400&&s.phase!=='finished';steps++){
  valid(s);
  if(s.phase==='handoff_key')openKey(s);
  else if(s.phase==='private')submitClue(s,1+Math.floor(Math.random()*5));
  else if(s.phase==='handoff_guess')openGuess(s);
  else if(s.phase==='guess'){
   const available=s.board.words.map((_,i)=>i).filter(i=>!s.board.found.includes(i)&&!s.board.misses[s.turn.giver].includes(i));
   if(Math.random()<.1||!available.length)endTurn(s);else guess(s,available[Math.floor(Math.random()*available.length)]);
  } else if(s.phase==='tourniquet')chooseTourniquet(s,Math.random()<.7);
  else if(s.phase==='activity')resolveActivity(s,Math.random()<.8);
 }
 assert.equal(s.phase,'finished');valid(s);assertions++;
}
console.log(JSON.stringify({games:500,assertions,status:'passed'}));
