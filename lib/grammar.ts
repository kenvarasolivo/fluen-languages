/**
 * Static grammar reference for each language FLUEN teaches — the "how the
 * language fits together" companion to the vocabulary in Foundations.
 *
 * Content only: a flat list of topics per language, each grouped under a
 * category so the Grammar view can section them. Kept free of any client
 * directive so it can be imported anywhere. Examples carry the native
 * script in `target`; Mandarin adds the typeable Pinyin in `roman` (matching
 * how the rest of the app shows Hanzi over Pinyin).
 */

export interface GrammarExample {
  /** The sentence in the target language (native script). */
  target: string;
  /** Romanization (Pinyin) for non-Latin scripts. */
  roman?: string;
  /** English translation. */
  en: string;
  /** Optional one-line pointer to what the example is showing. */
  note?: string;
}

export interface GrammarTopic {
  /** Stable slug, unique within a language. */
  id: string;
  /** Grouping label, e.g. "Word order". */
  category: string;
  /** Short title, e.g. "The verb comes second". */
  title: string;
  /** One-line summary shown under the title. */
  summary: string;
  /** Explanation paragraphs. */
  body: string[];
  /** Worked examples. */
  examples: GrammarExample[];
}

// ------------------------------------------------------------------
// German
// ------------------------------------------------------------------

const GERMAN: GrammarTopic[] = [
  {
    id: "de-v2",
    category: "Word order",
    title: "The verb comes second",
    summary:
      "In a main clause the conjugated verb is always the second element — but not always the second word.",
    body: [
      "German main clauses follow the “verb-second” (V2) rule: exactly one element sits before the conjugated verb, and the verb comes right after it. That first slot can be the subject, a time expression, a place, or an object — whatever you want to emphasise.",
      "When something other than the subject takes the first slot, the subject jumps to just after the verb. The verb never moves — it stays welded to position two.",
    ],
    examples: [
      {
        target: "Ich trinke morgens Kaffee.",
        en: "I drink coffee in the mornings.",
        note: "Subject first — the ordinary order.",
      },
      {
        target: "Morgens trinke ich Kaffee.",
        en: "In the mornings I drink coffee.",
        note: "Time first → verb still second, subject follows it.",
      },
      {
        target: "Kaffee trinke ich morgens.",
        en: "Coffee, I drink in the mornings.",
        note: "Object first for emphasis — verb stays put.",
      },
    ],
  },
  {
    id: "de-subordinate",
    category: "Word order",
    title: "Verb goes last in subordinate clauses",
    summary:
      "After words like weil, dass, wenn or ob, the conjugated verb is kicked to the very end.",
    body: [
      "Subordinating conjunctions (weil ‘because’, dass ‘that’, wenn ‘if/when’, ob ‘whether’, obwohl ‘although’ …) flip the order: the conjugated verb moves to the end of that clause.",
      "If the main and subordinate clauses are joined by a comma, you often get two verbs meeting in the middle — one ending the subordinate clause, one carrying the main clause.",
    ],
    examples: [
      {
        target: "Ich bleibe zu Hause, weil ich krank bin.",
        en: "I'm staying home because I am sick.",
        note: "bin lands at the very end after weil.",
      },
      {
        target: "Er sagt, dass er morgen kommt.",
        en: "He says that he is coming tomorrow.",
        note: "kommt is pushed to the end after dass.",
      },
    ],
  },
  {
    id: "de-separable",
    category: "Verbs",
    title: "Separable verbs split apart",
    summary:
      "Verbs like aufstehen or einkaufen break in two — the prefix flies to the end of the clause.",
    body: [
      "Many German verbs carry a stressed prefix (auf-, ein-, an-, mit-, zurück- …). In a main clause the prefix detaches from the stem and moves to the end, while the conjugated stem stays in verb-second position.",
      "The prefix rejoins the stem in the infinitive and when the verb is pushed to the end (e.g. in a subordinate clause or after a modal).",
    ],
    examples: [
      {
        target: "Ich stehe um sieben Uhr auf.",
        en: "I get up at seven o'clock.",
        note: "aufstehen → stehe … auf.",
      },
      {
        target: "Wir kaufen am Samstag ein.",
        en: "We go shopping on Saturday.",
        note: "einkaufen → kaufen … ein.",
      },
      {
        target: "Ich weiß, dass er früh aufsteht.",
        en: "I know that he gets up early.",
        note: "In a subordinate clause the prefix stays attached.",
      },
    ],
  },
  {
    id: "de-modals",
    category: "Verbs",
    title: "Modal verbs send the main verb to the end",
    summary:
      "können, müssen, wollen … take the second slot; the main verb waits at the end as an infinitive.",
    body: [
      "With a modal verb (können ‘can’, müssen ‘must’, wollen ‘want’, sollen, dürfen, mögen), the modal is conjugated and sits in position two. The actual action verb goes to the end of the clause in its plain infinitive form.",
      "This “bracket” — modal near the front, infinitive at the back — is one of the most characteristic shapes of a German sentence.",
    ],
    examples: [
      {
        target: "Ich muss heute arbeiten.",
        en: "I have to work today.",
        note: "muss second, arbeiten last.",
      },
      {
        target: "Kannst du mir helfen?",
        en: "Can you help me?",
        note: "Modal first in a yes/no question, infinitive at the end.",
      },
    ],
  },
  {
    id: "de-perfect",
    category: "Verbs",
    title: "The perfect tense: haben/sein + participle",
    summary:
      "Everyday past tense uses a helper verb in slot two and the past participle at the end.",
    body: [
      "For talking about the past in speech, German uses the perfect: a form of haben (or sein for motion/change verbs) in verb-second position, plus the past participle at the very end.",
      "Regular participles look like ge-…-t (gemacht), strong verbs often ge-…-en (gegangen). Verbs of movement and change of state take sein.",
    ],
    examples: [
      {
        target: "Ich habe einen Film gesehen.",
        en: "I watched a film.",
        note: "habe second, gesehen last.",
      },
      {
        target: "Wir sind nach Berlin gefahren.",
        en: "We drove to Berlin.",
        note: "Motion verb → sein, not haben.",
      },
    ],
  },
  {
    id: "de-gender",
    category: "Nouns & articles",
    title: "Every noun has a gender",
    summary:
      "der (masculine), die (feminine) or das (neuter) — learn each noun with its article.",
    body: [
      "German nouns are masculine, feminine or neuter, marked by the article der/die/das. Gender is often not predictable from meaning, so the safest habit is to memorise each noun together with its article.",
      "All nouns are capitalised, always — der Tisch, die Lampe, das Buch. In the plural, the definite article is die for every gender.",
    ],
    examples: [
      {
        target: "der Tisch, die Lampe, das Buch",
        en: "the table, the lamp, the book",
        note: "Three genders, three articles.",
      },
      {
        target: "die Tische, die Lampen, die Bücher",
        en: "the tables, the lamps, the books",
        note: "Plural article is die for all.",
      },
    ],
  },
  {
    id: "de-cases",
    category: "Nouns & articles",
    title: "The four cases",
    summary:
      "Nominative, accusative, dative and genitive change the articles around a noun.",
    body: [
      "German marks a noun's role in the sentence with case rather than word order. The subject is nominative, the direct object accusative, the indirect object dative, and possession genitive.",
      "The masculine article shows this most clearly: der → den (accusative) → dem (dative) → des (genitive). Feminine and neuter shift too, mainly in the dative and genitive.",
    ],
    examples: [
      {
        target: "Der Mann sieht den Hund.",
        en: "The man sees the dog.",
        note: "der (subject) vs den (object).",
      },
      {
        target: "Ich gebe dem Kind einen Apfel.",
        en: "I give the child an apple.",
        note: "dem = dative (indirect), einen = accusative (direct).",
      },
    ],
  },
];

// ------------------------------------------------------------------
// Spanish
// ------------------------------------------------------------------

const SPANISH: GrammarTopic[] = [
  {
    id: "es-ser-estar",
    category: "Verbs",
    title: "Ser vs. estar — two verbs for “to be”",
    summary:
      "Ser is for identity and permanent traits; estar is for states, feelings and location.",
    body: [
      "Spanish splits “to be” into two verbs. Use ser for essential, defining things: who or what something is, origin, profession, time and inherent characteristics.",
      "Use estar for conditions that can change: how you feel, temporary states, and — importantly — where something is located.",
    ],
    examples: [
      {
        target: "Soy profesor.",
        en: "I am a teacher.",
        note: "ser — profession / identity.",
      },
      {
        target: "Estoy cansado.",
        en: "I am tired.",
        note: "estar — a passing state.",
      },
      {
        target: "El museo está en el centro.",
        en: "The museum is in the centre.",
        note: "estar — location, always.",
      },
    ],
  },
  {
    id: "es-word-order",
    category: "Word order",
    title: "Basic order and dropping the subject",
    summary:
      "Spanish is subject–verb–object, but the subject pronoun is usually left out.",
    body: [
      "The default order is subject–verb–object, much like English. But because the verb ending already tells you who the subject is, Spanish normally drops the subject pronoun (yo, tú, él …).",
      "You add the pronoun back only for emphasis or to remove ambiguity.",
    ],
    examples: [
      {
        target: "Hablo español.",
        en: "I speak Spanish.",
        note: "No yo needed — the -o ending says “I”.",
      },
      {
        target: "Yo pago, tú descansas.",
        en: "I'll pay, you rest.",
        note: "Pronouns added for contrast.",
      },
    ],
  },
  {
    id: "es-adjectives",
    category: "Nouns & adjectives",
    title: "Adjectives follow the noun and agree with it",
    summary:
      "Descriptive adjectives usually come after the noun and match its gender and number.",
    body: [
      "Unlike English, most Spanish adjectives come after the noun they describe. They also agree with it: the ending changes for gender (-o/-a) and number (-s/-es).",
      "A handful of common adjectives (like bueno, gran) can precede the noun and sometimes shorten, but the after-the-noun position is the reliable default.",
    ],
    examples: [
      {
        target: "una casa blanca",
        en: "a white house",
        note: "Adjective after the noun, feminine -a.",
      },
      {
        target: "los coches rojos",
        en: "the red cars",
        note: "Masculine plural → rojos.",
      },
    ],
  },
  {
    id: "es-gender-articles",
    category: "Nouns & adjectives",
    title: "Gender and articles",
    summary:
      "Nouns are masculine or feminine; the article (el/la, un/una) must match.",
    body: [
      "Every noun is masculine or feminine. Most nouns ending in -o are masculine (el libro) and most ending in -a are feminine (la mesa), but there are exceptions worth memorising.",
      "The article agrees in gender and number: el/los and la/las for “the”, un/unos and una/unas for “a/some”.",
    ],
    examples: [
      {
        target: "el libro / la mesa",
        en: "the book / the table",
        note: "-o masculine, -a feminine (usually).",
      },
      {
        target: "unos amigos / unas amigas",
        en: "some (male) friends / some (female) friends",
        note: "Indefinite article agrees too.",
      },
    ],
  },
  {
    id: "es-present",
    category: "Verbs",
    title: "Present tense: -ar, -er, -ir",
    summary:
      "Regular verbs fall into three families, each with its own set of endings.",
    body: [
      "Spanish infinitives end in -ar, -er or -ir. To conjugate a regular verb you drop that ending and add the ending for the person and family.",
      "For -ar verbs (hablar): -o, -as, -a, -amos, -áis, -an. For -er (comer): -o, -es, -e, -emos, -éis, -en. For -ir (vivir): -o, -es, -e, -imos, -ís, -en.",
    ],
    examples: [
      {
        target: "hablo, hablas, habla",
        en: "I speak, you speak, he/she speaks",
        note: "hablar (-ar family).",
      },
      {
        target: "como, comes, come",
        en: "I eat, you eat, he/she eats",
        note: "comer (-er family).",
      },
    ],
  },
  {
    id: "es-near-future",
    category: "Verbs",
    title: "The near future: ir + a + infinitive",
    summary:
      "The easiest way to talk about the future — “going to do” something.",
    body: [
      "For plans and things about to happen, Spanish uses ir (to go) conjugated in the present, plus a, plus the infinitive. It maps almost exactly onto English “going to …”.",
      "It's far more common in everyday speech than the formal future tense.",
    ],
    examples: [
      {
        target: "Voy a estudiar esta noche.",
        en: "I'm going to study tonight.",
        note: "voy + a + estudiar.",
      },
      {
        target: "Vamos a comer.",
        en: "We're going to eat. / Let's eat.",
      },
    ],
  },
  {
    id: "es-reflexive",
    category: "Verbs",
    title: "Reflexive verbs",
    summary:
      "Verbs like levantarse carry a pronoun (me, te, se …) that refers back to the subject.",
    body: [
      "Reflexive verbs describe actions you do to yourself — waking up, getting dressed, sitting down. Their infinitive ends in -se, and in use the pronoun moves in front of the conjugated verb.",
      "The pronoun changes with the subject: me, te, se, nos, os, se.",
    ],
    examples: [
      {
        target: "Me levanto a las siete.",
        en: "I get (myself) up at seven.",
        note: "levantarse → me levanto.",
      },
      {
        target: "Se llama Ana.",
        en: "Her name is Ana. (lit. she calls herself Ana)",
      },
    ],
  },
  {
    id: "es-negation-questions",
    category: "Word order",
    title: "Negation and questions",
    summary:
      "Put no before the verb to negate; wrap questions in ¿ … ?",
    body: [
      "To make a sentence negative, place no directly before the verb — nothing else moves.",
      "Questions don't need a change in word order: intonation does the work in speech, and in writing you open with an inverted ¿ and close with ?.",
    ],
    examples: [
      {
        target: "No hablo francés.",
        en: "I don't speak French.",
        note: "no sits right before the verb.",
      },
      {
        target: "¿Hablas inglés?",
        en: "Do you speak English?",
        note: "Opening ¿ marks the question.",
      },
    ],
  },
];

// ------------------------------------------------------------------
// Mandarin Chinese
// ------------------------------------------------------------------

const MANDARIN: GrammarTopic[] = [
  {
    id: "zh-svo",
    category: "Word order",
    title: "Basic order: subject–verb–object",
    summary:
      "Mandarin core order matches English, but the words themselves never change form.",
    body: [
      "The backbone of a Mandarin sentence is subject–verb–object, just like English. What's different is that nothing conjugates: verbs, nouns and adjectives keep exactly the same form no matter the tense, number or person.",
      "Meaning is carried by word order and by small particles, not by endings.",
    ],
    examples: [
      {
        target: "我喝茶。",
        roman: "Wǒ hē chá.",
        en: "I drink tea.",
        note: "Subject 我 – verb 喝 – object 茶.",
      },
      {
        target: "他吃米饭。",
        roman: "Tā chī mǐfàn.",
        en: "He eats rice.",
      },
    ],
  },
  {
    id: "zh-time-place",
    category: "Word order",
    title: "Time and place go before the verb",
    summary:
      "When something happens, and where, comes ahead of the action — not after it.",
    body: [
      "Mandarin puts time expressions and location phrases before the verb, which is the opposite of the usual English order. The pattern is: subject – (time) – (place) – verb – object.",
      "Time usually comes first, then place. Since verbs don't change for tense, a time word like 明天 (tomorrow) or 昨天 (yesterday) is often what tells you when something happens.",
    ],
    examples: [
      {
        target: "我明天去北京。",
        roman: "Wǒ míngtiān qù Běijīng.",
        en: "I'm going to Beijing tomorrow.",
        note: "Time 明天 sits before the verb 去.",
      },
      {
        target: "他在家看书。",
        roman: "Tā zài jiā kàn shū.",
        en: "He reads at home.",
        note: "Place 在家 comes before the verb 看.",
      },
    ],
  },
  {
    id: "zh-measure-words",
    category: "Nouns",
    title: "Measure words",
    summary:
      "To count nouns you need a measure word between the number and the noun.",
    body: [
      "You can't say “three book” directly in Mandarin — a measure word goes between the number (or 这/那 this/that) and the noun. The general-purpose one is 个 (gè).",
      "Many nouns take a specific measure word: 本 for books, 张 for flat things (paper, tables), 只 for many animals. When in doubt, 个 is the safe fallback.",
    ],
    examples: [
      {
        target: "三本书",
        roman: "sān běn shū",
        en: "three books",
        note: "number 三 + measure word 本 + noun 书.",
      },
      {
        target: "这个人",
        roman: "zhège rén",
        en: "this person",
        note: "这 + 个 + noun.",
      },
    ],
  },
  {
    id: "zh-de",
    category: "Particles",
    title: "的 links modifiers to nouns",
    summary:
      "The particle 的 marks possession and joins a description to the noun it describes.",
    body: [
      "的 (de) is the workhorse of noun phrases. Between a possessor and a thing, it means “'s”: 我的 = my/mine.",
      "It also attaches a longer description to a noun, a bit like “the … that …” in English: the description comes first, then 的, then the noun.",
    ],
    examples: [
      {
        target: "我的书",
        roman: "wǒ de shū",
        en: "my book",
        note: "possessor + 的 + noun.",
      },
      {
        target: "红色的车",
        roman: "hóngsè de chē",
        en: "the red car",
        note: "description 红色 + 的 + noun 车.",
      },
    ],
  },
  {
    id: "zh-le",
    category: "Particles",
    title: "了 marks a completed or changed situation",
    summary:
      "Since verbs don't conjugate, 了 signals that an action is done or a new state has begun.",
    body: [
      "了 (le) is one of the trickiest particles. After a verb it often signals a completed action; at the end of a sentence it signals that a new situation has come about.",
      "It is not simply “past tense” — it's about completion and change. Habitual or ongoing actions in the past don't use 了.",
    ],
    examples: [
      {
        target: "我吃了饭。",
        roman: "Wǒ chī le fàn.",
        en: "I have eaten. / I ate.",
        note: "Completed action.",
      },
      {
        target: "下雨了。",
        roman: "Xià yǔ le.",
        en: "It's (started) raining now.",
        note: "A change of situation.",
      },
    ],
  },
  {
    id: "zh-questions",
    category: "Questions & negation",
    title: "Questions with 吗 and question words",
    summary:
      "Add 吗 to a statement for yes/no, or drop a question word straight into the slot.",
    body: [
      "The simplest question just adds 吗 (ma) to the end of a plain statement — the word order does not change at all.",
      "For “what/who/where/when”, Mandarin leaves the question word exactly where the answer would go. There's no moving it to the front like English does.",
    ],
    examples: [
      {
        target: "你是学生吗？",
        roman: "Nǐ shì xuéshēng ma?",
        en: "Are you a student?",
        note: "Statement + 吗.",
      },
      {
        target: "你去哪儿？",
        roman: "Nǐ qù nǎr?",
        en: "Where are you going?",
        note: "哪儿 stays in the object slot.",
      },
    ],
  },
  {
    id: "zh-negation",
    category: "Questions & negation",
    title: "Negation: 不 vs. 没",
    summary:
      "Use 不 for the present and habits; use 没 to say something didn't happen.",
    body: [
      "不 (bù) negates present and future actions, states and habits — “don't / won't / am not”.",
      "没 (méi) negates completed actions in the past — “didn't / haven't”. A key rule: 没 and the completion particle 了 don't appear together.",
    ],
    examples: [
      {
        target: "我不喝咖啡。",
        roman: "Wǒ bù hē kāfēi.",
        en: "I don't drink coffee.",
        note: "不 — a habit / present.",
      },
      {
        target: "我没去。",
        roman: "Wǒ méi qù.",
        en: "I didn't go.",
        note: "没 — a past action that didn't happen.",
      },
    ],
  },
  {
    id: "zh-no-inflection",
    category: "Nouns",
    title: "No plurals, no conjugation",
    summary:
      "Nouns and verbs keep one fixed form — context and particles carry the rest.",
    body: [
      "Mandarin nouns don't add a plural ending; 书 means “book” or “books” depending on context and any number in front of it.",
      "Verbs likewise never change for person or tense. Instead of endings, Mandarin uses time words (今天 today, 明天 tomorrow) and particles like 了 to place an action in time.",
    ],
    examples: [
      {
        target: "一本书 / 很多书",
        roman: "yì běn shū / hěn duō shū",
        en: "one book / many books",
        note: "Same word 书 for singular and plural.",
      },
      {
        target: "我今天工作，明天休息。",
        roman: "Wǒ jīntiān gōngzuò, míngtiān xiūxi.",
        en: "I work today and rest tomorrow.",
        note: "Time words, not verb endings, set the tense.",
      },
    ],
  },
];

/** All grammar topics, keyed by language code. */
export const GRAMMAR: Record<string, GrammarTopic[]> = {
  de: GERMAN,
  es: SPANISH,
  zh: MANDARIN,
};

/** Category order for a language, in the order topics first appear. */
export function grammarCategories(code: string): string[] {
  const topics = GRAMMAR[code] ?? [];
  const seen: string[] = [];
  for (const t of topics) if (!seen.includes(t.category)) seen.push(t.category);
  return seen;
}
