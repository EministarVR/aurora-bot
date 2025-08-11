import { currentLocale } from "./i18n.js";

export function nf(n, locale = null) {
  const loc = locale || currentLocale();
  return new Intl.NumberFormat(loc).format(n);
}
