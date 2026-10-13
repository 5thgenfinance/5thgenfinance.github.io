
import {describe,it,expect} from 'vitest';
import {createBoard} from '../src/engine/board.js';
import words from '../content/words.json';
describe('board',()=>{
 it('has 25 words, nine agents and three assassins per key, and 15 unique agents',()=>{
  for(let j=0;j<100;j++){
   const b=createBoard(words);
   expect(new Set(b.words).size).toBe(25);
   b.keys.forEach(k=>{expect(k.filter(x=>x==='agent')).toHaveLength(9);expect(k.filter(x=>x==='assassin')).toHaveLength(3);});
   expect(b.keys[0].filter((_,i)=>b.keys.some(k=>k[i]==='agent'))).toHaveLength(15);
  }
 });
});
