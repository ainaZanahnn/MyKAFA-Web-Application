//** @format */
/*
import React, { createContext, useState } from "react";
import type { ReactNode } from "react";

export type Language = "en" | "my" | "jawi";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = React.createContext<
  LanguageContextType | undefined
>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("my");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
*/