import { Deck } from "../../../types/deck";

const escapeCsv = (value: string): string => {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
};

export const createDeckCsv = (deck: Deck): string => {
  const header = ["term", "answer"].join(",");
  const rows = deck.cards.map((card) =>
    [escapeCsv(card.term), escapeCsv(card.answer)].join(","),
  );

  return [header, ...rows].join("\n");
};

export const downloadDeckCsv = (deck: Deck): void => {
  const csv = createDeckCsv(deck);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${deck.name.trim().replace(/\s+/g, "_") || "deck"}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
