import { Language, Vocabulary } from "./practice";
import { answersMatch } from "./question-bank";

export const wordCategories = ["First words", "Food & drink", "Getting around", "Everyday essentials", "People", "Useful verbs"] as const;
export type WordCategory = (typeof wordCategories)[number];
export type BeginnerWord = Vocabulary & { language: Language; accepted: string[] };
// German nouns are learned with their article. Bare nouns also count as correct.
// Pinyin uses the same tone-insensitive comparison as sentence practice.
const data: Record<WordCategory, [english: string, german: string, pinyin: string][]> = {
  "First words": [
    ["hello", "hallo", "nǐ hǎo"], ["thank you", "danke", "xièxie"],
    ["please", "bitte", "qǐng"], ["goodbye", "auf Wiedersehen", "zàijiàn"],
    ["today", "heute", "jīntiān"], ["tomorrow", "morgen", "míngtiān"],
    ["here", "hier", "zhèlǐ"], ["now", "jetzt", "xiànzài"],
  ],
  "Food & drink": [
    ["water", "das Wasser", "shuǐ"], ["coffee", "der Kaffee", "kāfēi"],
    ["tea", "der Tee", "chá"], ["bread", "das Brot", "miànbāo"],
    ["milk", "die Milch", "niúnǎi"], ["rice", "der Reis", "mǐfàn"],
    ["apple", "der Apfel", "píngguǒ"], ["bill", "die Rechnung", "zhàngdān"],
  ],
  "Getting around": [
    ["train", "der Zug", "huǒchē"], ["bus", "der Bus", "gōngjiāochē"],
    ["ticket", "die Fahrkarte", "chēpiào"], ["station", "der Bahnhof", "huǒchēzhàn"],
    ["hotel", "das Hotel", "jiǔdiàn"], ["left", "links", "zuǒbiān"],
    ["right", "rechts", "yòubiān"], ["toilet", "die Toilette", "cèsuǒ"],
  ],
  "Everyday essentials": [
    ["help", "die Hilfe", "bāngzhù"], ["doctor", "der Arzt", "yīshēng"],
    ["phone", "das Handy", "shǒujī"], ["key", "der Schlüssel", "yàoshi"],
    ["money", "das Geld", "qián"], ["time", "die Zeit", "shíjiān"],
    ["home", "das Zuhause", "jiā"], ["work", "die Arbeit", "gōngzuò"],
  ],
  "People": [
    ["I", "ich", "wǒ"], ["you (informal, singular)", "du", "nǐ"],
    ["we", "wir", "wǒmen"], ["friend (male)", "der Freund", "péngyou"],
    ["family", "die Familie", "jiārén"], ["mother", "die Mutter", "māma"],
    ["father", "der Vater", "bàba"], ["child", "das Kind", "háizi"],
  ],
  "Useful verbs": [
    ["to eat", "essen", "chī"], ["to drink", "trinken", "hē"],
    ["to buy", "kaufen", "mǎi"], ["to go", "gehen", "qù"],
    ["to come", "kommen", "lái"], ["to learn", "lernen", "xuéxí"],
    ["to understand", "verstehen", "lǐjiě"], ["to need", "brauchen", "xūyào"],
  ],
};

export function beginnerWords(language: Language, category: WordCategory): BeginnerWord[] {
  return data[category].map(([english, german, pinyin]) => {
    const target = language === "german" ? german : pinyin;
    return { english, german: target, language, accepted: language === "german"
      ? [target, target.replace(/^(der|die|das) /, "")] : [target] };
  });
}

export function wordProgressKey(word: BeginnerWord): string {
  return JSON.stringify(["words", word.language, word.english, word.german]);
}

export function matchesWord(word: BeginnerWord, answer: string): boolean {
  return word.accepted.some(model => answersMatch(answer, model, word.language));
}
