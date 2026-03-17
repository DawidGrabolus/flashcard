export type ImportedFlashCard = {
  term: string;
  answer: string;
};

const SUPPORTED_EXTENSIONS = ["csv", "tsv", "txt"];

const splitCsvLine = (line: string, separator: string): string[] => {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];

    if (character === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === separator && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
};

const detectSeparator = (line: string): string => {
  const commaCount = line.split(",").length;
  const semicolonCount = line.split(";").length;
  const tabCount = line.split("\t").length;

  if (tabCount >= commaCount && tabCount >= semicolonCount) {
    return "\t";
  }

  if (semicolonCount > commaCount) {
    return ";";
  }

  return ",";
};

const hasHeader = (firstRow: string[]): boolean => {
  const normalized = firstRow.map((cell) => cell.toLowerCase().trim());
  const termNames = ["term", "question", "front", "hasło", "pojęcie"];
  const answerNames = ["answer", "definition", "back", "odpowiedź", "definicja"];

  const hasTerm = termNames.some((name) => normalized[0]?.includes(name));
  const hasAnswer = answerNames.some((name) => normalized[1]?.includes(name));

  return hasTerm || hasAnswer;
};

export const parseFlashCardsFile = async (
  file: File,
): Promise<ImportedFlashCard[]> => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error("Obsługiwane są tylko pliki CSV, TSV lub TXT.");
  }

  const fileContent = await file.text();
  const lines = fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("Plik jest pusty.");
  }

  const separator = detectSeparator(lines[0]);
  const rows = lines.map((line) => splitCsvLine(line, separator));
  const rowsWithoutHeader = hasHeader(rows[0]) ? rows.slice(1) : rows;

  const cards = rowsWithoutHeader
    .map((row) => ({
      term: row[0]?.trim() ?? "",
      answer: row[1]?.trim() ?? "",
    }))
    .filter((row) => row.term || row.answer);

  if (cards.length === 0) {
    throw new Error(
      "Nie znaleziono fiszek. Upewnij się, że plik ma dwie kolumny: pytanie i odpowiedź.",
    );
  }

  return cards;
};
