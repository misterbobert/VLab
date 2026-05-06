const CACHE_PREFIX = "voltlab:translation:";
const ORIGINAL_TEXT_ATTR = "data-original-text";

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
    element.closest("[data-no-translate]") ||
    element.closest(".no-translate")
  );
}

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = normalizeText(node.nodeValue);

      if (!text) return NodeFilter.FILTER_REJECT;
      if (text.length < 2) return NodeFilter.FILTER_REJECT;

      if (/^[\d\s.,:;!?()[\]{}+\-*/%=<>|Ωµ]+$/.test(text)) {
        return NodeFilter.FILTER_REJECT;
      }

      const parent = node.parentElement;

      if (shouldSkipElement(parent)) {
        return NodeFilter.FILTER_REJECT;
      }

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
    // dacă localStorage e plin, ignorăm
  }
}

async function translateText(text, targetLang) {
  if (targetLang === "ro") return text;

  const cached = getCachedTranslation(targetLang, text);
  if (cached) return cached;

  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `ro|${targetLang}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Translation request failed");
  }

  const data = await response.json();
  const translated = data?.responseData?.translatedText;

  if (!translated) {
    return text;
  }

  setCachedTranslation(targetLang, text, translated);

  return translated;
}

function rememberOriginalText(node) {
  const parent = node.parentElement;
  if (!parent) return normalizeText(node.nodeValue);

  if (!parent.hasAttribute(ORIGINAL_TEXT_ATTR)) {
    parent.setAttribute(ORIGINAL_TEXT_ATTR, node.nodeValue);
  }

  return normalizeText(parent.getAttribute(ORIGINAL_TEXT_ATTR) || node.nodeValue);
}

function restoreRomanian(root = document.body) {
  const elements = root.querySelectorAll(`[${ORIGINAL_TEXT_ATTR}]`);

  elements.forEach((el) => {
    const original = el.getAttribute(ORIGINAL_TEXT_ATTR);

    if (original) {
      el.textContent = original;
    }

    el.removeAttribute(ORIGINAL_TEXT_ATTR);
  });
}

function applyTranslationToNodes(nodes, originalText, translatedText) {
  nodes.forEach((node) => {
    const original = rememberOriginalText(node);

    if (original === originalText) {
      node.nodeValue = node.nodeValue.replace(
        normalizeText(node.nodeValue),
        translatedText
      );
    }
  });
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;

  async function runOne() {
    while (index < items.length) {
      const currentIndex = index;
      index++;

      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => runOne()
  );

  await Promise.all(workers);

  return results;
}

export async function translatePage(targetLang) {
  const runId = ++currentTranslateRun;

  document.documentElement.lang = targetLang;
  localStorage.setItem("voltlab:lang", targetLang);

  if (targetLang === "ro") {
    restoreRomanian();
    return;
  }

  const nodes = getTextNodes(document.body);

  const uniqueTexts = [
    ...new Set(nodes.map((node) => rememberOriginalText(node))),
  ].filter(Boolean);

  const uncachedTexts = [];

  // 1. Aplicăm instant tot ce e deja în cache
  for (const text of uniqueTexts) {
    const cached = getCachedTranslation(targetLang, text);

    if (cached) {
      applyTranslationToNodes(nodes, text, cached);
    } else {
      uncachedTexts.push(text);
    }
  }

  // Dacă totul era deja în cache, termină imediat
  if (uncachedTexts.length === 0) return;

  // 2. Traducem doar ce lipsește, în paralel
  await runWithConcurrency(uncachedTexts, 6, async (text) => {
    if (runId !== currentTranslateRun) return;

    try {
      const translated = await translateText(text, targetLang);

      if (runId !== currentTranslateRun) return;

      applyTranslationToNodes(nodes, text, translated);
    } catch {
      // dacă un text pică, îl lăsăm în română
    }
  });
}

export function getSavedLanguage() {
  return localStorage.getItem("voltlab:lang") || "ro";
}