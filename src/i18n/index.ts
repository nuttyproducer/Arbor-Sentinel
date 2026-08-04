/**
 * Internationalization barrel export.
 *
 * Import from here to get i18n instance, types, and hooks:
 * ```ts
 * import { useTranslation, SUPPORTED_LOCALES, LOCALE_NATIVE_NAMES } from "../i18n";
 * ```
 */

export { default as i18n } from "./config";
export { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_NATIVE_NAMES } from "./config";
export type { SupportedLocale } from "./config";
export { useTranslation, Trans, I18nextProvider } from "react-i18next";
