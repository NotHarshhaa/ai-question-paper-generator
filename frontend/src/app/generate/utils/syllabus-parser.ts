import { ProcessedSyllabus } from "../types";

export interface ParsedSyllabusResult {
  units: ProcessedSyllabus[];
  topics: string[];
  keywords: string[];
}

export function parseSyllabus(syllabusText: string): ParsedSyllabusResult {
  // Step 1: Unit Detection - Support multiple formats including typos
  const unitPatterns = [
    /Unit\s*[-\s]*([IVXL]+|[ivxl]+|[IVXLivxl]+)/gi, // Unit-I, Unit II, unit-iii, etc.
    /Unit\s*[-\s]*(\d+)/gi, // Unit-1, Unit 2, etc.
    /\bUnit[-\s]*([IVXL]+|[ivxl]+|\d+)\b/gi, // More flexible unit detection
  ];

  const units: ProcessedSyllabus[] = [];
  const unitMatches: Array<{ match: string; index: number; number: number }> = [];

  // First pass: Find all unit matches with their positions
  unitPatterns.forEach((pattern) => {
    let match;
    // Reset regex lastIndex to ensure we catch all matches from the beginning of the string
    pattern.lastIndex = 0;
    while ((match = pattern.exec(syllabusText)) !== null) {
      const fullMatch = match[0];
      const matchIndex = match.index;

      let unitIdentifier = match[1].toLowerCase(); // Convert to lowercase for easier handling

      // Fix common typos: ll -> ii, etc.
      if (unitIdentifier === "ll") unitIdentifier = "ii";
      if (unitIdentifier === "l") unitIdentifier = "i";
      if (unitIdentifier === "v") unitIdentifier = "v";

      let unitNumber: number;

      // Convert Roman numerals to numbers
      if (/^[ivxl]+$/.test(unitIdentifier)) {
        const romanMap: { [key: string]: number } = {
          i: 1,
          ii: 2,
          iii: 3,
          iv: 4,
          v: 5,
          vi: 6,
          vii: 7,
          viii: 8,
          ix: 9,
          x: 10,
          I: 1,
          II: 2,
          III: 3,
          IV: 4,
          V: 5,
          VI: 6,
          VII: 7,
          VIII: 8,
          IX: 9,
          X: 10,
        };
        unitNumber = romanMap[unitIdentifier] || 1;
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

  // Sort matches by position and remove duplicates
  unitMatches.sort((a, b) => a.index - b.index);
  const uniqueMatches = unitMatches.filter(
    (match, index, self) => index === self.findIndex((m) => m.number === match.number)
  );

  // Create units from unique matches
  uniqueMatches.forEach((unitMatch) => {
    units.push({
      number: unitMatch.number,
      title: unitMatch.match,
      topics: [],
    });
  });

  // If no units detected, create a default unit
  if (units.length === 0 && syllabusText.trim().length > 10) {
    units.push({
      number: 1,
      title: "Unit 1",
      topics: [],
    });
  }

  // Step 2: Topic Extraction using proper unit boundaries
  uniqueMatches.forEach((unitMatch, unitIndex) => {
    const nextUnit = uniqueMatches[unitIndex + 1];
    const unitStartIndex = unitMatch.index + unitMatch.match.length;
    const unitEndIndex = nextUnit ? nextUnit.index : syllabusText.length;

    if (unitStartIndex !== -1 && unitEndIndex > unitStartIndex) {
      const unitContent = syllabusText.substring(unitStartIndex, unitEndIndex);

      // Extract topics from this unit's content
      // Look for lines starting with bullet points or hyphens
      const lines = unitContent.split("\n");
      const topics: string[] = [];

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        // Match bullet points or hyphens at the start of a line
        if (trimmedLine.match(/^[-•–—*]\s*.+/) || trimmedLine.match(/^•\s*.+/)) {
          const topic = trimmedLine.replace(/^[-•–—*]\s*/, "").trim();
          if (topic.length > 0) {
            topics.push(topic);
          }
        }
      });

      // Find the corresponding unit in the units array and update its topics
      const unitToUpdate = units.find((u) => u.number === unitMatch.number);
      if (unitToUpdate) {
        unitToUpdate.topics = topics;
      }
    }
  });

  // Step 3: Extract keywords
  const keywords: string[] = [];
  const technicalTerms = syllabusText.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
  const commonWords = ["The", "And", "Or", "But", "For", "With", "This", "That", "From", "They", "Have", "Been"];

  technicalTerms.forEach((term: string) => {
    if (!commonWords.includes(term) && term.length > 3) {
      keywords.push(term);
    }
  });

  return {
    units,
    topics: units.flatMap((unit) => unit.topics),
    keywords: keywords.slice(0, 20), // Limit to top 20 keywords
  };
}
