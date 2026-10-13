
import {describe,it,expect} from 'vitest';
import {newGame,resumeCurtain,openKey} from '../src/engine/game.js';
import {parseSave,serialize} from '../src/storage/save-load.js';
import words from '../content/words.json';
describe('save/load',()=>{
 it('round trips all state',()=>{const s=newGame({words});expect(parseSave(serialize(s))).toEqual(s);});
 it('hides a restored private key',()=>{const s=newGame({words});openKey(s);expect(resumeCurtain(parseSave(serialize(s))).phase).toBe('handoff_key');});
 it('rejects negative clothing, malformed keys and unknown versions',()=>{for(const mutate of [s=>s.players[0].clothing=-1,s=>s.board.keys[0][0]='invalid',s=>s.version=99]){const s=newGame({words});mutate(s);expect(()=>parseSave(JSON.stringify(s))).toThrow();}});
});
