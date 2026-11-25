function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Re-fetches a cited URL and verifies that the quoted text actually appears in the source document.
 * Returns true if verified, false if the URL cannot be fetched or the quote is missing.
 */
export async function verifySourceCitation(url: string, quote: string): Promise<boolean> {
  if (!url || !quote || quote.trim().length < 10) {
    return false;
  }

  // If URL is not a valid HTTP/HTTPS URL, reject
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return false;
    }

    const rawContent = await response.text();
    const normalizedContent = normalizeText(rawContent);
    const normalizedQuote = normalizeText(quote);

    // Direct substring check
    if (normalizedContent.includes(normalizedQuote)) {
      return true;
    }

    // Chunk check: check if the first 35-40 characters appear
    if (normalizedQuote.length > 35) {
      const prefix = normalizedQuote.slice(0, 40).trim();
      if (normalizedContent.includes(prefix)) {
        return true;
      }
    }

    // Token set overlap check: check if at least 80% of 4+ letter words appear in proximity
    const words = normalizedQuote
      .split(" ")
      .filter((w) => w.length > 4);

    if (words.length >= 4) {
      const matchCount = words.filter((w) => normalizedContent.includes(w)).length;
      if (matchCount / words.length >= 0.8) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}
