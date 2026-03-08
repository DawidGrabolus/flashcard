export type Card = {
  id: string;
  term: string;
  answer: string;
};

export type Deck = {
  id: string;
  name: string;        
  cards: Card[];      
  colorScheme: 'primary' | 'purple' | 'amber' | 'blue'; 
};