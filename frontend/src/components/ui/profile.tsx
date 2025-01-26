import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { User, Clock, Package, Star } from "lucide-react"
import { useExperience } from "../../contexts/experience-context"
import { useLanguage } from "../../contexts/language-context"

interface Reading {
  id: string;
  spread_type: string;
  cards: any[];
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  purchased_products: string[];
}

const LevelDisplay: React.FC = () => {
  const { experience, level } = useExperience();
  const { t } = useLanguage();
  
  return (
    <div className="mt-2 flex items-center gap-2">
      <Star className="w-4 h-4 text-yellow-400" />
      <div className="text-sm">
        <span className="font-medium">{level.title}</span>
        <div className="text-xs text-gray-400">
          {t('profile.experience')}: {experience} / {level.next_level}
        </div>
      </div>
    </div>
  );
};

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    // 获取用户数据
    fetch(`http://localhost:8000/users/${userId}`)
      .then(response => response.json())
      .then(data => setProfile(data))
      .catch(error => console.error('Failed to fetch profile:', error));

    // 模拟占卜历史
    const mockReadings = [
      {
        id: "1",
        spread_type: "单张牌阵",
        cards: ["The Fool"],
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        spread_type: "三张牌阵",
        cards: ["The Magician", "The High Priestess", "The Empress"],
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    setReadings(mockReadings);
    setLoading(false);
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-purple-800/50 rounded-full p-4">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profile?.username || t('profile.default_username')}</h2>
          <p className="text-sm text-gray-300">ID: {profile?.id || '-'}</p>
          <LevelDisplay />
        </div>
      </div>

      <Card className="bg-purple-800/50 border-purple-600">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Package className="mr-2" />
            {t('profile.purchased_items')}
          </h3>
          <div className="space-y-2">
            {profile?.purchased_products.map((productId) => (
              <div key={productId} className="p-2 bg-purple-700/30 rounded">
                {t('profile.product_id')}: {productId}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-800/50 border-purple-600">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Clock className="mr-2" />
            {t('profile.reading_history')}
          </h3>
          <div className="space-y-4">
            {readings.map((reading) => (
              <div key={reading.id} className="p-4 bg-purple-700/30 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{reading.spread_type}</h4>
                    <p className="text-sm text-gray-300">
                      {new Date(reading.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('profile.view_details')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
