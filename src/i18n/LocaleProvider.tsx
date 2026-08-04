/**
 * Locale provider — wraps the app with I18nextProvider,
 * sets <html lang> attribute, and handles locale changes.
 */

import { useEffect, type ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "./config";

interface LocaleProviderProps {
  children: ReactNode;
}

/** Sets <html lang> and <html dir> when the locale changes. */
function LocaleEffects() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", i18n.language);

    // Future RTL support — placeholder for Arabic/Hebrew
    const rtlLanguages: string[] = [];
    if (rtlLanguages.includes(i18n.language)) {
      html.setAttribute("dir", "rtl");
    } else {
      html.removeAttribute("dir");
    }
  }, [i18n.language]);

  return null;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <LocaleEffects />
      {children}
    </I18nextProvider>
  );
}
