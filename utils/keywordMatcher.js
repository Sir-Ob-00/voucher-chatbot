/**
 * utils/keywordMatcher.js
 * Scores FAQ entries against a user query using keyword overlap.
 */

/**
 * Normalizes a string: lowercase, strip punctuation, trim.
 * @param {string} text
 * @returns {string}
 */
const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

/**
 * Tokenizes a normalized string into words.
 * @param {string} text
 * @returns {string[]}
 */
const tokenize = (text) => text.split(/\s+/).filter(Boolean);

/**
 * Finds the best matching FAQ entry for a given user message.
 * @param {string} userMessage
 * @param {Array} faqData
 * @param {number} [threshold=1]
 * @returns {{ match: object|null, score: number }}
 */
const findBestMatch = (userMessage, faqData, threshold = 1) => {
  const normalizedMessage = normalize(userMessage);
  const messageTokens = tokenize(normalizedMessage);

  let bestMatch = null;
  let highestScore = 0;

  for (const faq of faqData) {
    let score = 0;

    for (const keyword of faq.keywords) {
      const normalizedKeyword = normalize(keyword);

      // Exact phrase match (weighted higher)
      if (normalizedMessage.includes(normalizedKeyword)) {
        score += 2;
        continue;
      }

      // Partial token match
      const keywordTokens = tokenize(normalizedKeyword);
      const overlap = keywordTokens.filter((kt) => messageTokens.includes(kt));
      score += overlap.length;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  return {
    match: highestScore >= threshold ? bestMatch : null,
    score: highestScore,
  };
};

export { findBestMatch, normalize, tokenize };