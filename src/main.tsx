import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { I18nProvider } from "./lib/i18n";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><I18nProvider><App /><Toaster richColors position="bottom-right" closeButton /></I18nProvider></React.StrictMode>,
);
