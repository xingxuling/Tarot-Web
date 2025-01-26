import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { Sparkles, RefreshCcw, Loader2, LayoutGrid } from "lucide-react"
import { MAJOR_ARCANA, type TarotCard, type TarotSpread, TAROT_SPREADS } from './data/tarot-cards'
import { PREMIUM_SPREADS, PREMIUM_CARDS } from './data/premium-content'
import { Store } from './components/ui/store'
import { Profile } from './components/ui/profile'
import { CurrencyProvider } from './contexts/currency-context'
import { AdProvider } from './contexts/ad-context'
import { ExperienceProvider, useExperience } from './contexts/experience-context'
import { LanguageProvider, useLanguage } from './contexts/language-context'
import { BannerAd } from './components/ui/banner-ad'
import { LanguageSwitch } from './components/ui/language-switch'

// 使用大阿尔卡纳牌组
// 移除未使用的常量

const App: React.FC = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  // 创建或获取用户ID
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setIsLoading(false);
      return;
    }

    // 创建新用户
    fetch('http://localhost:8000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `用户${Math.floor(Math.random() * 10000)}` })
    })
    .then(response => response.json())
    .then(data => {
      localStorage.setItem('userId', data.id);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Failed to create user:', error);
      setIsLoading(false);
    });
  }, []);

  // 处理商品购买和解锁
  const unlockProduct = (productId: string) => {
    switch (productId) {
      case 'premium-spreads':
        setUnlockedSpreads(prev => [...prev, ...PREMIUM_SPREADS.map(s => s.id)]);
        break;
      case 'premium-cards':
        setUnlockedCards(prev => [...prev, ...PREMIUM_CARDS.map(c => c.id)]);
        break;
      default:
        console.log('Unknown product:', productId);
    }
  };
  const [view, setView] = useState<'tarot' | 'store' | 'profile'>('tarot')
  const [currentView, setCurrentView] = useState<'menu' | 'spread' | 'reading'>('menu')
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedCard, setSelectedCard] = useState<(TarotCard & { isReversed: boolean; meaning: { current: string } }) | null>(null)
  const [showMeaning, setShowMeaning] = useState(false)

  const { addExperience } = useExperience();
  const [readingCompleted, setReadingCompleted] = useState(false);

  // 完成占卜时获得经验值
  const completeReading = async () => {
    if (readingCompleted) return;
    try {
      await addExperience(30); // 完成一次占卜获得30经验值
      setReadingCompleted(true);
    } catch (error) {
      console.error('Failed to add experience for completing reading:', error);
    }
  };

const drawCard = () => {
    if (!selectedSpread) return;
    
    setIsDrawing(true)
    setShowMeaning(false)
    setSelectedCard(null)
    
    // 找到第一个未抽取的位置
    const emptyPositionIndex = selectedSpread.positions.findIndex(p => !p.card)
    if (emptyPositionIndex === -1) return;
    
    // 模拟抽牌动画
    setTimeout(async () => {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)]
      const isReversed = Math.random() > 0.5
      const drawnCard = {
        ...randomCard,
        isReversed,
        meaning: {
          ...randomCard.meaning,
          current: isReversed ? randomCard.meaning.reversed : randomCard.meaning.upright
        }
      } as TarotCard & { isReversed: boolean; meaning: { current: string } }
      
      // 更新牌阵位置
      const updatedPositions = selectedSpread.positions.map((position, index) => 
        index === emptyPositionIndex ? { ...position, card: drawnCard } : position
      )
      
      setSelectedSpread({
        ...selectedSpread,
        positions: updatedPositions
      })
      
      setSelectedCard(drawnCard)
      setIsDrawing(false)
      
      // 抽牌获得经验值
      try {
        await addExperience(10);
      } catch (error) {
        console.error('Failed to add experience for drawing card:', error);
      }
    }, 1000)
  }

  const [unlockedSpreads, setUnlockedSpreads] = useState<string[]>([])
  const [unlockedCards, setUnlockedCards] = useState<number[]>([])

  // 监听商品解锁事件
  useEffect(() => {
    const handleUnlock = (event: Event) => {
      const customEvent = event as CustomEvent<{ productId: string }>;
      unlockProduct(customEvent.detail.productId);
    };

    window.addEventListener('productUnlocked', handleUnlock);
    return () => {
      window.removeEventListener('productUnlocked', handleUnlock);
    };
  }, []);

  // 合并基础和已解锁的高级内容
  const availableSpreads = useMemo(() => 
    [...TAROT_SPREADS, ...PREMIUM_SPREADS.filter(spread => unlockedSpreads.includes(spread.id))],
    [unlockedSpreads]
  );
  
  const availableCards = useMemo(() => 
    [...MAJOR_ARCANA, ...PREMIUM_CARDS.filter(card => unlockedCards.includes(card.id))],
    [unlockedCards]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <CurrencyProvider>
      <AdProvider>
        <ExperienceProvider>
          <LanguageProvider>
          <div className="relative min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4 pb-16">
          <LanguageSwitch />
          <header className="text-center mb-8 pt-12">
            <h1 className="text-2xl font-bold mb-2">{t('tarot.title')}</h1>
            <p className="text-sm text-gray-300">{t('tarot.subtitle')}</p>
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant={view === 'tarot' ? 'default' : 'outline'}
                onClick={() => setView('tarot')}
              >
                {t('nav.tarot')}
              </Button>
              <Button
                variant={view === 'store' ? 'default' : 'outline'}
                onClick={() => setView('store')}
              >
                {t('nav.store')}
              </Button>
              <Button
                variant={view === 'profile' ? 'default' : 'outline'}
                onClick={() => setView('profile')}
              >
                {t('nav.profile')}
              </Button>
            </div>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {view === 'store' && <Store />}
        {view === 'profile' && <Profile />}
        {view === 'tarot' && currentView === 'menu' && (
          <div className="space-y-4">
            <Card className="bg-purple-800/50 border-purple-600">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">选择牌阵</h2>
                <div className="space-y-3">
                  {availableSpreads.map((spread) => (
                    <Button
                      key={spread.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedSpread({
                          ...spread,
                          positions: spread.positions.map(p => ({ ...p }))
                        });
                        setCurrentView('spread');
                        setReadingCompleted(false);
                      }}
                    >
                      <LayoutGrid className="mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{spread.name}</div>
                        <div className="text-sm text-gray-400">{spread.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'spread' && selectedSpread && (
          <Card className="bg-purple-800/50 border-purple-600">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">{selectedSpread.name}</h2>
              <p className="text-sm text-gray-300 mb-6">{selectedSpread.description}</p>
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setCurrentView('reading')}
              >
                <Sparkles className="mr-2" />
                开始占卜
              </Button>
            </CardContent>
          </Card>
        )}

        {currentView === 'reading' && selectedSpread && (
          <Card className="bg-purple-800/50 border-purple-600">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">{selectedSpread.name}</h2>
              <div className="relative w-full aspect-video bg-purple-900/30 rounded-lg mb-6">
                {selectedSpread.positions.map((position, index) => (
                  <div
                    key={position.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                  >
                    {isDrawing && index === selectedSpread.positions.findIndex(p => !p.card) ? (
                      <div className="w-24 h-36 bg-purple-800/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="animate-spin w-8 h-8 text-purple-400" />
                      </div>
                    ) : position.card ? (
                      <div 
                        className={`w-24 h-36 bg-purple-800/50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:scale-110 ${position.card.isReversed ? 'rotate-180' : ''}`}
                        onClick={() => position.card && setSelectedCard(position.card)}
                      >
                        <div className="text-4xl">{position.card.image}</div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-24 h-36"
                        onClick={drawCard}
                      >
                        <Sparkles className="w-8 h-8" />
                      </Button>
                    )}
                    <div className="absolute top-full mt-2 text-sm text-purple-300 whitespace-nowrap">
                      {position.name}
                    </div>
                  </div>
                ))}
              </div>
              {selectedCard && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">{selectedCard.name}</h2>
                  <p className="text-sm text-gray-400">{selectedCard.nameEn}</p>
                  <p className="text-sm text-purple-400">{selectedCard.isReversed ? '逆位' : '正位'}</p>
                  {showMeaning ? (
                    <div className="animate-fade-in space-y-4">
                      <div>
                        <h3 className="font-medium text-purple-300">牌义解释</h3>
                        <p className="text-sm text-gray-300">{selectedCard.meaning.current}</p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button
                          variant="ghost"
                          onClick={drawCard}
                          className="mt-4"
                        >
                          <RefreshCcw className="mr-2" />
                          重新抽牌
                        </Button>
                        {!readingCompleted && selectedSpread.positions.every(p => p.card) && (
                          <Button
                            variant="default"
                            onClick={completeReading}
                            className="mt-4"
                          >
                            完成占卜
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowMeaning(true)}
                      className="mt-2"
                    >
                      查看解释
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
          </div>
          <BannerAd />
          </LanguageProvider>
        </ExperienceProvider>
        </AdProvider>
      </CurrencyProvider>
  );
};

export default App;
