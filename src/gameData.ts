// Типы валют
export type CurrencyType = 'coins' | 'crystals' | 'tokens';

export interface Currency {
  type: CurrencyType;
  name: string;
  icon: string;
  color: string;
}

export const CURRENCIES: Record<CurrencyType, Currency> = {
  coins: { type: 'coins', name: 'Монеты', icon: '🪙', color: 'text-yellow-400' },
  crystals: { type: 'crystals', name: 'Кристаллы', icon: '💎', color: 'text-purple-400' },
  tokens: { type: 'tokens', name: 'Токены', icon: '🎟️', color: 'text-green-400' },
};

// Редкости лута
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface RarityInfo {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  multiplier: number;
}

export const RARITIES: Record<Rarity, RarityInfo> = {
  common: { name: 'Обычный', color: 'text-gray-300', bgColor: 'bg-gray-700', borderColor: 'border-gray-500', glowColor: 'shadow-gray-500/50', multiplier: 1 },
  uncommon: { name: 'Необычный', color: 'text-green-400', bgColor: 'bg-green-900/50', borderColor: 'border-green-500', glowColor: 'shadow-green-500/50', multiplier: 3 },
  rare: { name: 'Редкий', color: 'text-blue-400', bgColor: 'bg-blue-900/50', borderColor: 'border-blue-500', glowColor: 'shadow-blue-500/50', multiplier: 10 },
  epic: { name: 'Эпический', color: 'text-purple-400', bgColor: 'bg-purple-900/50', borderColor: 'border-purple-500', glowColor: 'shadow-purple-500/50', multiplier: 30 },
  legendary: { name: 'Легендарный', color: 'text-yellow-400', bgColor: 'bg-yellow-900/50', borderColor: 'border-yellow-500', glowColor: 'shadow-yellow-500/50', multiplier: 100 },
};

// Предметы лута
export interface LootItem {
  id: string;
  name: string;
  icon: string;
  rarity: Rarity;
  description: string;
}

export const LOOT_ITEMS: LootItem[] = [
  // Common
  { id: 'stone', name: 'Камень', icon: '🪨', rarity: 'common', description: 'Обычный камень. Ничего особенного.' },
  { id: 'stick', name: 'Палка', icon: '🪵', rarity: 'common', description: 'Просто палка.' },
  { id: 'leaf', name: 'Лист', icon: '🍃', rarity: 'common', description: 'Зелёный листок.' },
  { id: 'dust', name: 'Пыль', icon: '💨', rarity: 'common', description: 'Кучка пыли.' },
  { id: 'rusty_nail', name: 'Ржавый гвоздь', icon: '📌', rarity: 'common', description: 'Старый ржавый гвоздь.' },
  { id: 'bottle', name: 'Бутылка', icon: '🍶', rarity: 'common', description: 'Пустая бутылка.' },
  
  // Uncommon
  { id: 'iron_ore', name: 'Железная руда', icon: '⛏️', rarity: 'uncommon', description: 'Кусок железной руды.' },
  { id: 'herb', name: 'Целебная трава', icon: '🌿', rarity: 'uncommon', description: 'Лечебная трава.' },
  { id: 'silver_coin', name: 'Серебряная монета', icon: '🥈', rarity: 'uncommon', description: 'Блестящая серебряная монета.' },
  { id: 'old_book', name: 'Старая книга', icon: '📕', rarity: 'uncommon', description: 'Потрёпанная книга с записями.' },
  { id: 'glass_orb', name: 'Стеклянный шар', icon: '🔮', rarity: 'uncommon', description: 'Красивый стеклянный шар.' },
  
  // Rare
  { id: 'gold_bar', name: 'Золотой слиток', icon: '🥇', rarity: 'rare', description: 'Блестящий золотой слиток!' },
  { id: 'magic_scroll', name: 'Магический свиток', icon: '📜', rarity: 'rare', description: 'Свиток с древними заклинаниями.' },
  { id: 'ruby', name: 'Рубин', icon: '❤️', rarity: 'rare', description: 'Красивый красный рубин.' },
  { id: 'enchanted_sword', name: 'Зачарованный меч', icon: '⚔️', rarity: 'rare', description: 'Меч с магическим клинком.' },
  
  // Epic
  { id: 'dragon_scale', name: 'Чешуя дракона', icon: '🐉', rarity: 'epic', description: 'Невероятно прочная чешуя дракона!' },
  { id: 'phoenix_feather', name: 'Перо феникса', icon: '🪶', rarity: 'epic', description: 'Пылающее перо феникса.' },
  { id: 'void_crystal', name: 'Кристалл пустоты', icon: '🌑', rarity: 'epic', description: 'Кристалл из другого измерения.' },
  
  // Legendary
  { id: 'crown', name: 'Корона королей', icon: '👑', rarity: 'legendary', description: 'Легендарная корона древних королей!' },
  { id: 'infinity_gem', name: 'Камень бесконечности', icon: '💠', rarity: 'legendary', description: 'Мифический камень неимоверной силы!' },
  { id: 'excalibur', name: 'Экскалибур', icon: '🗡️', rarity: 'legendary', description: 'Легендарный меч величайшего короля!' },
];

// Боксы
export interface Box {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  currency: CurrencyType;
  chances: Record<Rarity, number>;
  isDaily: boolean;
}

export const BOXES: Box[] = [
  {
    id: 'daily',
    name: 'Ежедневный бокс',
    icon: '📦',
    description: 'Бесплатный бокс. 20 штук каждый день!',
    price: 0,
    currency: 'coins',
    chances: { common: 70, uncommon: 20, rare: 7, epic: 2.5, legendary: 0.5 },
    isDaily: true,
  },
  {
    id: 'basic',
    name: 'Обычный бокс',
    icon: '🎁',
    description: 'Базовый бокс с неплохими шансами.',
    price: 50,
    currency: 'coins',
    chances: { common: 50, uncommon: 30, rare: 14, epic: 5, legendary: 1 },
    isDaily: false,
  },
  {
    id: 'silver',
    name: 'Серебряный бокс',
    icon: '🥈',
    description: 'Улучшенные шансы на редкий лут.',
    price: 150,
    currency: 'coins',
    chances: { common: 35, uncommon: 35, rare: 20, epic: 8, legendary: 2 },
    isDaily: false,
  },
  {
    id: 'gold',
    name: 'Золотой бокс',
    icon: '🥇',
    description: 'Высокие шансы на эпический лут!',
    price: 5,
    currency: 'crystals',
    chances: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 },
    isDaily: false,
  },
  {
    id: 'diamond',
    name: 'Алмазный бокс',
    icon: '💎',
    description: 'Лучшие шансы! Гарантированный эпик+.',
    price: 15,
    currency: 'crystals',
    chances: { common: 5, uncommon: 15, rare: 35, epic: 30, legendary: 15 },
    isDaily: false,
  },
  {
    id: 'mystery',
    name: 'Таинственный бокс',
    icon: '🎰',
    description: 'Покупается за токены. Шансы — загадка!',
    price: 3,
    currency: 'tokens',
    chances: { common: 10, uncommon: 25, rare: 35, epic: 20, legendary: 10 },
    isDaily: false,
  },
];

// Курсы обмена валют
export interface ExchangeRate {
  from: CurrencyType;
  to: CurrencyType;
  rate: number; // сколько "to" за 1 "from"
  minAmount: number;
}

export const EXCHANGE_RATES: ExchangeRate[] = [
  { from: 'coins', to: 'crystals', rate: 0.02, minAmount: 100 },
  { from: 'crystals', to: 'coins', rate: 40, minAmount: 1 },
  { from: 'coins', to: 'tokens', rate: 0.005, minAmount: 200 },
  { from: 'tokens', to: 'coins', rate: 150, minAmount: 1 },
  { from: 'crystals', to: 'tokens', rate: 0.5, minAmount: 2 },
  { from: 'tokens', to: 'crystals', rate: 1.5, minAmount: 2 },
];

// Функция получения лута из бокса
export function getLootFromBox(box: Box): LootItem {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let selectedRarity: Rarity = 'common';
  
  for (const [rarity, chance] of Object.entries(box.chances) as [Rarity, number][]) {
    cumulative += chance;
    if (roll <= cumulative) {
      selectedRarity = rarity;
      break;
    }
  }
  
  const itemsOfRarity = LOOT_ITEMS.filter(item => item.rarity === selectedRarity);
  return itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
}

// Функция получения стоимости предмета в монетах
export function getItemSellPrice(item: LootItem): number {
  return RARITIES[item.rarity].multiplier * 5;
}
