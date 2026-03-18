import cover1 from "../../../assets/cover1.png";
import cover2 from "../../../assets/cover2.png";
import cover3 from "../../../assets/cover3.png";
import cover4 from "../../../assets/cover4.png";
import cover5 from "../../../assets/cover5.png";
import cover6 from "../../../assets/cover6.png";

export const COVER_KEYS = [
  "cover1",
  "cover2",
  "cover3",
  "cover4",
  "cover5",
  "cover6",
] as const;

export type CoverKey = (typeof COVER_KEYS)[number];

const COVER_MAP: Record<CoverKey, string> = {
  cover1,
  cover2,
  cover3,
  cover4,
  cover5,
  cover6,
};

export const getRandomCoverKey = (): CoverKey => {
  const randomIndex = Math.floor(Math.random() * COVER_KEYS.length);
  return COVER_KEYS[randomIndex];
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getCoverByKey = (
  coverKey?: string | null,
  deckId?: string,
): string => {
  if (coverKey && coverKey in COVER_MAP) {
    return COVER_MAP[coverKey as CoverKey];
  }

  if (deckId) {
    const fallbackIndex = hashString(deckId) % COVER_KEYS.length;
    return COVER_MAP[COVER_KEYS[fallbackIndex]];
  }

  return COVER_MAP.cover1;
};
