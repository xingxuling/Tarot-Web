import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'

interface ExperienceContextType {
  experience: number;
  level: {
    level: number;
    title: string;
    title_en: string;
    next_level: number;
  };
  addExperience: (amount: number) => Promise<void>;
  fetchLevel: () => Promise<void>;
}

const ExperienceContext = createContext<ExperienceContextType>({
  experience: 0,
  level: {
    level: 1,
    title: "塔罗初学者",
    title_en: "Tarot Beginner",
    next_level: 500
  },
  addExperience: async () => {},
  fetchLevel: async () => {}
});

export const useExperience = () => useContext(ExperienceContext);

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState({
    level: 1,
    title: "塔罗初学者",
    title_en: "Tarot Beginner",
    next_level: 500
  });

  const fetchLevel = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch(`http://localhost:8000/users/${userId}/level`);
      const data = await response.json();
      
      setExperience(data.experience);
      setLevel(data.level_info);
    } catch (error) {
      console.error('Failed to fetch level:', error);
    }
  }, []);

  const addExperience = useCallback(async (amount: number) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch(`http://localhost:8000/users/${userId}/experience?xp_amount=${amount}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      setExperience(data.experience);
      setLevel(data.level_info);
    } catch (error) {
      console.error('Failed to add experience:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchLevel();
  }, [fetchLevel]);

  return (
    <ExperienceContext.Provider value={{ experience, level, addExperience, fetchLevel }}>
      {children}
    </ExperienceContext.Provider>
  );
};
