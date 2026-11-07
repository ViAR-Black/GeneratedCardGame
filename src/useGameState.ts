import { useState, useEffect, useCallback } from 'react';
import { CurrencyType, Box, LootItem, getLootFromBox, getItemSellPrice } from './gameData';

export interface InventoryItem {
  item: LootItem;
  count: number;
}

export interface GameState {
  coins: number;
  crystals: number;
  tokens: number;
  inventory: InventoryItem[];
  dailyBoxesLeft: number;
  lastDailyReset: string;
  totalBoxesOpened: number;
  totalItemsFound: number;
  legendaryFound: number;
}

const INITIAL_STATE: GameState = {
  coins: 500,
  crystals: 10,
  tokens: 2,
  inventory: [],
  dailyBoxesLeft: 20,
  lastDailyReset: new Date().toDateString(),
  totalBoxesOpened: 0,
  totalItemsFound: 0,
  legendaryFound: 0,
};

const STORAGE_KEY = 'casino_game_state';

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Проверяем ежедневный сброс
      const today = new Date().toDateString();
      if (state.lastDailyReset !== today) {
        state.dailyBoxesLeft = 20;
        state.lastDailyReset = today;
      }
      return state;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { ...INITIAL_STATE };
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Проверяем ежедневный сброс при каждом обновлении
  useEffect(() => {
    const checkDaily = setInterval(() => {
      const today = new Date().toDateString();
      if (state.lastDailyReset !== today) {
        setState(prev => ({
          ...prev,
          dailyBoxesLeft: 20,
          lastDailyReset: today,
        }));
      }
    }, 60000);
    return () => clearInterval(checkDaily);
  }, [state.lastDailyReset]);

  const getBalance = useCallback((currency: CurrencyType): number => {
    return state[currency];
  }, [state]);

  const canAfford = useCallback((box: Box): boolean => {
    if (box.isDaily) {
      return state.dailyBoxesLeft > 0;
    }
    return state[box.currency] >= box.price;
  }, [state]);

  const openBox = useCallback((box: Box): LootItem | null => {
    if (!canAfford(box)) return null;

    const item = getLootFromBox(box);

    setState(prev => {
      const newState = { ...prev };
      
      if (box.isDaily) {
        newState.dailyBoxesLeft = prev.dailyBoxesLeft - 1;
      } else {
        newState[box.currency] = prev[box.currency] - box.price;
      }
      
      newState.totalBoxesOpened = prev.totalBoxesOpened + 1;
      newState.totalItemsFound = prev.totalItemsFound + 1;
      if (item.rarity === 'legendary') {
        newState.legendaryFound = prev.legendaryFound + 1;
      }
      
      // Добавляем в инвентарь
      const existingItem = prev.inventory.find(i => i.item.id === item.id);
      if (existingItem) {
        newState.inventory = prev.inventory.map(i =>
          i.item.id === item.id ? { ...i, count: i.count + 1 } : i
        );
      } else {
        newState.inventory = [...prev.inventory, { item, count: 1 }];
      }
      
      return newState;
    });

    return item;
  }, [canAfford]);

  const sellItem = useCallback((itemId: string, count: number = 1) => {
    setState(prev => {
      const invItem = prev.inventory.find(i => i.item.id === itemId);
      if (!invItem || invItem.count < count) return prev;

      const sellPrice = getItemSellPrice(invItem.item) * count;
      const newInventory = prev.inventory.map(i => {
        if (i.item.id === itemId) {
          return { ...i, count: i.count - count };
        }
        return i;
      }).filter(i => i.count > 0);

      return {
        ...prev,
        coins: prev.coins + sellPrice,
        inventory: newInventory,
      };
    });
  }, []);

  const sellAllItems = useCallback((rarity?: string) => {
    setState(prev => {
      const itemsToSell = rarity
        ? prev.inventory.filter(i => i.item.rarity === rarity)
        : prev.inventory.filter(i => i.item.rarity === 'common' || i.item.rarity === 'uncommon');
      
      let totalEarned = 0;
      const soldItemIds = new Set(itemsToSell.map(i => i.item.id));
      
      itemsToSell.forEach(i => {
        totalEarned += getItemSellPrice(i.item) * i.count;
      });

      const newInventory = prev.inventory.filter(i => !soldItemIds.has(i.item.id));

      return {
        ...prev,
        coins: prev.coins + totalEarned,
        inventory: newInventory,
      };
    });
  }, []);

  const exchangeCurrency = useCallback((from: CurrencyType, to: CurrencyType, amount: number, rate: number) => {
    setState(prev => {
      if (prev[from] < amount) return prev;
      const received = Math.floor(amount * rate);
      return {
        ...prev,
        [from]: prev[from] - amount,
        [to]: prev[to] + received,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  return {
    state,
    getBalance,
    canAfford,
    openBox,
    sellItem,
    sellAllItems,
    exchangeCurrency,
    resetGame,
  };
}
