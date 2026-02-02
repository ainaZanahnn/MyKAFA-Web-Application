/** @format */

import { useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext, type Language } from "./languageContext";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("my");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
