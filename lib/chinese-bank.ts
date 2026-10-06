import { Exercise, Level, Settings, topics, sentenceVocabulary } from "./practice";
import { connectedExercises } from "./connected-bank";

type Sentence = [english: string, pinyin: string, word: string, meaning: string, glosses: string];
// Mandarin, entirely in pinyin. Each level has two situations per topic.
const sentences: Record<Level, Sentence[][]> = {
  A1: [
    [
      ["I drink tea every morning.", "Wǒ měitiān zǎoshang hē chá.", "chá", "tea", "I|every day|morning|drink|tea"],
      ["I go home at six o'clock.", "Wǒ liù diǎn huí jiā.", "huí jiā", "to go home", "I|six|o'clock|return|home"],
    ],
    [
      ["I want to go to Beijing.", "Wǒ xiǎng qù Běijīng.", "xiǎng", "to want", "I|want|go to|Beijing"],
      ["Where is the train station?", "Huǒchēzhàn zài nǎlǐ?", "huǒchēzhàn", "train station", "train station|is located at|where"],
    ],
    [
      ["I would like a cup of coffee.", "Wǒ xiǎng yào yì bēi kāfēi.", "yì bēi", "one cup", "I|would like|want|one|cup (measure word)|coffee"],
      ["This dish is very tasty.", "Zhè ge cài hěn hǎochī.", "hǎochī", "tasty", "this|general measure word|dish|very|tasty"],
    ],
    [
      ["I study Chinese every day.", "Wǒ měitiān xué Zhōngwén.", "xué", "to study", "I|every day|study|Chinese"],
      ["My teacher is very busy.", "Wǒ de lǎoshī hěn máng.", "lǎoshī", "teacher", "I|possessive particle (my)|teacher|very|busy"],
    ],
    [
      ["My friend is a doctor.", "Wǒ de péngyou shì yīshēng.", "péngyou", "friend", "I|possessive particle (my)|friend|is|doctor"],
      ["I like listening to music.", "Wǒ xǐhuan tīng yīnyuè.", "yīnyuè", "music", "I|like|listen to|music"],
    ],
    [
      ["I think this book is good.", "Wǒ juéde zhè běn shū hěn hǎo.", "juéde", "to think or feel", "I|think|this|book measure word|book|very|good"],
      ["I like this idea.", "Wǒ xǐhuan zhè ge xiǎngfǎ.", "xiǎngfǎ", "idea", "I|like|this|general measure word|idea"],
    ],
  ],
  A2: [
    [
      ["Yesterday I bought some fruit.", "Zuótiān wǒ mǎi le yìxiē shuǐguǒ.", "shuǐguǒ", "fruit", "yesterday|I|buy|completed action particle|some|fruit"],
      ["I am cooking dinner.", "Wǒ zhèngzài zuò wǎnfàn.", "zhèngzài", "in the process of", "I|currently|make|dinner"],
    ],
    [
      ["I have been to Shanghai twice.", "Wǒ qù guo Shànghǎi liǎng cì.", "liǎng cì", "twice", "I|go to|past experience particle|Shanghai|two|times"],
      ["We will take the train tomorrow.", "Wǒmen míngtiān yào zuò huǒchē.", "zuò huǒchē", "to take the train", "we|tomorrow|will|take|train"],
    ],
    [
      ["I do not eat meat because I am a vegetarian.", "Wǒ bù chī ròu, yīnwèi wǒ shì sùshízhě.", "sùshízhě", "vegetarian", "I|not|eat|meat|because|I|am|vegetarian"],
      ["Could you give me another cup of water?", "Nǐ néng zài gěi wǒ yì bēi shuǐ ma?", "zài", "again or another", "you|can|again|give|me|one|cup (measure word)|water|question particle"],
    ],
    [
      ["I have already finished my homework.", "Wǒ yǐjīng zuò wán zuòyè le.", "yǐjīng", "already", "I|already|do|finish|homework|completion particle"],
      ["This job is more interesting than that one.", "Zhè fèn gōngzuò bǐ nà fèn gèng yǒuqù.", "bǐ", "compared with", "this|job measure word|job|compared with|that|job measure word|more|interesting"],
    ],
    [
      ["My younger sister sings very well.", "Wǒ mèimei chàng gē chàng de hěn hǎo.", "mèimei", "younger sister", "I (my)|younger sister|sing|song|sing|manner particle|very|well"],
      ["We celebrate the Spring Festival together every year.", "Wǒmen měinián yìqǐ guò Chūnjié.", "Chūnjié", "Spring Festival", "we|every year|together|celebrate|Spring Festival"],
    ],
    [
      ["I think learning Chinese is very useful.", "Wǒ juéde xué Zhōngwén hěn yǒuyòng.", "yǒuyòng", "useful", "I|think|learn|Chinese|very|useful"],
      ["If I have time, I will read this book.", "Rúguǒ wǒ yǒu shíjiān, wǒ jiù huì dú zhè běn shū.", "rúguǒ", "if", "if|I|have|time|I|then|will|read|this|book measure word|book"],
    ],
  ],
  B1: [
    [
      ["Although I am busy, I exercise every day.", "Suīrán wǒ hěn máng, dànshì wǒ měitiān dōu duànliàn.", "duànliàn", "to exercise", "although|I|very|busy|but|I|every day|each (emphasis)|exercise"],
      ["I have put the clothes in the wardrobe.", "Wǒ yǐjīng bǎ yīfu fàng jìn yīguì le.", "yīguì", "wardrobe", "I|already|object marker|clothes|put|into|wardrobe|completion particle"],
    ],
    [
      ["If it rains tomorrow, we will change our plans.", "Rúguǒ míngtiān xià yǔ, wǒmen jiù huì gǎibiàn jìhuà.", "gǎibiàn jìhuà", "to change plans", "if|tomorrow|fall (with yǔ: rain)|rain|we|then|will|change|plans"],
      ["This is the most beautiful place I have ever visited.", "Zhè shì wǒ qù guo de zuì měi de dìfang.", "dìfang", "place", "this|is|I|go to|past experience particle|relative clause particle|most|beautiful|descriptive particle|place"],
    ],
    [
      ["This restaurant is not only cheap but also very good.", "Zhè jiā cānguǎn búdàn piányi, érqiě hěn hǎo.", "búdàn", "not only", "this|business measure word|restaurant|not only|cheap|and also|very|good"],
      ["I would rather cook at home than eat out.", "Wǒ nìngyuàn zài jiā zuò fàn, yě bù yuànyì zài wàimiàn chī fàn.", "nìngyuàn", "would rather", "I|would rather|at|home|make|meal|also|not|willing|at|outside|eat|meal"],
    ],
    [
      ["I have been studying Chinese for two years.", "Wǒ xué Zhōngwén yǐjīng xué le liǎng nián le.", "liǎng nián", "two years", "I|study|Chinese|already|study|duration marker|two|years|continuing state particle"],
      ["The meeting was postponed because the manager was ill.", "Yīnwèi jīnglǐ shēng bìng le, huìyì tuīchí le.", "tuīchí", "to postpone", "because|manager|develop (with bìng: fall ill)|illness|completed action particle|meeting|postpone|completed action particle"],
    ],
    [
      ["We became friends through a shared hobby.", "Wǒmen tōngguò gòngtóng de àihào chéng le péngyou.", "gòngtóng", "shared", "we|through|shared|descriptive particle|hobby|become|completed action particle|friends"],
      ["Every region has its own traditions.", "Měi ge dìqū dōu yǒu zìjǐ de chuántǒng.", "chuántǒng", "tradition", "every|general measure word|region|all|have|one's own|possessive particle|traditions"],
    ],
    [
      ["I agree with you, but we need more information.", "Wǒ tóngyì nǐ de kànfǎ, dànshì wǒmen xūyào gèng duō xìnxī.", "tóngyì", "to agree", "I|agree with|you|possessive particle (your)|opinion|but|we|need|more|much|information"],
      ["In my opinion, public transport should be cheaper.", "Zài wǒ kàn lái, gōnggòng jiāotōng yīnggāi gèng piányi.", "zài wǒ kàn lái", "in my opinion", "in|my|view (with lái)|from (with kàn)|public|transport|should|more|cheap"],
    ],
  ],
  B2: [
    [
      ["The more organized my life is, the less stressed I feel.", "Wǒ de shēnghuó yuè yǒu tiáolǐ, wǒ gǎndào de yālì jiù yuè xiǎo.", "yǒu tiáolǐ", "organized", "I|possessive particle (my)|life|the more|have|order|I|feel|relative clause particle|pressure|then|the less|small"],
      ["Instead of buying new furniture, we repaired the old pieces.", "Wǒmen méiyǒu mǎi xīn jiājù, ér shì xiūlǐ le jiù jiājù.", "jiājù", "furniture", "we|did not|buy|new|furniture|but|rather (with ér)|repair|completed action particle|old|furniture"],
    ],
    [
      ["Had we booked earlier, the tickets would have been cheaper.", "Rúguǒ wǒmen zǎo yìdiǎn dìng piào, piàojià jiù huì gèng piányi.", "piàojià", "ticket price", "if|we|early|a little|book|tickets|ticket price|then|would|more|cheap"],
      ["Despite the bad weather, the trip exceeded our expectations.", "Jǐnguǎn tiānqì bù hǎo, zhè cì lǚxíng háishi chāochū le wǒmen de yùqī.", "yùqī", "expectation", "although|weather|not|good|this|trip measure word|trip|still|exceed|completed action particle|our|possessive particle|expectations"],
    ],
    [
      ["The restaurant places great importance on local ingredients.", "Zhè jiā cānguǎn fēicháng zhòngshì běndì shícái.", "shícái", "ingredients", "this|business measure word|restaurant|very|values|local|ingredients"],
      ["The less food we waste, the more money we save.", "Wǒmen làngfèi de shíwù yuè shǎo, shěng xià de qián jiù yuè duō.", "làngfèi", "to waste", "we|waste|relative clause particle|food|the less|little|save|result marker (with shěng)|descriptive particle|money|then|the more|much"],
    ],
    [
      ["The deadline was extended so that everyone could revise their work.", "Wèile ràng dàjiā dōu néng xiūgǎi zìjǐ de zuòpǐn, jiāozhǐ rìqī bèi yáncháng le.", "jiāozhǐ rìqī", "deadline", "in order to|let|everyone|all|can|revise|one's own|possessive particle|work|deadline|date|passive marker|extend|completed action particle"],
      ["I will accept the position provided that the hours are flexible.", "Zhǐyào gōngzuò shíjiān línghuó, wǒ jiù huì jiēshòu zhè ge zhíwèi.", "zhǐyào", "provided that", "provided that|work|hours|flexible|I|then|will|accept|this|general measure word|position"],
    ],
    [
      ["Cultural differences can lead to misunderstandings.", "Wénhuà chāyì kěnéng dǎozhì wùjiě.", "wùjiě", "misunderstanding", "cultural|differences|may|lead to|misunderstandings"],
      ["Although we grew up in different countries, we share many values.", "Suīrán wǒmen zài bùtóng de guójiā zhǎng dà, dàn wǒmen yǒu hěn duō gòngtóng de jiàzhíguān.", "jiàzhíguān", "values", "although|we|in|different|descriptive particle|countries|grow|up|but|we|have|very|many|shared|descriptive particle|values"],
    ],
    [
      ["This proposal is worth considering, even if it is not perfect.", "Jíshǐ zhè ge tíyì bù wánměi, tā yě zhídé kǎolǜ.", "zhídé", "worth", "even if|this|general measure word|proposal|not|perfect|it|still|worth|considering"],
      ["Whether the plan succeeds depends on everyone's cooperation.", "Zhè ge jìhuà néng fǒu chénggōng, qǔjué yú dàjiā de hézuò.", "qǔjué yú", "to depend on", "this|general measure word|plan|can|or not|succeed|depend (with yú)|on (with qǔjué)|everyone|possessive particle|cooperation"],
    ],
  ],
  C1: [
    [
      ["Only by setting clear priorities can we avoid unnecessary pressure.", "Zhǐyǒu míngquè yōuxiān shùnxù, wǒmen cái néng bìmiǎn bù bìyào de yālì.", "yōuxiān shùnxù", "priorities", "only if|clarify|priority|order|we|only then|can|avoid|not|necessary|descriptive particle|pressure"],
      ["What appears to be a minor habit can have a lasting impact on our health.", "Kànsì wēibùzúdào de xíguàn, què kěnéng duì wǒmen de jiànkāng chǎnshēng chíjiǔ de yǐngxiǎng.", "chíjiǔ", "lasting", "seemingly|insignificant|descriptive particle|habit|yet|may|on|our|possessive particle|health|produce|lasting|descriptive particle|impact"],
    ],
    [
      ["Tourism generates income while also putting pressure on local resources.", "Lǚyóuyè zài chuàngzào shōurù de tóngshí, yě gěi dāngdì zīyuán dài lái yālì.", "zīyuán", "resources", "tourism industry|in|generate|income|descriptive particle|at the same time|also|to|local|resources|bring|about (with dài)|pressure"],
      ["Rather than visiting as many places as possible, I prefer to understand one region deeply.", "Yǔqí jǐn kěnéng duō de cānguān bùtóng dìfang, wǒ gèng yuànyì shēnrù liǎojiě yí ge dìqū.", "yǔqí", "rather than", "rather than|as much as possible (with kěnéng)|possible|many|descriptive particle|visit|different|places|I|more|prefer|deeply|understand|one|general measure word|region"],
    ],
    [
      ["Food choices reflect not merely taste but also social conditions.", "Yǐnshí xuǎnzé suǒ fǎnyìng de bùjǐn shì kǒuwèi, hái yǒu shèhuì tiáojiàn.", "fǎnyìng", "to reflect", "food|choices|relative clause marker|reflect|relative clause particle|not merely|is|taste|also|have|social|conditions"],
      ["If the supply chain were more transparent, consumers could make better decisions.", "Rúguǒ gōngyìngliàn gèng tòumíng, xiāofèizhě jiù néng zuò chū gèng míngzhì de juédìng.", "gōngyìngliàn", "supply chain", "if|supply chain|more|transparent|consumers|then|could|make|result marker (with zuò)|more|wise|descriptive particle|decisions"],
    ],
    [
      ["The reform aims to reduce inequality without compromising teaching quality.", "Zhè xiàng gǎigé zhǐ zài suōxiǎo chājù, tóngshí bù xīshēng jiàoxué zhìliàng.", "gǎigé", "reform", "this|project measure word|reform|aim (with zài)|at (with zhǐ)|reduce|inequality|at the same time|not|sacrifice|teaching|quality"],
      ["As experience grows, our understanding of responsibility becomes more nuanced.", "Suízhe jīngyàn de jīlěi, wǒmen duì zérèn de lǐjiě biàn de gèngjiā xìzhì.", "jīlěi", "to accumulate", "as|experience|possessive particle|accumulation|we|of|responsibility|descriptive particle|understanding|become|manner particle|more|nuanced"],
    ],
    [
      ["Traditions are constantly reinterpreted as society changes.", "Suízhe shèhuì de biànhuà, chuántǒng bùduàn bèi chóngxīn quánshì.", "quánshì", "to interpret", "as|society|possessive particle|change|traditions|constantly|passive marker|anew|interpret"],
      ["Mutual understanding requires us to question our own assumptions.", "Xiānghù lǐjiě yāoqiú wǒmen fǎnsī zìjǐ de jiǎshè.", "fǎnsī", "to reflect critically", "mutual|understanding|requires|us|reflect critically on|our own|possessive particle|assumptions"],
    ],
    [
      ["The evidence supports this conclusion, although some uncertainty remains.", "Zhèxiē zhèngjù zhīchí zhè yì jiélùn, jǐnguǎn réng cúnzài yìxiē bù quèdìngxìng.", "bù quèdìngxìng", "uncertainty", "these|evidence|support|this|one|conclusion|although|still|exist|some|not|certainty"],
      ["We should distinguish between what is desirable and what is feasible.", "Wǒmen yīnggāi qūfēn lǐxiǎng de mùbiāo hé kěxíng de fāng'àn.", "kěxíng", "feasible", "we|should|distinguish|ideal|descriptive particle|goals|and|feasible|descriptive particle|plans"],
    ],
  ],
  C2: [
    [
      ["Far from being a waste of time, idleness may be a prerequisite for creativity.", "Xiánxiá fēidàn bù shì làngfèi shíjiān, fǎn'ér kěnéng shì chuàngzàolì de qiántí.", "qiántí", "prerequisite", "idleness|far from|not|is|waste|time|on the contrary|may|be|creativity|possessive particle|prerequisite"],
      ["The apparent simplicity of this routine conceals a delicate balance of competing needs.", "Zhè yì chángguī kànsì jiǎndān, shízé yǐncáng zhe bùtóng xūqiú zhī jiān de wēimiào pínghéng.", "wēimiào", "delicate or subtle", "this|one|routine|seemingly|simple|in fact|conceals|ongoing state particle|different|needs|of (with jiān: between)|between|descriptive particle|delicate|balance"],
    ],
    [
      ["The pursuit of authenticity can itself transform the places that travelers seek to preserve.", "Duì yuánzhēnxìng de zhuīqiú běnshēn, jiù kěnéng gǎibiàn lǚxíngzhě shìtú bǎocún de dìfang.", "yuánzhēnxìng", "authenticity", "of|authenticity|possessive particle|pursuit|itself|then|can|change|travelers|attempt to|preserve|relative clause particle|places"],
      ["Were mobility regarded as a privilege rather than a right, this debate would take a different course.", "Jiǎrú chūxíng bèi shì wéi tèquán ér fēi quánlì, zhè chǎng biànlùn jiù huì zǒu xiàng bùtóng de fāngxiàng.", "tèquán", "privilege", "if|mobility|passive marker|regard|as|privilege|rather (with fēi)|not|right|this|event measure word|debate|then|would|go|toward|different|descriptive particle|direction"],
    ],
    [
      ["Culinary heritage survives through adaptation as much as through faithful preservation.", "Yǐnshí yíchǎn de yánxù, jì yīlài zhōngshí de bǎocún, yě tóngyàng yīlài shìyìng xìng de gǎibiàn.", "yánxù", "continuation", "culinary|heritage|possessive particle|continuation|both|relies on|faithful|descriptive particle|preservation|also|equally|relies on|adaptation|quality suffix|descriptive particle|change"],
      ["What is marketed as an individual choice often obscures structural constraints.", "Bèi xuānchuán wéi gèrén xuǎnzé de shìqing, wǎngwǎng yǎngài le jiégòu xìng de zhìyuē.", "zhìyuē", "constraint", "passive marker|market|as|individual|choice|relative clause particle|things|often|obscures|completed action particle|structure|quality suffix|descriptive particle|constraints"],
    ],
    [
      ["The demand for measurable outcomes risks reducing education to what can easily be quantified.", "Duì kě héngliáng chéngguǒ de yāoqiú, kěnéng shǐ jiàoyù bèi jiǎnhuà wéi róngyì liànghuà de nèiróng.", "liànghuà", "to quantify", "for|can|measure|outcomes|descriptive particle|demand|may|cause|education|passive marker|reduce|to|easily|quantify|descriptive particle|content"],
      ["Expertise is demonstrated less by certainty than by knowing the limits of one's knowledge.", "Zhuānyè nénglì de tǐxiàn, yǔqí shuō zài yú quèxìn, bùrú shuō zài yú rènshi dào zìjǐ zhīshi de júxiàn.", "júxiàn", "limitation", "professional|ability|possessive particle|demonstration|rather than|say|lie (with yú)|in (with zài)|certainty|better to|say|lie (with yú)|in (with zài)|recognize|result marker (with rènshi)|one's own|knowledge|possessive particle|limits"],
    ],
    [
      ["To treat cultural identity as fixed is to overlook its ongoing negotiation.", "Jiāng wénhuà rèntóng shì wéi gùdìng bù biàn, jiù shì hūshì le tā bùduàn bèi xiéshāng de guòchéng.", "rèntóng", "identity", "object marker (treat)|cultural|identity|regard|as|fixed|not|change|then|is|overlook|completed action particle|its|constantly|passive marker|negotiated|descriptive particle|process"],
      ["Historical narratives reveal as much about the present as about the past they describe.", "Lìshǐ xùshì suǒ jiēshì de dāngxià, bìng bù yà yú qí suǒ miáoshù de guòqù.", "xùshì", "narrative", "historical|narratives|relative clause marker|reveal|relative clause particle|present|indeed|not|less|than|they|relative clause marker|describe|relative clause particle|past"],
    ],
    [
      ["To conflate correlation with causation is to mistake a pattern for an explanation.", "Jiāng xiāngguānxìng yǔ yīnguǒ guānxì hún wéi yì tán, jiù shì bǎ guīlǜ wù rèn wéi jiěshì.", "yīnguǒ guānxì", "causation", "object marker (treat)|correlation|with|cause and effect|relationship|mix|into|one|discussion|then|is|object marker|pattern|mistakenly|regard|as|explanation"],
      ["The strength of this position lies in its openness to revision rather than its certainty.", "Zhè yì lìchǎng de yōushì, zài yú tā duì xiūzhèng de kāifàng tàidu, ér fēi qí quèdìngxìng.", "xiūzhèng", "revision", "this|one|position|possessive particle|strength|lies (with yú)|in (with zài)|its|toward|revision|descriptive particle|open|attitude|rather (with fēi)|not|its|certainty"],
    ],
  ],
};

const hints: Record<Level, string> = {
  A1: "Use subject–verb–object order. Put time expressions before the verb.",
  A2: "Consider le for completed actions, guo for experience, and bǐ for comparisons.",
  B1: "Try structures such as suīrán…dànshì, rúguǒ…jiù, or búdàn…érqiě.",
  B2: "Preserve conditions and contrasts; consider yuè…yuè or zhǐyào…jiù.",
  C1: "Preserve the qualifications and choose precise expressions for abstract ideas.",
  C2: "Keep the nuance, emphasis and logical relationship between the clauses.",
};

export function getChineseExercisePool(settings: Settings): Exercise[] {
  const rows = sentences[settings.level]?.[topics.indexOf(settings.topic as (typeof topics)[number])];
  if (!rows) throw new Error("Choose valid practice settings.");
  const exercises = rows.map((row) => ({
    english: row[0], german: row[1],
    hint: `${hints[settings.level]} Useful expression: ${row[2]} (${row[3]}). Tone marks are optional.`,
    vocabulary: sentenceVocabulary(row[1], row[4], "chinese"),
  }));
  return settings.format === "single" ? exercises : connectedExercises(settings, exercises[0], exercises[1]);
}
