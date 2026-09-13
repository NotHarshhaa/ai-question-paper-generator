import { ProcessedSyllabus } from "../types";

export interface ParsedSyllabusResult {
  units: ProcessedSyllabus[];
  topics: string[];
  keywords: string[];
}

export function parseSyllabus(syllabusText: string): ParsedSyllabusResult {
  if (!syllabusText || syllabusText.trim().length === 0) {
    return { units: [], topics: [], keywords: [] };
  }

  // Step 1: Flexible Unit / Module / Chapter Detection
  const unitPatterns = [
    /\b(?:Unit|Module|Chapter|Section|Part)\s*[-\s:]*([IVXLivxl]+|\d+)\b[^\n]*/gi,
    /\b(?:Unit|Module|Chapter|Section|Part)\s+(\d+)\b[^\n]*/gi,
  ];

  const units: ProcessedSyllabus[] = [];
  const unitMatches: Array<{ match: string; index: number; number: number }> = [];

  unitPatterns.forEach((pattern) => {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(syllabusText)) !== null) {
      const fullMatch = match[0];
      const matchIndex = match.index;
      let unitIdentifier = match[1].toLowerCase().trim();

      // Normalize common typo substitutions
      if (unitIdentifier === "ll") unitIdentifier = "ii";
      if (unitIdentifier === "l") unitIdentifier = "i";
      if (unitIdentifier === "v") unitIdentifier = "v";

      let unitNumber: number;
      const romanMap: Record<string, number> = {
        i: 1, ii: 2, iii: 3, iv: 4, v: 5,
        vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
      };

      if (unitIdentifier in romanMap) {
        unitNumber = romanMap[unitIdentifier];
      } else {
        unitNumber = parseInt(unitIdentifier, 10) || 1;
      }

      unitMatches.push({
        match: fullMatch.trim(),
        index: matchIndex,
        number: unitNumber,
      });
    }
  });

  // Sort matches by position and deduplicate by unit number
  unitMatches.sort((a, b) => a.index - b.index);
  const uniqueMatches = unitMatches.filter(
    (match, index, self) => index === self.findIndex((m) => m.number === match.number)
  );

  // If units found, create them
  if (uniqueMatches.length > 0) {
    uniqueMatches.forEach((unitMatch) => {
      units.push({
        number: unitMatch.number,
        title: unitMatch.match,
        topics: [],
      });
    });

    // Extract topics per unit slice
    uniqueMatches.forEach((unitMatch, unitIndex) => {
      const nextUnit = uniqueMatches[unitIndex + 1];
      const unitStartIndex = unitMatch.index + unitMatch.match.length;
      const unitEndIndex = nextUnit ? nextUnit.index : syllabusText.length;

      if (unitStartIndex !== -1 && unitEndIndex > unitStartIndex) {
        const unitContent = syllabusText.substring(unitStartIndex, unitEndIndex);
        const extracted = extractTopicsFromContent(unitContent);
        const unitObj = units.find((u) => u.number === unitMatch.number);
        if (unitObj) {
          unitObj.topics = extracted;
        }
      }
    });
  } else {
    // No explicit Unit headers: create a single default Unit and extract all topics
    const extracted = extractTopicsFromContent(syllabusText);
    units.push({
      number: 1,
      title: "Unit 1: Core Syllabus",
      topics: extracted,
    });
  }

  // Step 2: Technical keyword extraction
  const keywords: string[] = [];
  const technicalTerms = syllabusText.match(/\b[A-Z][A-Za-z0-9_\-]{2,}(?:\s+[A-Z][A-Za-z0-9_\-]+)*\b/g) || [];
  const stopwords = new Set([
    "The", "And", "Or", "But", "For", "With", "This", "That", "From", "They", "Have",
    "Been", "Unit", "Module", "Chapter", "Section", "Part", "Syllabus", "Course", "Hours"
  ]);

  technicalTerms.forEach((term: string) => {
    const trimmed = term.trim();
    if (!stopwords.has(trimmed) && trimmed.length > 3 && !keywords.includes(trimmed)) {
      keywords.push(trimmed);
    }
  });

  const allTopics = units.flatMap((u) => u.topics);

  return {
    units,
    topics: allTopics,
    keywords: keywords.slice(0, 25),
  };
}

/**
 * Flexible topic extractor that handles:
 * 1. Bullets (-, •, *, –, —)
 * 2. Numbered lists (1., 1), (a), i.)
 * 3. Comma-separated lists (e.g. AWS VPC, EC2, S3, IAM)
 * 4. Semicolon-separated lists
 * 5. Sentence and paragraph phrasing
 */
export function extractTopicsFromContent(content: string): string[] {
  const cleanContent = content.trim();
  if (!cleanContent) return [];

  const topics: string[] = [];

  // Pattern 1: Explicit bullet points or numbered lists
  const lines = cleanContent.split("\n");
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Matches bullet points: -, •, *, –, —, or numbers: 1., 1), a., (i)
    const bulletMatch = trimmed.match(/^(?:[-•–—*]|\d+[\.\)]|\([a-zA-Z0-9]+\))\s*(.+)/);
    if (bulletMatch && bulletMatch[1]) {
      const topicText = bulletMatch[1].trim();
      // If the bullet item itself contains comma-separated sub-topics, split them
      if (topicText.includes(",") && topicText.split(",").length >= 3) {
        topicText.split(",").forEach((sub) => {
          const s = cleanTopic(sub);
          if (s) topics.push(s);
        });
      } else {
        const cleaned = cleanTopic(topicText);
        if (cleaned) topics.push(cleaned);
      }
    }
  });

  if (topics.length >= 2) {
    return deduplicateTopics(topics);
  }

  // Pattern 2: Comma or Semicolon separated lists
  // e.g. "VPC, Subnets, Route Tables, Internet Gateways, NAT Gateways, Security Groups"
  const delimiter = cleanContent.includes(";") ? ";" : ",";
  if (cleanContent.includes(delimiter)) {
    const segments = cleanContent.split(delimiter);
    if (segments.length >= 3) {
      segments.forEach((seg) => {
        const cleaned = cleanTopic(seg);
        if (cleaned) topics.push(cleaned);
      });
      if (topics.length >= 3) {
        return deduplicateTopics(topics);
      }
    }
  }

  // Pattern 3: Natural language paragraphs (split by period / colon)
  const sentences = cleanContent.split(/[\.\:\n]+/);
  sentences.forEach((s) => {
    const cleaned = cleanTopic(s);
    if (cleaned && cleaned.length >= 5 && cleaned.length <= 80) {
      topics.push(cleaned);
    }
  });

  return deduplicateTopics(topics);
}

function cleanTopic(text: string): string | null {
  let cleaned = text.trim();
  // Strip leading numbering or bullets
  cleaned = cleaned.replace(/^(?:[-•–—*]|\d+[\.\)]|\([a-zA-Z0-9]+\))\s*/, "");
  // Strip trailing punctuation
  cleaned = cleaned.replace(/[\.\,\;\:]+$/, "").trim();

  // Exclude common noise or headers
  const noisePhrases = [
    "introduction", "overview", "hours", "marks", "credits", "lecture",
    "prerequisites", "learning outcomes", "reference books", "textbooks",
    "unit", "module", "chapter"
  ];

  if (
    cleaned.length < 3 ||
    cleaned.length > 100 ||
    noisePhrases.includes(cleaned.toLowerCase()) ||
    /^\d+$/.test(cleaned)
  ) {
    return null;
  }

  return cleaned;
}

function deduplicateTopics(topics: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  topics.forEach((t) => {
    const key = t.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(t);
    }
  });
  return result;
}
