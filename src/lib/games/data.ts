// UsTwo 💗 - Comprehensive Game Content & Question Banks

export interface MemoryCardDef {
  id: string;
  symbol: string;
  name: string;
  color: string;
}

export const MEMORY_CARDS: MemoryCardDef[] = [
  { id: 'heart', symbol: '💗', name: 'Pink Heart', color: 'bg-pink-100' },
  { id: 'cat', symbol: '🐱', name: 'Boba Cat', color: 'bg-rose-100' },
  { id: 'strawberry', symbol: '🍓', name: 'Sweet Berry', color: 'bg-red-100' },
  { id: 'bear', symbol: '🧸', name: 'Teddy Bear', color: 'bg-amber-100' },
  { id: 'flower', symbol: '🌸', name: 'Blossom', color: 'bg-pink-50' },
  { id: 'cupcake', symbol: '🧁', name: 'Cupcake', color: 'bg-purple-100' },
  { id: 'boba', symbol: '🧋', name: 'Milk Tea', color: 'bg-amber-50' },
  { id: 'star', symbol: '⭐', name: 'Shining Star', color: 'bg-yellow-100' },
  { id: 'rabbit', symbol: '🐰', name: 'Bunny', color: 'bg-pink-100' },
  { id: 'coffee', symbol: '☕', name: 'Cozy Brew', color: 'bg-orange-100' },
  { id: 'rose', symbol: '🌹', name: 'Red Rose', color: 'bg-red-50' },
  { id: 'butterfly', symbol: '🦋', name: 'Butterfly', color: 'bg-blue-100' },
  { id: 'sparkles', symbol: '✨', name: 'Sparkles', color: 'bg-yellow-50' },
  { id: 'cloud', symbol: '☁️', name: 'Soft Cloud', color: 'bg-slate-100' },
  { id: 'rainbow', symbol: '🌈', name: 'Rainbow', color: 'bg-indigo-100' },
  { id: 'cherries', symbol: '🍒', name: 'Cherries', color: 'bg-rose-50' },
  { id: 'donut', symbol: '🍩', name: 'Glazed Donut', color: 'bg-amber-100' },
  { id: 'moon', symbol: '🌙', name: 'Crescent Moon', color: 'bg-purple-50' },
];

export interface QuizQuestion {
  id: string;
  question: string;
  category: 'favorites' | 'habits' | 'dreams' | 'memories' | 'secrets';
  options?: string[];
}

export const HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS: QuizQuestion[] = [
  {
    id: 'food',
    question: 'What is my absolute favorite comfort food when I have had a long day?',
    category: 'favorites',
  },
  {
    id: 'cheerup',
    question: 'What is one thing that can instantly make me smile no matter what?',
    category: 'habits',
  },
  {
    id: 'destination',
    question: 'What is my #1 dream vacation destination with you?',
    category: 'dreams',
  },
  {
    id: 'scared_of',
    question: 'What is something silly or irrational that I am quietly afraid of?',
    category: 'secrets',
  },
  {
    id: 'first_impression',
    question: 'What do you think was my very first impression of you when we met?',
    category: 'memories',
  },
  {
    id: 'upset_habit',
    question: 'When I am upset or stressed, what is my usual coping habit?',
    category: 'habits',
  },
  {
    id: 'love_language',
    question: 'Which love language makes me feel the most appreciated and safe?',
    category: 'secrets',
  },
  {
    id: 'perfect_date',
    question: 'What would my ultimate dream date night look like?',
    category: 'favorites',
  },
  {
    id: 'lazy_sunday',
    question: 'How do I prefer to spend a completely free, lazy Sunday afternoon?',
    category: 'habits',
  },
  {
    id: 'proud_moment',
    question: 'What is an accomplishment of mine that I am secretly most proud of?',
    category: 'secrets',
  },
];

export interface TruthDareCard {
  id: string;
  type: 'truth' | 'dare';
  category: 'cute' | 'romantic' | 'funny' | 'deep' | 'playful';
  text: string;
}

export const TRUTH_DARE_CARDS: TruthDareCard[] = [
  { id: 't1', type: 'truth', category: 'romantic', text: 'What is your absolute favorite physical feature or expression of mine?' },
  { id: 't2', type: 'truth', category: 'cute', text: 'What was the exact moment you realized you were falling in love with me?' },
  { id: 't3', type: 'truth', category: 'funny', text: 'What is the silliest or most embarrassing thing you have done to impress me?' },
  { id: 't4', type: 'truth', category: 'deep', text: 'What is one worry or fear about our future that I can reassure you about?' },
  { id: 't5', type: 'truth', category: 'playful', text: 'If we were trapped on a deserted island, which one of us would panic first?' },
  { id: 't6', type: 'truth', category: 'romantic', text: 'What is one memory of us that you replay in your mind when you miss me?' },
  { id: 't7', type: 'truth', category: 'cute', text: 'What is an adorable habit of mine that you haven’t told me you noticed?' },
  { id: 'd1', type: 'dare', category: 'cute', text: 'Send a voice note or message singing 3 lines of your favorite romantic song!' },
  { id: 'd2', type: 'dare', category: 'playful', text: 'Describe our love story using only 5 dramatic adjectives!' },
  { id: 'd3', type: 'dare', category: 'romantic', text: 'Give me three sincere compliments: one about my mind, one about my heart, one about my looks.' },
  { id: 'd4', type: 'dare', category: 'funny', text: 'Give me a brand new, hilarious pet nickname and use it for the rest of today!' },
  { id: 'd5', type: 'dare', category: 'cute', text: 'Draw a 30-second doodle of us on a piece of paper or screen and show it to me!' },
  { id: 'd6', type: 'dare', category: 'romantic', text: 'Promise me one sweet surprise date or treat sometime in the next two weeks!' },
];

export interface WouldYouRatherItem {
  id: string;
  optionA: string;
  optionB: string;
  category: 'romantic' | 'lifestyle' | 'fun' | 'travel';
}

export const WOULD_YOU_RATHER_QUESTIONS: WouldYouRatherItem[] = [
  { id: 'wyr1', optionA: 'A cozy rainy cabin in the snowy mountains 🏔️', optionB: 'A sun-drenched private beach bungalow 🏖️', category: 'travel' },
  { id: 'wyr2', optionA: 'Unlimited morning cuddles for life 🧸', optionB: 'Unlimited forehead & cheek kisses for life 💋', category: 'romantic' },
  { id: 'wyr3', optionA: 'Cook an elaborate 3-course dinner together 🍝', optionB: 'Order late-night comfort takeout & watch movies 🍕', category: 'lifestyle' },
  { id: 'wyr4', optionA: 'Travel the entire world in a camper van 🚐', optionB: 'Build our dream home with a garden & pets 🏡', category: 'lifestyle' },
  { id: 'wyr5', optionA: 'Always wake up with cute breakfast in bed 🥞', optionB: 'Always fall asleep holding hands listening to music 🌙', category: 'romantic' },
  { id: 'wyr6', optionA: 'Read each other’s thoughts for just 1 hour 🧠', optionB: 'Freeze time for 24 hours so we can be together forever ⏳', category: 'fun' },
  { id: 'wyr7', optionA: 'Adopt three fluffy cats together 🐱', optionB: 'Adopt two energetic golden retriever puppies 🐶', category: 'lifestyle' },
  { id: 'wyr8', optionA: 'Spontaneous midnight drive under the stars 🌌', optionB: 'Cozy blanket fort picnic in the living room 🧺', category: 'romantic' },
];

export interface GuessMyAnswerItem {
  id: string;
  question: string;
  options: string[];
}

export const GUESS_MY_ANSWER_ITEMS: GuessMyAnswerItem[] = [
  {
    id: 'gma1',
    question: 'If we could instantly teleport somewhere right now, where would I choose?',
    options: ['Kyoto during cherry blossom season 🌸', 'Paris for pastries & evening walks 🥐', 'A quiet cozy Swiss Alps chalet 🏔️', 'A tropical Bali villa with a private pool 🌴'],
  },
  {
    id: 'gma2',
    question: 'Which superpower would I pick if given the chance?',
    options: ['Teleportation to see you instantly ✈️', 'Mind reading to know what you want 🔮', 'Time travel to relive our best moments ⏳', 'Invisibility to sneak treats together 👻'],
  },
  {
    id: 'gma3',
    question: 'What is my favorite part of our daily routine?',
    options: ['Morning good morning texts ☀️', 'Random funny memes throughout the day 📱', 'Late night recap calls / chatting 🌙', 'Just knowing you are there for me 💗'],
  },
  {
    id: 'gma4',
    question: 'If I were an animal, which one matches my spirit the best?',
    options: ['A lazy affectionate kitten 🐱', 'An enthusiastic loyal puppy 🐶', 'A calm gentle panda 🐼', 'A sweet curious bunny 🐰'],
  },
];

export interface WhoIsMoreLikelyItem {
  id: string;
  scenario: string;
}

export const WHO_IS_MORE_LIKELY_ITEMS: WhoIsMoreLikelyItem[] = [
  { id: 'wml1', scenario: 'Who is more likely to fall asleep 15 minutes into a movie night? 😴' },
  { id: 'wml2', scenario: 'Who is more likely to spend all their money on cute cafe food & snacks? 🧋' },
  { id: 'wml3', scenario: 'Who is more likely to start dancing randomly in the kitchen? 💃' },
  { id: 'wml4', scenario: 'Who is more likely to cry during an emotional Disney or romance film? 🥺' },
  { id: 'wml5', scenario: 'Who takes longer to pick an outfit before going on a date? 👗' },
  { id: 'wml6', scenario: 'Who is more likely to accidentally leave their keys or phone behind? 🔑' },
  { id: 'wml7', scenario: 'Who is more stubborn during silly debates? 😤' },
  { id: 'wml8', scenario: 'Who gives the absolute warmest, most comforting hugs? 🤗' },
  { id: 'wml9', scenario: 'Who is more likely to initiate spontaneous road trips? 🚗' },
  { id: 'wml10', scenario: 'Who says "I love you" more times in a single day? 💗' },
];

export interface EmojiPuzzle {
  id: string;
  emojis: string;
  solution: string;
  category: 'romantic' | 'movie' | 'activity' | 'memory' | 'travel';
  hint: string;
}

export const EMOJI_PUZZLES: EmojiPuzzle[] = [
  { id: 'ep1', emojis: '🚢 ❄️ 💔 🌊 🎻', solution: 'Titanic', category: 'movie', hint: 'An epic romantic ship disaster' },
  { id: 'ep2', emojis: '🦁 👑 🌅 🐗 🦝', solution: 'The Lion King', category: 'movie', hint: 'Disney savannah adventure' },
  { id: 'ep3', emojis: '☕ 🌧️ 📖 🛋️ 🕯️', solution: 'Cozy Rainy Day', category: 'activity', hint: 'Warm drink, rain, reading' },
  { id: 'ep4', emojis: '🍿 🎬 🛋️ 🍫 💏', solution: 'Movie Night Date', category: 'activity', hint: 'Couples popcorn and cuddling' },
  { id: 'ep5', emojis: '✈️ 🏝️ 🥥 🌅 🏊', solution: 'Tropical Vacation', category: 'travel', hint: 'Island getaway with coconut' },
  { id: 'ep6', emojis: '🎈 🏠 👴 👦 🐶', solution: 'Up', category: 'movie', hint: 'Flying house with balloons' },
  { id: 'ep7', emojis: '🍓 🍰 🧁 ☕ 😋', solution: 'Sweet Dessert Date', category: 'activity', hint: 'Cakes, strawberries, and tea' },
];

export interface SecretQuestionItem {
  id: string;
  question: string;
  category: 'dreams' | 'vulnerable' | 'appreciation' | 'future';
}

export const SECRET_QUESTIONS: SecretQuestionItem[] = [
  { id: 'sq1', question: 'What is one dream for our future that you haven’t fully spoken out loud yet?', category: 'dreams' },
  { id: 'sq2', question: 'What is a specific thing I do that makes you feel deeply loved and safe?', category: 'appreciation' },
  { id: 'sq3', question: 'If we could start a new tradition just for the two of us, what would it be?', category: 'future' },
  { id: 'sq4', question: 'What was your happiest memory with me from the past month?', category: 'vulnerable' },
  { id: 'sq5', question: 'What is one way I can support or encourage you better right now?', category: 'appreciation' },
];

export const DRAW_WORDS = [
  'Heart', 'Cat', 'Teddy Bear', 'Cupcake', 'Sunflower', 'Strawberry', 'Rainbow',
  'Coffee Mug', 'Ice Cream', 'House', 'Kitten', 'Bicycle', 'Penguin', 'Butterfly',
  'Candle', 'Diamond Ring', 'Pizza Slice', 'Cherry', 'Star', 'Moon'
];
