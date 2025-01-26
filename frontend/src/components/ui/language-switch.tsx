import * as React from 'react'
import { Button } from "./button"
import { useLanguage } from "../../contexts/language-context"

export const LanguageSwitch: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="fixed top-4 right-4"
    >
      {language === 'en' ? '中文' : 'English'}
    </Button>
  );
};
