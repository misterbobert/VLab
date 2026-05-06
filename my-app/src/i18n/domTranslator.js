const CACHE_PREFIX = "voltlab:translation:";

export const LANGUAGES = [
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "hu", label: "Magyar", flag: "🇭🇺" },
  { code: "bg", label: "Български", flag: "🇧🇬" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

let currentTranslateRun = 0;

function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function googleLangCode(lang) {
  if (lang === "zh-CN") return "zh-CN";
  return lang;
}

function shouldSkipElement(element) {
  if (!element) return true;

  const tag = element.tagName?.toLowerCase();

  return (
    tag === "script" ||
    tag === "style" ||
    tag === "code" ||
    tag === "pre" ||
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    tag === "option" ||
    tag === "svg" ||
    tag === "path" ||
    tag === "circle" ||
    tag === "rect" ||
    tag === "line" ||
    tag === "polyline" ||
    tag === "polygon" ||
    tag === "canvas" ||
    element.closest("svg") ||
    element.closest("canvas") ||
    element.closest("[data-no-translate]") ||
    element.closest(".no-translate")
  );
}

function looksLikeOnlySymbols(text) {
  return /^[\d\s.,:;!?()[\]{}+\-*/%=<>|Ωµ°%·—–_#]+$/.test(text);
}

function getOriginalNodeText(node) {
  if (!node.__voltlabOriginalText) {
    node.__voltlabOriginalText = node.nodeValue;
  }
  return normalizeText(node.__voltlabOriginalText);
}

function setTranslatedNodeText(node, translatedText) {
  const originalRaw = node.__voltlabOriginalText ?? node.nodeValue;
  const prefix = String(originalRaw).match(/^\s*/)?.[0] ?? "";
  const suffix = String(originalRaw).match(/\s*$/)?.[0] ?? "";
  node.nodeValue = `${prefix}${translatedText}${suffix}`;
}

function restoreRomanian(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;

  while ((node = walker.nextNode())) {
    if (node.__voltlabOriginalText != null) {
      node.nodeValue = node.__voltlabOriginalText;
    }
  }

  document.documentElement.lang = "ro";
}

function getTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = normalizeText(node.nodeValue);

      if (!text) return NodeFilter.FILTER_REJECT;
      if (text.length < 2) return NodeFilter.FILTER_REJECT;
      if (looksLikeOnlySymbols(text)) return NodeFilter.FILTER_REJECT;

      const parent = node.parentElement;
      if (shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  let node;

  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  return nodes;
}

function simpleHash(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function cacheKey(lang, text) {
  return `${CACHE_PREFIX}${lang}:${simpleHash(text)}`;
}

function getCachedTranslation(lang, text) {
  try {
    return localStorage.getItem(cacheKey(lang, text));
  } catch {
    return null;
  }
}

function setCachedTranslation(lang, text, translation) {
  try {
    localStorage.setItem(cacheKey(lang, text), translation);
  } catch {
    // localStorage poate fi plin sau blocat; traducerea tot funcționează fără cache.
  }
}

async function translateWithGoogle(text, targetLang) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "ro");
  url.searchParams.set("tl", googleLangCode(targetLang));
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google translate failed: ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.[0]?.map((part) => part?.[0] ?? "").join("");

  if (!translated) {
    throw new Error("Google translate returned empty text");
  }

  return translated;
}

async function translateWithMyMemory(text, targetLang) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `ro|${targetLang}`);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`MyMemory translate failed: ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.responseData?.translatedText;

  if (!translated) {
    throw new Error("MyMemory returned empty text");
  }

  return translated;
}

async function translateText(text, targetLang) {
  if (targetLang === "ro") return text;

  const cached = getCachedTranslation(targetLang, text);
  if (cached) return cached;

  let translated;

  try {
    // Important: MyMemory dă rapid 429 pe pagini mari. De aceea folosim întâi endpointul Google public.
    translated = await translateWithGoogle(text, targetLang);
  } catch (googleError) {
    translated = await translateWithMyMemory(text, targetLang);
  }

  setCachedTranslation(targetLang, text, translated);
  return translated;
}

function applyTranslationToNodes(nodes, originalText, translatedText) {
  nodes.forEach((node) => {
    const original = getOriginalNodeText(node);
    if (original === originalText) {
      setTranslatedNodeText(node, translatedText);
    }
  });
}

async function runWithConcurrency(items, limit, worker) {
  let index = 0;

  async function runOne() {
    while (index < items.length) {
      const currentIndex = index;
      index++;
      await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runOne())
  );
}

export async function translatePage(targetLang, options = {}) {
  const runId = ++currentTranslateRun;
  const lang = targetLang || "ro";

  document.documentElement.lang = lang;
  localStorage.setItem("voltlab:lang", lang);

  if (lang === "ro") {
    restoreRomanian();
    return;
  }

  // Revenim întâi la română, ca schimbarea EN -> FR să traducă mereu textul original, nu text deja tradus.
  restoreRomanian();

  const root = options.root || document.body;
  const nodes = getTextNodes(root);
  const uniqueTexts = [...new Set(nodes.map((node) => getOriginalNodeText(node)))].filter(Boolean);

  const missingTexts = [];

  for (const text of uniqueTexts) {
    const cached = getCachedTranslation(lang, text);
    if (cached) {
      applyTranslationToNodes(nodes, text, cached);
    } else {
      missingTexts.push(text);
    }
  }

  if (missingTexts.length === 0) return;

  await runWithConcurrency(missingTexts, 2, async (text) => {
    if (runId !== currentTranslateRun) return;

    try {
      const translated = await translateText(text, lang);
      if (runId !== currentTranslateRun) return;
      applyTranslationToNodes(nodes, text, translated);
    } catch (error) {
      console.warn(`VoltLab translation failed for text: ${text}`, error);
    }
  });
}

export function getSavedLanguage() {
  return localStorage.getItem("voltlab:lang") || "ro";
}

export function requestPageRetranslation() {
  window.dispatchEvent(new CustomEvent("voltlab:content-changed"));
}
