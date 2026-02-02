/** @format */

import { createContext } from "react";

export type Language = "en" | "my" | "jawi";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

/**
 * Context only — NO React components here
 */
export const LanguageContext =
  createContext<LanguageContextType | null>(null);
