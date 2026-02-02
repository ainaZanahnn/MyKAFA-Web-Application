/** @format */


import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./lib/LanguageProvider";
import "./index.css"; // Tailwind styles

ReactDOM.createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
