import { Exercise, Level, Settings, sentenceVocabulary, topics, firstLetterHint } from "./practice";

// Each topic/level supplies a reason and a contrasting fact that fit the first
// authored sentence. The optional finite-verb indices describe German clauses
// with longer subjects, allowing an explicit verb-final transformation.
type Companions = [reasonEnglish: string, reason: string, reasonGlosses: string,
  contrastEnglish: string, contrast: string, contrastGlosses: string,
  reasonVerbIndex?: number, contrastVerbIndex?: number];
const german: Record<Level, Companions[]> = {
  A1: [
    ["I am tired.", "Ich bin müde.", "I|am|tired", "I prefer tea.", "Ich mag Tee lieber.", "I|like|tea|better"],
    ["I have no car.", "Ich habe kein Auto.", "I|have|no|car", "The ticket is expensive.", "Das Ticket ist teuer.", "the|ticket|is|expensive", 1, 2],
    ["I am thirsty.", "Ich bin durstig.", "I|am|thirsty", "I am not thirsty.", "Ich bin nicht durstig.", "I|am|not|thirsty"],
    ["I live in Germany.", "Ich wohne in Deutschland.", "I|live|in|Germany", "I have little time.", "Ich habe wenig Zeit.", "I|have|little|time"],
    ["She works there.", "Sie arbeitet dort.", "she|works|there", "She prefers Berlin.", "Sie mag Berlin lieber.", "she|likes|Berlin|better"],
    ["It is interesting.", "Es ist interessant.", "it|is|interesting", "It is difficult.", "Es ist schwierig.", "it|is|difficult"],
  ],
  A2: [
    ["It was dirty.", "Sie war schmutzig.", "it (the apartment)|was|dirty", "I had little time.", "Ich hatte wenig Zeit.", "I|had|little|time"],
    ["We need a short holiday.", "Wir brauchen einen kurzen Urlaub.", "we|need|a|short|holiday", "It is quite expensive.", "Es ist ziemlich teuer.", "it|is|quite|expensive"],
    ["I have no cash.", "Ich habe kein Bargeld.", "I|have|no|cash", "I have enough cash.", "Ich habe genug Bargeld.", "I|have|enough|cash"],
    ["I need a good grade.", "Ich brauche eine gute Note.", "I|need|a|good|grade", "I am already tired.", "Ich bin schon müde.", "I|am|already|tired"],
    ["I enjoy their company.", "Ich genieße ihre Gesellschaft.", "I|enjoy|their|company", "I have a lot of work.", "Ich habe viel Arbeit.", "I|have|much|work"],
    ["The task is difficult.", "Die Aufgabe ist schwierig.", "the|task|is|difficult", "Everyone is in a hurry.", "Alle haben es eilig.", "everyone|have|it|urgent (with haben es: are in a hurry)", 2],
  ],
  B1: [
    ["I dislike wet weather.", "Ich mag nasses Wetter nicht.", "I|like|wet|weather|not", "My friends go out.", "Meine Freunde gehen nach draußen.", "my|friends|go|to|outside", 1, 2],
    ["There was heavy traffic.", "Es gab starken Verkehr.", "there|was|heavy|traffic", "The station was nearby.", "Der Bahnhof war ganz nah.", "the|station|was|very|near", 1, 2],
    ["I want to save money.", "Ich möchte Geld sparen.", "I|want to|money|save", "Restaurants offer more choice.", "Restaurants bieten mehr Auswahl.", "restaurants|offer|more|choice"],
    ["I have studied regularly.", "Ich habe regelmäßig gelernt.", "I|have (past tense helper)|regularly|studied", "The material is demanding.", "Der Stoff ist anspruchsvoll.", "the|material|is|demanding", 1, 2],
    ["I learn new perspectives from them.", "Ich lerne neue Sichtweisen von ihnen.", "I|learn|new|perspectives|from|them", "We sometimes disagree.", "Wir sind manchmal anderer Meinung.", "we|are|sometimes|of a different|opinion"],
    ["Many people depend on it.", "Viele sind darauf angewiesen.", "many people|are|on it|dependent", "Expansion costs money.", "Erweiterungen kosten Geld.", "expansions|cost|money"],
  ],
  B2: [
    ["I need a reliable structure.", "Ich brauche eine verlässliche Struktur.", "I|need|a|reliable|structure", "My working hours constantly vary.", "Meine Arbeitszeiten variieren ständig.", "my|working hours|vary|constantly", 1, 2],
    ["Prices rose shortly afterwards.", "Die Preise sind kurz danach gestiegen.", "the|prices|have (past tense helper)|shortly|afterwards|risen", "We already used a discount.", "Wir haben bereits einen Rabatt genutzt.", "we|have (past tense helper)|already|a|discount|used", 2],
    ["It supports local producers.", "Es unterstützt lokale Erzeuger.", "it|supports|local|producers", "Imported products are often cheaper.", "Importprodukte sind oft günstiger.", "imported products|are|often|cheaper"],
    ["The first drafts were incomplete.", "Die Entwürfe waren unvollständig.", "the|drafts|were|incomplete", "The schedule was already tight.", "Der Zeitplan war bereits knapp.", "the|schedule|was|already|tight", 2, 2],
    ["People interpret behavior differently.", "Menschen interpretieren Verhalten unterschiedlich.", "people|interpret|behavior|differently", "Everyone has good intentions.", "Alle haben gute Absichten.", "everyone|have|good|intentions"],
    ["It offers a realistic solution.", "Er bietet eine realistische Lösung.", "it (the proposal)|offers|a|realistic|solution", "Its implementation is risky.", "Seine Umsetzung ist riskant.", "its|implementation|is|risky", 1, 2],
  ],
  C1: [
    ["The interruption exposed my dependence.", "Die Unterbrechung offenbarte meine Abhängigkeit.", "the|interruption|exposed|my|dependence", "I considered myself flexible.", "Ich hielt mich für flexibel.", "I|considered|myself|to be|flexible", 2],
    ["The atmosphere shapes the experience.", "Sie prägt das Erlebnis.", "it (the atmosphere)|shapes|the|experience", "The sights fascinate most visitors.", "Die Sehenswürdigkeiten faszinieren die meisten Besucher.", "the|sights|fascinate|the|most|visitors", 1, 2],
    ["Affordable alternatives exist.", "Alternativen existieren durchaus.", "alternatives|exist|certainly", "Prices influence many decisions.", "Sie beeinflussen viele Entscheidungen.", "they (the prices)|influence|many|decisions"],
    ["The available studies contradict one another.", "Die verfügbaren Studien widersprechen einander.", "the|available|studies|contradict|one another", "Many companies support the model.", "Viele Unternehmen unterstützen das Modell.", "many|companies|support|the|model", 3, 2],
    ["It changes through lived experience.", "Sie verändert sich durch gelebte Erfahrung.", "it (cultural identity)|changes|itself|through|lived|experience", "Traditions provide a sense of continuity.", "Traditionen vermitteln ein Gefühl von Kontinuität.", "traditions|provide|a|sense|of|continuity"],
    ["The sources are independently verifiable.", "Die Quellen sind unabhängig überprüfbar.", "the|sources|are|independently|verifiable", "The evidence is incomplete.", "Die Belege sind unvollständig.", "the|evidence|are|incomplete", 2, 2],
  ],
  C2: [
    ["Freedom remains subject to social expectations.", "Freiheit unterliegt weiterhin gesellschaftlichen Erwartungen.", "freedom|is subject to|still|social|expectations", "The change initially feels liberating.", "Die Veränderung wirkt zunächst befreiend.", "the|change|feels|initially|liberating", 1, 2],
    ["Commercialization alters the place's character.", "Kommerzialisierung verändert den Charakter des Ortes.", "commercialization|alters|the|character|of the|place", "Visitors seek an untouched experience.", "Besucher suchen ein unberührtes Erlebnis.", "visitors|seek|an|untouched|experience"],
    ["It individualizes a systemic problem.", "Sie individualisiert ein systemisches Problem.", "it (the rhetoric)|individualizes|a|systemic|problem", "Its advocates emphasize social responsibility.", "Ihre Befürworter betonen gesellschaftliche Verantwortung.", "its|advocates|emphasize|social|responsibility", 1, 2],
    ["Learning unfolds through unpredictable interactions.", "Es entsteht durch unvorhersehbare Wechselwirkungen.", "it (learning)|arises|through|unpredictable|interactions", "Institutions require comparable indicators.", "Sie benötigen vergleichbare Kennzahlen.", "they (institutions)|require|comparable|indicators"],
    ["Historical continuity carries symbolic authority.", "Historische Kontinuität besitzt symbolische Autorität.", "historical|continuity|possesses|symbolic|authority", "Continuity alone establishes no moral legitimacy.", "Kontinuität begründet allein keine moralische Legitimität.", "continuity|establishes|alone|no|moral|legitimacy", 2],
    ["The premises conceal contested assumptions.", "Sie verbergen umstrittene Annahmen.", "they (the premises)|conceal|contested|assumptions", "The reasoning appears internally consistent.", "Die Argumentation erscheint in sich schlüssig.", "the|reasoning|appears|in|itself|consistent", 1, 2],
  ],
};

const chinese: Record<Level, Companions[]> = {
  A1: [
    ["I like tea.", "Wǒ xǐhuan chá.", "I|like|tea", "I prefer coffee.", "Wǒ gèng xǐhuan kāfēi.", "I|more|like|coffee"],
    ["My friend lives there.", "Wǒ de péngyou zhù zài nàlǐ.", "I|possessive particle (my)|friend|lives|at|there", "I have little time.", "Wǒ de shíjiān hěn shǎo.", "I|possessive particle (my)|time|very|little"],
    ["I am tired.", "Wǒ hěn lèi.", "I|very|tired", "I am not tired.", "Wǒ bù lèi.", "I|not|tired"],
    ["I live in China.", "Wǒ zhù zài Zhōngguó.", "I|live|in|China", "I am very busy.", "Wǒ hěn máng.", "I|very|busy"],
    ["He likes helping people.", "Tā xǐhuan bāngzhù biérén.", "he|likes|help|other people", "He dislikes hospitals.", "Tā bù xǐhuan yīyuàn.", "he|not|likes|hospitals"],
    ["It is interesting.", "Tā hěn yǒuqù.", "it|very|interesting", "It is difficult.", "Tā hěn nán.", "it|very|difficult"],
  ],
  A2: [
    ["I want to eat healthily.", "Wǒ xiǎng chī de jiànkāng.", "I|want|eat|manner particle|healthily", "Fruit is quite expensive.", "Shuǐguǒ bǐjiào guì.", "fruit|quite|expensive"],
    ["My friend lives there.", "Wǒ de péngyou zhù zài nàlǐ.", "I|possessive particle (my)|friend|lives|at|there", "It is far from my home.", "Nàlǐ lí wǒ jiā hěn yuǎn.", "there|from|my|home|very|far"],
    ["I care about animals.", "Wǒ guānxīn dòngwù.", "I|care about|animals", "My family likes meat.", "Wǒ de jiārén xǐhuan chī ròu.", "I|possessive particle (my)|family|likes|eat|meat"],
    ["I started early.", "Wǒ hěn zǎo jiù kāishǐ le.", "I|very|early|already|start|completed action particle", "It was difficult.", "Zuòyè hěn nán.", "homework|very|difficult"],
    ["She practices every day.", "Tā měitiān dōu liànxí.", "she|every day|each (emphasis)|practices", "She is still young.", "Tā hái hěn niánqīng.", "she|still|very|young"],
    ["I want to work in China.", "Wǒ xiǎng zài Zhōngguó gōngzuò.", "I|want|in|China|work", "The grammar is unfamiliar.", "Yǔfǎ duì wǒ lái shuō hěn mòshēng.", "grammar|to|me|from (with lái shuō)|speaking (with lái)|very|unfamiliar"],
  ],
  B1: [
    ["Health matters to me.", "Jiànkāng duì wǒ hěn zhòngyào.", "health|to|me|very|important", "I often feel tired.", "Wǒ chángcháng juéde lèi.", "I|often|feel|tired"],
    ["The activity is outdoors.", "Huódòng zài hùwài jǔxíng.", "activity|at|outdoors|takes place", "Everyone has already prepared.", "Dàjiā dōu yǐjīng zhǔnbèi hǎo le.", "everyone|all|already|prepare|result marker (ready)|completion particle"],
    ["The owner chooses fresh ingredients.", "Lǎobǎn xuǎnzé xīnxiān de shícái.", "owner|chooses|fresh|descriptive particle|ingredients", "It is far from my home.", "Tā lí wǒ jiā hěn yuǎn.", "it|from|my|home|very|far"],
    ["I enjoy learning languages.", "Wǒ xǐhuan xué yǔyán.", "I|enjoy|learn|languages", "I still make mistakes.", "Wǒ háishi huì fàn cuò.", "I|still|can|make|mistakes"],
    ["We met regularly.", "Wǒmen jīngcháng jiànmiàn.", "we|regularly|met", "Our personalities are different.", "Wǒmen de xìnggé bùtóng.", "our|possessive particle|personalities|different"],
    ["Your argument is persuasive.", "Nǐ de lùndiǎn hěn yǒu shuōfúlì.", "you|possessive particle (your)|argument|very|has|persuasive power", "I had doubts at first.", "Wǒ zuìchū yǒu yíwèn.", "I|at first|had|doubts"],
  ],
  B2: [
    ["Planning reduces uncertainty.", "Guīhuà néng jiǎnshǎo bù quèdìngxìng.", "planning|can|reduce|not|certainty", "My schedule frequently changes.", "Wǒ de rìchéng jīngcháng biànhuà.", "I|possessive particle (my)|schedule|frequently|changes"],
    ["Prices rose soon afterwards.", "Jiàgé suíhòu hěn kuài shàngzhǎng le.", "prices|afterwards|very|quickly|rise|completed action particle", "We had already received a discount.", "Wǒmen yǐjīng huòdé le zhékòu.", "we|already|receive|completed action particle|discount"],
    ["It supports local producers.", "Tā zhīchí běndì shēngchǎnzhě.", "it|supports|local|producers", "Imported ingredients are often cheaper.", "Jìnkǒu shícái wǎngwǎng gèng piányi.", "imported|ingredients|often|more|cheap"],
    ["The first drafts were incomplete.", "Chūgǎo bù wánzhěng.", "first drafts|not|complete", "The schedule was already tight.", "Shíjiān ānpái yǐjīng hěn jǐn.", "time|arrangement|already|very|tight"],
    ["People interpret behavior differently.", "Rénmen duì xíngwéi de lǐjiě bùtóng.", "people|of|behavior|descriptive particle|interpretation|different", "Everyone has good intentions.", "Dàjiā dōu yǒu hǎo de dòngjī.", "everyone|all|have|good|descriptive particle|intentions"],
    ["It offers a realistic solution.", "Tā tígōng le xiànshí de jiějué fāng'àn.", "it|offers|completed action particle|realistic|descriptive particle|solution|plan", "Its implementation is risky.", "Tā de shíshī yǒu fēngxiǎn.", "it|possessive particle (its)|implementation|has|risks"],
  ],
  C1: [
    ["Our resources are limited.", "Wǒmen de zīyuán yǒuxiàn.", "our|possessive particle|resources|limited", "All the tasks seem important.", "Suǒyǒu rènwù kànsì dōu hěn zhòngyào.", "all|tasks|seemingly|all|very|important"],
    ["Visitor numbers are growing.", "Yóukè shùliàng bùduàn zēngzhǎng.", "visitors|number|constantly|grows", "Local residents want a quieter life.", "Dāngdì jūmín xīwàng shēnghuó gèng ānjìng.", "local|residents|want|life|more|quiet"],
    ["Income affects access to ingredients.", "Shōurù yǐngxiǎng huòqǔ shícái de nénglì.", "income|affects|access|ingredients|descriptive particle|ability", "Consumers describe them as personal preferences.", "Xiāofèizhě jiāng tāmen shì wéi gèrén piānhào.", "consumers|object marker|them|regard|as|personal|preferences"],
    ["Equal access is essential.", "Píngděng de jīhuì zhìguānzhòngyào.", "equal|descriptive particle|opportunity|essential", "Available funding is limited.", "Kěyòng de zījīn yǒuxiàn.", "available|descriptive particle|funding|limited"],
    ["People adapt them to new circumstances.", "Rénmen gēnjù xīn de huánjìng tiáozhěng tāmen.", "people|according to|new|descriptive particle|circumstances|adapt|them", "They are often presented as timeless.", "Tāmen cháng bèi miáoshù wéi yǒnghéng de.", "they|often|passive marker|describe|as|timeless|descriptive particle"],
    ["Independent studies reach similar findings.", "Dúlì yánjiū déchū le xiāngsì de jiéguǒ.", "independent|studies|reach|completed action particle|similar|descriptive particle|findings", "Some sources are incomplete.", "Yìxiē zīliào bù wánzhěng.", "some|sources|not|complete"],
  ],
  C2: [
    ["Unstructured time enables unexpected connections.", "Fēi jiégòu huà de shíjiān yǒuzhù yú chǎnshēng yìwài de liánxì.", "non|structured|transformation suffix|descriptive particle|time|helps|with|generate|unexpected|descriptive particle|connections", "Efficiency is usually treated as the highest priority.", "Xiàolǜ tōngcháng bèi shì wéi shǒuyào mùbiāo.", "efficiency|usually|passive marker|regard|as|primary|goal"],
    ["Attention changes local economic incentives.", "Guānzhù gǎibiàn le dāngdì de jīngjì dòngjī.", "attention|changes|completed action particle|local|descriptive particle|economic|incentives", "Visitors sincerely wish to protect those places.", "Yóukè zhēnchéng de xīwàng bǎohù nàxiē dìfang.", "visitors|sincerely|manner particle|wish|protect|those|places"],
    ["Living traditions respond to changing circumstances.", "Huó de chuántǒng huì huíyìng biànhuà de huánjìng.", "living|descriptive particle|traditions|will|respond to|changing|descriptive particle|circumstances", "Preservation is often associated with resisting change.", "Bǎocún cháng bèi yǔ kàngjù biànhuà liánxì zài yìqǐ.", "preservation|often|passive marker|with|resisting|change|associate|at|together"],
    ["Indicators privilege easily observable results.", "Zhǐbiāo piānzhòng róngyì guānchá de jiéguǒ.", "indicators|favor|easily|observe|descriptive particle|results", "Institutions need transparent accountability.", "Jīgòu xūyào tòumíng de wènzé jīzhì.", "institutions|need|transparent|descriptive particle|accountability|mechanisms"],
    ["Belonging is continually renegotiated.", "Guīshǔ bùduàn bèi chóngxīn xiéshāng.", "belonging|constantly|passive marker|anew|negotiated", "Public discourse often presents it as stable.", "Gōnggòng huàyǔ cháng jiāng tā miáoshù wéi wěndìng de.", "public|discourse|often|object marker|it|describe|as|stable|descriptive particle"],
    ["The underlying mechanisms remain unproven.", "Qiánzài de jīzhì réng wèi dédào zhèngshí.", "underlying|descriptive particle|mechanisms|still|not yet|receive|confirmation", "The statistical association is strong.", "Tǒngjì shàng de liánxì hěn qiáng.", "statistics|in terms of|descriptive particle|association|very|strong"],
  ],
};

function continuation(text: string) {
  // Sentence-initial German nouns retain their capitalization.
  return text.replace(/^(Ich|Wir|Mein|Meine|Seine|Ihre|Historische|Der|Die|Das|Dem|Es|Er|Sie|Alle|Viele|Obwohl|Je|Hätten|Wenn|Anstatt|Trotz|Ob|Meiner|Erst|Angesichts|Worauf|In|Was|Inwieweit|Wären|Selbst|So|Weit|Wäre|Kulinarische|Kulturelle|Gegenseitiges|Selbstständiges|Historisches|Wie|Dass)\b/, word => word.toLowerCase());
}

export function connectedExercises(settings: Settings, main: Exercise, addition: Exercise): Exercise[] {
  const language = settings.language ?? "german";
  const isChinese = language === "chinese";
  const row = (isChinese ? chinese : german)[settings.level][topics.indexOf(settings.topic as (typeof topics)[number])];
  const lower = (text: string) => isChinese ? text[0].toLowerCase() + text.slice(1) : continuation(text);
  const clause = (text: string, glosses: string, subordinate = false, verbIndex = 1) => {
    const words = sentenceVocabulary(lower(text), glosses, language);
    if (subordinate && !isChinese) {
      // Keep participles and infinitives in place; move only the finite verb.
      const [finiteVerb] = words.splice(verbIndex, 1);
      words.push(finiteVerb);
    }
    return { text: words.map(word => word.german).join(" ") + ".", vocabulary: words };
  };
  const reason = clause(row[1], row[2], true, row[6]);
  const contrast = clause(row[4], row[5]);
  const concession = clause(row[4], row[5], true, row[7]);
  const connectors = isChinese
    ? { and: "érqiě", but: "dànshì", because: "yīnwèi", although: "suīrán" }
    : { and: "und", but: "aber", because: "weil", although: "obwohl" };
  const make = (meaning: keyof typeof connectors, english: string, text: string, words: Exercise["vocabulary"]): Exercise => ({
    english,
    german: text,
    hint: firstLetterHint(text),
    connector: { english: meaning, target: connectors[meaning] },
    vocabulary: words,
  });
  const start = main.german.replace(/[.!?]$/, "");
  const englishStart = main.english.replace(/[.!?]$/, "");
  const englishJoin = (meaning: string, end: string) => `${englishStart}, ${meaning} ${/^I\b/.test(end) ? end : end[0].toLowerCase() + end.slice(1)}`;
  const word = (meaning: keyof typeof connectors) => ({ german: connectors[meaning], english: meaning === "and" && isChinese ? "and also" : meaning, language });
  return [
    make("and", englishJoin("and", addition.english), `${start}, ${connectors.and} ${lower(addition.german)}`, [...main.vocabulary, word("and"), ...sentenceVocabulary(lower(addition.german), addition.vocabulary.map(w => w.english).join("|"), language)]),
    make("but", englishJoin("but", row[3]), `${start}, ${connectors.but} ${contrast.text}`, [...main.vocabulary, word("but"), ...contrast.vocabulary]),
    make("because", englishJoin("because", row[0]), `${start}, ${connectors.because} ${reason.text}`, [...main.vocabulary, word("because"), ...reason.vocabulary]),
    isChinese
      ? make("although", englishJoin("although", row[3]), `Suīrán ${concession.text.replace(/\.$/, "")}, dànshì ${lower(main.german)}`, [{ ...word("although"), german: "Suīrán" }, ...concession.vocabulary, word("but"), ...sentenceVocabulary(lower(main.german), main.vocabulary.map(w => w.english).join("|"), language)])
      : make("although", englishJoin("although", row[3]), `${start}, ${connectors.although} ${concession.text}`, [...main.vocabulary, word("although"), ...concession.vocabulary]),
  ];
}
