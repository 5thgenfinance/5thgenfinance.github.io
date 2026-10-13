
import { shuffle } from './board.js';
export function prepareDeck(cards, rng = Math.random) {
  return {cards:structuredClone(cards),order:shuffle(cards.map(c=>c.id),rng),position:0};
}
export function draw(deck, rng = Math.random) {
  if (!deck.cards.length) return null;
  if (deck.position >= deck.order.length) {
    deck.order=shuffle(deck.cards.map(c=>c.id),rng); deck.position=0;
  }
  const id=deck.order[deck.position++];
  return structuredClone(deck.cards.find(c=>c.id===id));
}
