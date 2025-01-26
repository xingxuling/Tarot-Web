import { useState } from 'react'
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { Sparkles, RefreshCcw, Loader2, LayoutGrid } from "lucide-react"
import { MAJOR_ARCANA, type TarotCard, type TarotSpread, TAROT_SPREADS } from './data/tarot-cards'
import { Store } from './components/ui/store'
import { Profile } from './components/ui/profile'

// 使用大阿尔卡纳牌组
const TAROT_CARDS = MAJOR_ARCANA;

function App() {
  const [view, setView] = useState<'tarot' | 'store' | 'profile'>('tarot')
  const [currentView, setCurrentView] = useState<'menu' | 'spread' | 'reading'>('menu')
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedCard, setSelectedCard] = useState<(TarotCard & { isReversed: boolean; meaning: { current: string } }) | null>(null)
  const [showMeaning, setShowMeaning] = useState(false)

  const drawCard = () => {
    if (!selectedSpread) return;
    
    setIsDrawing(true)
    setShowMeaning(false)
    setSelectedCard(null)
    
    // 找到第一个未抽取的位置
    const emptyPositionIndex = selectedSpread.positions.findIndex(p => !p.card)
    if (emptyPositionIndex === -1) return;
    
    // 模拟抽牌动画
    setTimeout(() => {
      const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)]
      const isReversed = Math.random() > 0.5
      const drawnCard = {
        ...randomCard,
        isReversed,
        meaning: {
          ...randomCard.meaning,
          current: isReversed ? randomCard.meaning.reversed : randomCard.meaning.upright
        }
      }
      
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
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-2xl font-bold mb-2">塔罗占卜</h1>
        <p className="text-sm text-gray-300">探索命运的奥秘</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant={view === 'tarot' ? 'default' : 'outline'}
            onClick={() => setView('tarot')}
          >
            占卜
          </Button>
          <Button
            variant={view === 'store' ? 'default' : 'outline'}
            onClick={() => setView('store')}
          >
            商城
          </Button>
          <Button
            variant={view === 'profile' ? 'default' : 'outline'}
            onClick={() => setView('profile')}
          >
            个人中心
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
                  {TAROT_SPREADS.map((spread) => (
                    <Button
                      key={spread.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedSpread(spread);
                        setCurrentView('spread');
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
                      <Button
                        variant="ghost"
                        onClick={drawCard}
                        className="mt-4"
                      >
                        <RefreshCcw className="mr-2" />
                        重新抽牌
                      </Button>
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
  )
}

export default App
