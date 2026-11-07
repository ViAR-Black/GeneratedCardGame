import { useState } from 'react';
import { useGameState } from './useGameState';
import { BOXES, Box, CURRENCIES, RARITIES, EXCHANGE_RATES, CurrencyType, LootItem, getItemSellPrice, Rarity } from './gameData';

type Tab = 'shop' | 'inventory' | 'exchange' | 'stats';

export default function App() {
  const { state, canAfford, openBox, sellItem, sellAllItems, exchangeCurrency, resetGame } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('shop');
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [lastItem, setLastItem] = useState<LootItem | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<LootItem[]>([]);
  const [inventoryFilter, setInventoryFilter] = useState<Rarity | 'all'>('all');

  // Exchange state
  const [exchangeFrom, setExchangeFrom] = useState<CurrencyType>('coins');
  const [exchangeTo, setExchangeTo] = useState<CurrencyType>('crystals');
  const [exchangeAmount, setExchangeAmount] = useState(100);

  const handleOpenBox = (box: Box) => {
    if (!canAfford(box)) return;
    setSelectedBox(box);
    setIsOpening(true);
    setShowResult(false);
    setLastItem(null);

    setTimeout(() => {
      const item = openBox(box);
      if (item) {
        setLastItem(item);
        setShowResult(true);
        setHistory(prev => [item, ...prev].slice(0, 20));
      }
      setIsOpening(false);
    }, 1500);
  };

  const handleExchange = () => {
    const rateInfo = EXCHANGE_RATES.find(
      r => r.from === exchangeFrom && r.to === exchangeTo
    );
    if (rateInfo && exchangeAmount >= rateInfo.minAmount) {
      exchangeCurrency(exchangeFrom, exchangeTo, exchangeAmount, rateInfo.rate);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'shop', label: 'Магазин', icon: '🏪' },
    { id: 'inventory', label: 'Инвентарь', icon: '🎒' },
    { id: 'exchange', label: 'Обмен', icon: '💱' },
    { id: 'stats', label: 'Статистика', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🎰 Казино
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-3 py-1.5">
                <span className="text-yellow-400">🪙</span>
                <span className="font-bold text-yellow-300">{state.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-3 py-1.5">
                <span className="text-purple-400">💎</span>
                <span className="font-bold text-purple-300">{state.crystals.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-3 py-1.5">
                <span className="text-green-400">🎟️</span>
                <span className="font-bold text-green-300">{state.tokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {/* Daily boxes indicator */}
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-gray-400">Ежедневные боксы:</span>
            <span className={`font-bold ${state.dailyBoxesLeft > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {state.dailyBoxesLeft}/20
            </span>
            <span className="text-gray-500">📦</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-800/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🏪 Магазин боксов</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BOXES.map(box => (
                <div
                  key={box.id}
                  className={`relative bg-gray-800 rounded-xl border-2 p-5 transition-all hover:scale-105 ${
                    box.isDaily ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {box.isDaily && (
                    <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      БЕСПЛАТНО
                    </div>
                  )}
                  <div className="text-center mb-3">
                    <span className="text-5xl">{box.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-center mb-1">{box.name}</h3>
                  <p className="text-gray-400 text-sm text-center mb-3">{box.description}</p>
                  
                  {/* Chances */}
                  <div className="space-y-1 mb-4">
                    {Object.entries(box.chances).map(([rarity, chance]) => (
                      <div key={rarity} className="flex items-center justify-between text-xs">
                        <span className={RARITIES[rarity as keyof typeof RARITIES].color}>
                          {RARITIES[rarity as keyof typeof RARITIES].name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                rarity === 'common' ? 'bg-gray-400' :
                                rarity === 'uncommon' ? 'bg-green-400' :
                                rarity === 'rare' ? 'bg-blue-400' :
                                rarity === 'epic' ? 'bg-purple-400' :
                                'bg-yellow-400'
                              }`}
                              style={{ width: `${Math.min(chance * 2, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-400 w-12 text-right">{chance}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="text-center mb-3">
                    {box.isDaily ? (
                      <span className="text-green-400 font-bold">Бесплатно ({state.dailyBoxesLeft} осталось)</span>
                    ) : (
                      <span className="font-bold">
                        {CURRENCIES[box.currency].icon} {box.price} {CURRENCIES[box.currency].name}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenBox(box)}
                    disabled={!canAfford(box)}
                    className={`w-full py-2.5 rounded-lg font-bold transition-all ${
                      canAfford(box)
                        ? box.isDaily
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford(box) ? '🎲 Открыть' : '❌ Недостаточно средств'}
                  </button>
                </div>
              ))}
            </div>

            {/* Recent history */}
            {history.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 text-gray-300">🕐 Последние открытия</h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      className={`${RARITIES[item.rarity].bgColor} border ${RARITIES[item.rarity].borderColor} rounded-lg px-3 py-2 flex items-center gap-2 text-sm`}
                      title={`${item.name} (${RARITIES[item.rarity].name})`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className={RARITIES[item.rarity].color}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">🎒 Инвентарь</h2>
              <button
                onClick={() => sellAllItems()}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                💰 Продать всё (Обыч./Необыч.)
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setInventoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  inventoryFilter === 'all' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Все
              </button>
              {Object.entries(RARITIES).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setInventoryFilter(key as Rarity)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    inventoryFilter === key ? `${info.bgColor} ${info.color} border ${info.borderColor}` : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {info.name}
                </button>
              ))}
            </div>
            
            {state.inventory.filter(i => inventoryFilter === 'all' || i.item.rarity === inventoryFilter).length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <span className="text-6xl block mb-4">📭</span>
                <p className="text-lg">
                  {inventoryFilter === 'all' ? 'Инвентарь пуст' : `Нет предметов с редкостью "${RARITIES[inventoryFilter].name}"`}
                </p>
                <p className="text-sm">Откройте боксы, чтобы получить предметы!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {state.inventory
                  .filter(i => inventoryFilter === 'all' || i.item.rarity === inventoryFilter)
                  .map(invItem => {
                    const rarityInfo = RARITIES[invItem.item.rarity];
                    return (
                      <div
                        key={invItem.item.id}
                        className={`${rarityInfo.bgColor} border-2 ${rarityInfo.borderColor} rounded-xl p-4 relative transition-all hover:scale-105 shadow-lg ${rarityInfo.glowColor}`}
                      >
                        <div className="absolute top-2 right-2 bg-gray-900/80 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          x{invItem.count}
                        </div>
                        <div className="text-center">
                          <span className="text-4xl block mb-2">{invItem.item.icon}</span>
                          <h4 className={`font-bold text-sm ${rarityInfo.color}`}>{invItem.item.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{rarityInfo.name}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-tight">{invItem.item.description}</p>
                          <div className="mt-3 flex gap-1">
                            <button
                              onClick={() => sellItem(invItem.item.id, 1)}
                              className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-xs py-1.5 rounded font-bold transition-all"
                            >
                              🪙 {getItemSellPrice(invItem.item)}
                            </button>
                            {invItem.count > 1 && (
                              <button
                                onClick={() => sellItem(invItem.item.id, invItem.count)}
                                className="bg-red-600 hover:bg-red-500 text-xs px-2 py-1.5 rounded font-bold transition-all"
                              >
                                Всё
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Exchange Tab */}
        {activeTab === 'exchange' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">💱 Обмен валют</h2>
            
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg mx-auto">
              <div className="space-y-4">
                {/* From */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Отдаю</label>
                  <div className="flex gap-2">
                    <select
                      value={exchangeFrom}
                      onChange={(e) => setExchangeFrom(e.target.value as CurrencyType)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 flex-1"
                    >
                      {Object.values(CURRENCIES).map(c => (
                        <option key={c.type} value={c.type}>
                          {c.icon} {c.name} (Баланс: {state[c.type]})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={exchangeAmount}
                      onChange={(e) => setExchangeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-28 text-right"
                      min={0}
                    />
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-center text-2xl text-gray-500">⬇️</div>

                {/* To */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Получаю</label>
                  <select
                    value={exchangeTo}
                    onChange={(e) => setExchangeTo(e.target.value as CurrencyType)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 w-full"
                  >
                    {Object.values(CURRENCIES).map(c => (
                      <option key={c.type} value={c.type}>
                        {c.icon} {c.name} (Баланс: {state[c.type]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rate info */}
                {(() => {
                  const rateInfo = EXCHANGE_RATES.find(r => r.from === exchangeFrom && r.to === exchangeTo);
                  if (!rateInfo) return (
                    <div className="text-center text-red-400 py-4">
                      ⚠️ Этот курс обмена недоступен
                    </div>
                  );
                  const received = Math.floor(exchangeAmount * rateInfo.rate);
                  return (
                    <div className="bg-gray-700/50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Курс:</span>
                        <span>1 {CURRENCIES[exchangeFrom].icon} = {rateInfo.rate} {CURRENCIES[exchangeTo].icon}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Мин. сумма:</span>
                        <span>{rateInfo.minAmount} {CURRENCIES[exchangeFrom].icon}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-gray-300">Получите:</span>
                        <span className="text-green-400">{received.toLocaleString()} {CURRENCIES[exchangeTo].icon}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Exchange button */}
                <button
                  onClick={handleExchange}
                  disabled={(() => {
                    const rateInfo = EXCHANGE_RATES.find(r => r.from === exchangeFrom && r.to === exchangeTo);
                    return !rateInfo || exchangeAmount < rateInfo.minAmount || state[exchangeFrom] < exchangeAmount;
                  })()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 py-3 rounded-lg font-bold transition-all"
                >
                  💱 Обменять
                </button>
              </div>
            </div>

            {/* Available rates */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 text-gray-300">Доступные курсы обмена:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXCHANGE_RATES.map((rate, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-3 flex items-center justify-between">
                    <span className="text-sm">
                      1 {CURRENCIES[rate.from].icon} → {rate.rate} {CURRENCIES[rate.to].icon}
                    </span>
                    <span className="text-xs text-gray-500">мин. {rate.minAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📊 Статистика</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 text-center">
                <span className="text-3xl block mb-2">📦</span>
                <div className="text-2xl font-bold text-yellow-400">{state.totalBoxesOpened}</div>
                <div className="text-sm text-gray-400">Боксов открыто</div>
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 text-center">
                <span className="text-3xl block mb-2">🎁</span>
                <div className="text-2xl font-bold text-green-400">{state.totalItemsFound}</div>
                <div className="text-sm text-gray-400">Предметов найдено</div>
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 text-center">
                <span className="text-3xl block mb-2">👑</span>
                <div className="text-2xl font-bold text-purple-400">{state.legendaryFound}</div>
                <div className="text-sm text-gray-400">Легендарных</div>
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 text-center">
                <span className="text-3xl block mb-2">🎒</span>
                <div className="text-2xl font-bold text-blue-400">{state.inventory.reduce((sum, i) => sum + i.count, 0)}</div>
                <div className="text-sm text-gray-400">Предметов в инвентаре</div>
              </div>
            </div>

            {/* Balance info */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-6">
              <h3 className="text-lg font-bold mb-3">💰 Баланс</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-2xl">🪙</span>
                  <div className="font-bold text-yellow-400">{state.coins.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Монеты</div>
                </div>
                <div className="text-center">
                  <span className="text-2xl">💎</span>
                  <div className="font-bold text-purple-400">{state.crystals.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Кристаллы</div>
                </div>
                <div className="text-center">
                  <span className="text-2xl">🎟️</span>
                  <div className="font-bold text-green-400">{state.tokens.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Токены</div>
                </div>
              </div>
            </div>

            {/* Inventory value */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-6">
              <h3 className="text-lg font-bold mb-3">📦 Стоимость инвентаря</h3>
              <div className="text-2xl font-bold text-yellow-400">
                🪙 {state.inventory.reduce((sum, i) => sum + getItemSellPrice(i.item) * i.count, 0).toLocaleString()}
              </div>
            </div>

            {/* Reset */}
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Сброс прогресса</h3>
              <p className="text-sm text-gray-400 mb-3">Это действие удалит весь прогресс и нельзя будет отменить.</p>
              <button
                onClick={() => {
                  if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
                    resetGame();
                  }
                }}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold text-sm transition-all"
              >
                🗑️ Сбросить игру
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Box Opening Modal */}
      {(selectedBox && (isOpening || showResult)) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { if (showResult) { setSelectedBox(null); setLastItem(null); setShowResult(false); } }}>
          <div className="bg-gray-800 rounded-2xl border border-gray-600 p-8 max-w-md w-full text-center animate-slide-up" onClick={e => e.stopPropagation()}>
            {isOpening ? (
              <div className="py-8">
                <div className="text-7xl animate-bounce mb-4">{selectedBox.icon}</div>
                <p className="text-xl font-bold animate-pulse text-yellow-400">Открываем бокс...</p>
                <div className="mt-6 flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : lastItem ? (
              <div className="py-4">
                <p className="text-gray-400 mb-3 text-lg">✨ Вы получили: ✨</p>
                <div className={`${RARITIES[lastItem.rarity].bgColor} border-2 ${RARITIES[lastItem.rarity].borderColor} rounded-xl p-6 shadow-lg ${RARITIES[lastItem.rarity].glowColor} mb-4 animate-slide-up`}>
                  <span className="text-8xl block mb-3 animate-float">{lastItem.icon}</span>
                  <h3 className={`text-2xl font-bold ${RARITIES[lastItem.rarity].color}`}>{lastItem.name}</h3>
                  <p className={`text-sm ${RARITIES[lastItem.rarity].color} opacity-75 mt-1 font-medium`}>
                    {RARITIES[lastItem.rarity].name}
                  </p>
                  <p className="text-gray-400 text-sm mt-3 italic">{lastItem.description}</p>
                  <div className="mt-3 bg-gray-900/50 rounded-lg p-2">
                    <p className="text-yellow-400 text-sm font-bold">💰 Стоимость: {getItemSellPrice(lastItem)} монет</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelectedBox(null); setLastItem(null); setShowResult(false); }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-2.5 rounded-lg font-bold transition-all"
                  >
                    🎒 В инвентарь
                  </button>
                  <button
                    onClick={() => {
                      sellItem(lastItem.id, 1);
                      setSelectedBox(null);
                      setLastItem(null);
                      setShowResult(false);
                    }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 px-6 py-2.5 rounded-lg font-bold transition-all"
                  >
                    💰 Продать ({getItemSellPrice(lastItem)})
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
