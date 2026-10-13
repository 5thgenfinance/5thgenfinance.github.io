
export function shuffle(items, rng = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function createBoard(words, rng = Math.random) {
  const unique = [...new Set(words.map(w => w.trim()).filter(Boolean))];
  if (unique.length < 25) throw new Error('At least 25 unique words are needed.');
  const ids = shuffle(Array.from({length:25},(_,i)=>i),rng);
  const shared = ids.slice(0,3), a = ids.slice(3,9), b = ids.slice(9,15);
  const agents = [[...shared,...a],[...shared,...b]];
  const keys = agents.map(list => {
    const key = Array(25).fill('bystander');
    list.forEach(i=>key[i]='agent');
    shuffle(ids.filter(i=>!list.includes(i)),rng).slice(0,3).forEach(i=>key[i]='assassin');
    return key;
  });
  return {words:shuffle(unique,rng).slice(0,25),keys,found:[],misses:[[],[]]};
}
