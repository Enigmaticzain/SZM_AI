/**
 * Data Validation and Quality Assessment System
 * Validates training data for quality, uniqueness, and readability
 */

export interface ValidationIssue {
  type: 'warning' | 'error';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DataQualityMetrics {
  contentLength: number;
  wordCount: number;
  sentenceCount: number;
  uniqueWords: number;
  readabilityScore: number; // 0-100, higher = more readable
  contentDiversity: number; // 0-100, measure of vocabulary richness
  issues: ValidationIssue[];
  overallScore: number; // 0-100
  readiness: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number; // 0-100
  matchedDocumentId?: string;
  matchedDocumentName?: string;
}

/**
 * Validate file format and MIME type
 */
export function validateFileFormat(file: File): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const validTypes = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/json',
    'text/csv',
    'text/xml',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
  ];

  if (!validTypes.includes(file.type) && !file.name.match(/\.(txt|md|pdf|json|csv|xml|jpg|jpeg|png|webp|mp4|webm|mp3|wav)$/i)) {
    issues.push({
      type: 'warning',
      message: `Unknown file format: ${file.type || file.name}. Supported: TXT, MD, PDF, JSON, CSV, XML, images, video, audio`,
      severity: 'medium',
    });
  }

  if (file.size === 0) {
    issues.push({
      type: 'error',
      message: 'File is empty',
      severity: 'high',
    });
  }

  // Size warnings
  if (file.size > 100 * 1024 * 1024) {
    issues.push({
      type: 'warning',
      message: `File is very large (${(file.size / 1024 / 1024).toFixed(1)}MB). Processing may be slow.`,
      severity: 'medium',
    });
  }

  return issues;
}

/**
 * Calculate readability score based on Flesch Reading Ease formula
 * Higher score = easier to read
 */
export function calculateReadabilityScore(text: string): number {
  if (!text || text.length < 100) return 0;

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const syllables = countSyllables(text);

  // Flesch Reading Ease
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  // Normalize to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Estimate syllable count (simplified)
 */
function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllables = 0;

  words.forEach(word => {
    syllables += estimateWordSyllables(word);
  });

  return Math.max(1, syllables);
}

function estimateWordSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length < 3) return 1;

  let count = 0;
  let vowels = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = 'aeiouy'.includes(word[i]);
    if (isVowel && !vowels) {
      count++;
    }
    vowels = isVowel;
  }

  if (word.endsWith('e')) count--;
  if (word.endsWith('le') && word.length > 2) count++;

  return Math.max(1, count);
}

/**
 * Calculate content diversity (vocabulary richness)
 * Based on Type-Token Ratio (TTR)
 */
export function calculateContentDiversity(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;

  const uniqueWords = new Set(words).size;
  const ttr = uniqueWords / words.length; // 0-1

  // Adjust for text length (longer texts naturally have lower TTR)
  const lengthAdjustment = Math.min(1, words.length / 1000);
  const score = (ttr * lengthAdjustment + (1 - lengthAdjustment) * 0.6) * 100;

  return Math.round(score);
}

/**
 * Detect duplicate or near-duplicate content using Levenshtein distance
 */
export function checkDuplicateContent(
  text: string,
  existingTexts: Array<{ id: string; content: string; name: string }>
): DuplicateCheckResult {
  if (existingTexts.length === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  const normalizedText = normalizeText(text);
  let maxSimilarity = 0;
  let bestMatch: (typeof existingTexts)[0] | null = null;

  existingTexts.forEach(existing => {
    const normalizedExisting = normalizeText(existing.content);
    const similarity = calculateSimilarity(normalizedText, normalizedExisting);

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = existing;
    }
  });

  return {
    isDuplicate: maxSimilarity > 85,
    similarity: maxSimilarity,
    matchedDocumentId: bestMatch?.id,
    matchedDocumentName: bestMatch?.name,
  };
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0)
    .join(' ');
}

/**
 * Calculate similarity between two texts (0-100)
 * Using Levenshtein distance
 */
function calculateSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 100;

  const maxLen = Math.max(text1.length, text2.length);
  if (maxLen === 0) return 100;

  const distance = levenshteinDistance(text1, text2);
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len2][len1];
}

/**
 * Comprehensive data quality assessment
 */
export function assessDataQuality(text: string, fileName?: string): DataQualityMetrics {
  const issues: ValidationIssue[] = [];
  const contentLength = text.length;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const uniqueWords = new Set(
    text.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  ).size;

  // Validation checks
  if (contentLength < 50) {
    issues.push({
      type: 'warning',
      message: 'Content is very short. Minimum 50 characters recommended.',
      severity: 'medium',
    });
  }

  if (wordCount < 10) {
    issues.push({
      type: 'warning',
      message: 'Content has fewer than 10 words. More content recommended.',
      severity: 'medium',
    });
  }

  if (uniqueWords / wordCount < 0.3) {
    issues.push({
      type: 'warning',
      message: 'Low vocabulary diversity. Content may be repetitive.',
      severity: 'low',
    });
  }

  // Check for common formatting issues
  if (text.includes('\x00')) {
    issues.push({
      type: 'error',
      message: 'File contains null bytes. May be corrupted.',
      severity: 'high',
    });
  }

  // Calculate scores
  const readabilityScore = calculateReadabilityScore(text);
  const contentDiversity = calculateContentDiversity(text);

  // Overall score calculation
  let overallScore = (readabilityScore * 0.4 + contentDiversity * 0.3 + Math.min(100, (wordCount / 100) * 100) * 0.3);
  overallScore = Math.round(overallScore);

  let readiness: 'poor' | 'fair' | 'good' | 'excellent';
  if (overallScore >= 80) readiness = 'excellent';
  else if (overallScore >= 60) readiness = 'good';
  else if (overallScore >= 40) readiness = 'fair';
  else readiness = 'poor';

  return {
    contentLength,
    wordCount,
    sentenceCount,
    uniqueWords,
    readabilityScore,
    contentDiversity,
    issues,
    overallScore,
    readiness,
  };
}

/**
 * Get recommendations based on quality metrics
 */
export function getQualityRecommendations(metrics: DataQualityMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.overallScore < 50) {
    recommendations.push('Consider reviewing content quality - score is below 50%');
  }

  if (metrics.readabilityScore < 30) {
    recommendations.push('Content is difficult to read. Use simpler sentences and vocabulary.');
  }

  if (metrics.contentDiversity < 40) {
    recommendations.push('Add more variety to vocabulary and content.');
  }

  if (metrics.wordCount < 50) {
    recommendations.push('Add more content for better training results.');
  }

  if (metrics.issues.length > 0) {
    recommendations.push(`Fix ${metrics.issues.length} validation issue(s) first`);
  }

  if (recommendations.length === 0) {
    recommendations.push('✓ Content quality looks good. Ready for training!');
  }

  return recommendations;
}
