import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { ShoppingCart, Package, Coins } from "lucide-react"
import { useCurrency } from "../../contexts/currency-context"
import { useExperience } from "../../contexts/experience-context"
import { CurrencyModal } from "./currency-modal"
import { useLanguage } from "../../contexts/language-context"

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export const Store: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)
  const { balance, deductBalance } = useCurrency()
  const { addExperience } = useExperience()

  useEffect(() => {
    // 获取商品列表
    fetch('http://localhost:8000/products')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // 使用备用数据
          setProducts([
            {
              id: "premium-spreads",
              name: "高级牌阵套装",
              description: "解锁专业凯尔特十字牌阵和关系解析牌阵",
              price: 199,
              image: "🎴"
            },
            {
              id: "premium-cards",
              name: "高级塔罗牌",
              description: "解锁命运之轮和正义等高级牌",
              price: 99,
              image: "🎭"
            },
            {
              id: "reading-guide",
              name: "塔罗占卜指南",
              description: "详细的塔罗牌解读指南",
              price: 49,
              image: "📖"
            }
          ]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch products:', error);
        setLoading(false);
      });
  }, [])

  // 购买商品
  const purchaseProduct = async (product: Product) => {
    if (deductBalance(product.price)) {
      try {
        // 调用后端API记录购买
        const response = await fetch(`/api/purchase/${product.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
        
        if (response.ok) {
          // 通知App组件解锁内容
          window.dispatchEvent(new CustomEvent('productUnlocked', {
            detail: { productId: product.id }
          }));
          
          // 购买商品获得经验值
          try {
            await addExperience(50);
          } catch (error) {
            console.error('Failed to add experience for purchase:', error);
          }
        }
      } catch (error) {
        console.error('Purchase failed:', error);
      }
    } else {
      setShowCurrencyModal(true);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('store.title')}</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowCurrencyModal(true)}>
            <Coins className="mr-2" />
            {balance} {t('store.currency')}
          </Button>
          <Button variant="outline">
            <ShoppingCart className="mr-2" />
            {t('store.cart')}
          </Button>
        </div>
      </div>
      <CurrencyModal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="bg-purple-800/50 border-purple-600">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl mb-4">{product.image}</div>
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-300 mb-4">{product.description}</p>
                  <div className="text-lg font-bold text-purple-300">¥{product.price}</div>
                </div>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => purchaseProduct(product)}
                >
                  <Package className="mr-2" />
                  {t('store.purchase')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
