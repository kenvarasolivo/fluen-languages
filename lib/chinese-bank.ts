import { Exercise, Level, Settings, topics } from "./practice";

type Sentence = [english: string, pinyin: string, word: string, meaning: string];
// Mandarin, entirely in pinyin. Each level has two situations per topic.
const sentences: Record<Level, Sentence[][]> = {
  A1: [
    [
      ["I drink tea every morning.", "Wǒ měitiān zǎoshang hē chá.", "chá", "tea"],
      ["I go home at six o'clock.", "Wǒ liù diǎn huí jiā.", "huí jiā", "to go home"],
    ],
    [
      ["I want to go to Beijing.", "Wǒ xiǎng qù Běijīng.", "xiǎng", "to want"],
      ["Where is the train station?", "Huǒchēzhàn zài nǎlǐ?", "huǒchēzhàn", "train station"],
    ],
    [
      ["I would like a cup of coffee.", "Wǒ xiǎng yào yì bēi kāfēi.", "yì bēi", "one cup"],
      ["This dish is very tasty.", "Zhè ge cài hěn hǎochī.", "hǎochī", "tasty"],
    ],
    [
      ["I study Chinese every day.", "Wǒ měitiān xué Zhōngwén.", "xué", "to study"],
      ["My teacher is very busy.", "Wǒ de lǎoshī hěn máng.", "lǎoshī", "teacher"],
    ],
    [
      ["My friend is a doctor.", "Wǒ de péngyou shì yīshēng.", "péngyou", "friend"],
      ["I like listening to music.", "Wǒ xǐhuan tīng yīnyuè.", "yīnyuè", "music"],
    ],
    [
      ["I think this book is good.", "Wǒ juéde zhè běn shū hěn hǎo.", "juéde", "to think or feel"],
      ["I like this idea.", "Wǒ xǐhuan zhè ge xiǎngfǎ.", "xiǎngfǎ", "idea"],
    ],
  ],
  A2: [
    [
      ["Yesterday I bought some fruit.", "Zuótiān wǒ mǎi le yìxiē shuǐguǒ.", "shuǐguǒ", "fruit"],
      ["I am cooking dinner.", "Wǒ zhèngzài zuò wǎnfàn.", "zhèngzài", "in the process of"],
    ],
    [
      ["I have been to Shanghai twice.", "Wǒ qù guo Shànghǎi liǎng cì.", "liǎng cì", "twice"],
      ["We will take the train tomorrow.", "Wǒmen míngtiān yào zuò huǒchē.", "zuò huǒchē", "to take the train"],
    ],
    [
      ["I do not eat meat because I am a vegetarian.", "Wǒ bù chī ròu, yīnwèi wǒ shì sùshízhě.", "sùshízhě", "vegetarian"],
      ["Could you give me another cup of water?", "Nǐ néng zài gěi wǒ yì bēi shuǐ ma?", "zài", "again or another"],
    ],
    [
      ["I have already finished my homework.", "Wǒ yǐjīng zuò wán zuòyè le.", "yǐjīng", "already"],
      ["This job is more interesting than that one.", "Zhè fèn gōngzuò bǐ nà fèn gèng yǒuqù.", "bǐ", "compared with"],
    ],
    [
      ["My younger sister sings very well.", "Wǒ mèimei chàng gē chàng de hěn hǎo.", "mèimei", "younger sister"],
      ["We celebrate the Spring Festival together every year.", "Wǒmen měinián yìqǐ guò Chūnjié.", "Chūnjié", "Spring Festival"],
    ],
    [
      ["I think learning Chinese is very useful.", "Wǒ juéde xué Zhōngwén hěn yǒuyòng.", "yǒuyòng", "useful"],
      ["If I have time, I will read this book.", "Rúguǒ wǒ yǒu shíjiān, wǒ jiù huì dú zhè běn shū.", "rúguǒ", "if"],
    ],
  ],
  B1: [
    [
      ["Although I am busy, I exercise every day.", "Suīrán wǒ hěn máng, dànshì wǒ měitiān dōu duànliàn.", "duànliàn", "to exercise"],
      ["I have put the clothes in the wardrobe.", "Wǒ yǐjīng bǎ yīfu fàng jìn yīguì le.", "yīguì", "wardrobe"],
    ],
    [
      ["If it rains tomorrow, we will change our plans.", "Rúguǒ míngtiān xià yǔ, wǒmen jiù huì gǎibiàn jìhuà.", "gǎibiàn jìhuà", "to change plans"],
      ["This is the most beautiful place I have ever visited.", "Zhè shì wǒ qù guo de zuì měi de dìfang.", "dìfang", "place"],
    ],
    [
      ["This restaurant is not only cheap but also very good.", "Zhè jiā cānguǎn búdàn piányi, érqiě hěn hǎo.", "búdàn", "not only"],
      ["I would rather cook at home than eat out.", "Wǒ nìngyuàn zài jiā zuò fàn, yě bù yuànyì zài wàimiàn chī fàn.", "nìngyuàn", "would rather"],
    ],
    [
      ["I have been studying Chinese for two years.", "Wǒ xué Zhōngwén yǐjīng xué le liǎng nián le.", "liǎng nián", "two years"],
      ["The meeting was postponed because the manager was ill.", "Yīnwèi jīnglǐ shēng bìng le, huìyì tuīchí le.", "tuīchí", "to postpone"],
    ],
    [
      ["We became friends through a shared hobby.", "Wǒmen tōngguò gòngtóng de àihào chéng le péngyou.", "gòngtóng", "shared"],
      ["Every region has its own traditions.", "Měi ge dìqū dōu yǒu zìjǐ de chuántǒng.", "chuántǒng", "tradition"],
    ],
    [
      ["I agree with you, but we need more information.", "Wǒ tóngyì nǐ de kànfǎ, dànshì wǒmen xūyào gèng duō xìnxī.", "tóngyì", "to agree"],
      ["In my opinion, public transport should be cheaper.", "Zài wǒ kàn lái, gōnggòng jiāotōng yīnggāi gèng piányi.", "zài wǒ kàn lái", "in my opinion"],
    ],
  ],
  B2: [
    [
      ["The more organized my life is, the less stressed I feel.", "Wǒ de shēnghuó yuè yǒu tiáolǐ, wǒ gǎndào de yālì jiù yuè xiǎo.", "yǒu tiáolǐ", "organized"],
      ["Instead of buying new furniture, we repaired the old pieces.", "Wǒmen méiyǒu mǎi xīn jiājù, ér shì xiūlǐ le jiù jiājù.", "jiājù", "furniture"],
    ],
    [
      ["Had we booked earlier, the tickets would have been cheaper.", "Rúguǒ wǒmen zǎo yìdiǎn dìng piào, piàojià jiù huì gèng piányi.", "piàojià", "ticket price"],
      ["Despite the bad weather, the trip exceeded our expectations.", "Jǐnguǎn tiānqì bù hǎo, zhè cì lǚxíng háishi chāochū le wǒmen de yùqī.", "yùqī", "expectation"],
    ],
    [
      ["The restaurant places great importance on local ingredients.", "Zhè jiā cānguǎn fēicháng zhòngshì běndì shícái.", "shícái", "ingredients"],
      ["The less food we waste, the more money we save.", "Wǒmen làngfèi de shíwù yuè shǎo, shěng xià de qián jiù yuè duō.", "làngfèi", "to waste"],
    ],
    [
      ["The deadline was extended so that everyone could revise their work.", "Wèile ràng dàjiā dōu néng xiūgǎi zìjǐ de zuòpǐn, jiāozhǐ rìqī bèi yáncháng le.", "jiāozhǐ rìqī", "deadline"],
      ["I will accept the position provided that the hours are flexible.", "Zhǐyào gōngzuò shíjiān línghuó, wǒ jiù huì jiēshòu zhè ge zhíwèi.", "zhǐyào", "provided that"],
    ],
    [
      ["Cultural differences can lead to misunderstandings.", "Wénhuà chāyì kěnéng dǎozhì wùjiě.", "wùjiě", "misunderstanding"],
      ["Although we grew up in different countries, we share many values.", "Suīrán wǒmen zài bùtóng de guójiā zhǎng dà, dàn wǒmen yǒu hěn duō gòngtóng de jiàzhíguān.", "jiàzhíguān", "values"],
    ],
    [
      ["This proposal is worth considering, even if it is not perfect.", "Jíshǐ zhè ge tíyì bù wánměi, tā yě zhídé kǎolǜ.", "zhídé", "worth"],
      ["Whether the plan succeeds depends on everyone's cooperation.", "Zhè ge jìhuà néng fǒu chénggōng, qǔjué yú dàjiā de hézuò.", "qǔjué yú", "to depend on"],
    ],
  ],
  C1: [
    [
      ["Only by setting clear priorities can we avoid unnecessary pressure.", "Zhǐyǒu míngquè yōuxiān shùnxù, wǒmen cái néng bìmiǎn bù bìyào de yālì.", "yōuxiān shùnxù", "priorities"],
      ["What appears to be a minor habit can have a lasting impact on our health.", "Kànsì wēibùzúdào de xíguàn, què kěnéng duì wǒmen de jiànkāng chǎnshēng chíjiǔ de yǐngxiǎng.", "chíjiǔ", "lasting"],
    ],
    [
      ["Tourism generates income while also putting pressure on local resources.", "Lǚyóuyè zài chuàngzào shōurù de tóngshí, yě gěi dāngdì zīyuán dài lái yālì.", "zīyuán", "resources"],
      ["Rather than visiting as many places as possible, I prefer to understand one region deeply.", "Yǔqí jǐn kěnéng duō de cānguān bùtóng dìfang, wǒ gèng yuànyì shēnrù liǎojiě yí ge dìqū.", "yǔqí", "rather than"],
    ],
    [
      ["Food choices reflect not merely taste but also social conditions.", "Yǐnshí xuǎnzé suǒ fǎnyìng de bùjǐn shì kǒuwèi, hái yǒu shèhuì tiáojiàn.", "fǎnyìng", "to reflect"],
      ["If the supply chain were more transparent, consumers could make better decisions.", "Rúguǒ gōngyìngliàn gèng tòumíng, xiāofèizhě jiù néng zuò chū gèng míngzhì de juédìng.", "gōngyìngliàn", "supply chain"],
    ],
    [
      ["The reform aims to reduce inequality without compromising teaching quality.", "Zhè xiàng gǎigé zhǐ zài suōxiǎo chājù, tóngshí bù xīshēng jiàoxué zhìliàng.", "gǎigé", "reform"],
      ["As experience grows, our understanding of responsibility becomes more nuanced.", "Suízhe jīngyàn de jīlěi, wǒmen duì zérèn de lǐjiě biàn de gèngjiā xìzhì.", "jīlěi", "to accumulate"],
    ],
    [
      ["Traditions are constantly reinterpreted as society changes.", "Suízhe shèhuì de biànhuà, chuántǒng bùduàn bèi chóngxīn quánshì.", "quánshì", "to interpret"],
      ["Mutual understanding requires us to question our own assumptions.", "Xiānghù lǐjiě yāoqiú wǒmen fǎnsī zìjǐ de jiǎshè.", "fǎnsī", "to reflect critically"],
    ],
    [
      ["The evidence supports this conclusion, although some uncertainty remains.", "Zhèxiē zhèngjù zhīchí zhè yì jiélùn, jǐnguǎn réng cúnzài yìxiē bù quèdìngxìng.", "bù quèdìngxìng", "uncertainty"],
      ["We should distinguish between what is desirable and what is feasible.", "Wǒmen yīnggāi qūfēn lǐxiǎng de mùbiāo hé kěxíng de fāng'àn.", "kěxíng", "feasible"],
    ],
  ],
  C2: [
    [
      ["Far from being a waste of time, idleness may be a prerequisite for creativity.", "Xiánxiá fēidàn bù shì làngfèi shíjiān, fǎn'ér kěnéng shì chuàngzàolì de qiántí.", "qiántí", "prerequisite"],
      ["The apparent simplicity of this routine conceals a delicate balance of competing needs.", "Zhè yì chángguī kànsì jiǎndān, shízé yǐncáng zhe bùtóng xūqiú zhī jiān de wēimiào pínghéng.", "wēimiào", "delicate or subtle"],
    ],
    [
      ["The pursuit of authenticity can itself transform the places that travelers seek to preserve.", "Duì yuánzhēnxìng de zhuīqiú běnshēn, jiù kěnéng gǎibiàn lǚxíngzhě shìtú bǎocún de dìfang.", "yuánzhēnxìng", "authenticity"],
      ["Were mobility regarded as a privilege rather than a right, this debate would take a different course.", "Jiǎrú chūxíng bèi shì wéi tèquán ér fēi quánlì, zhè chǎng biànlùn jiù huì zǒu xiàng bùtóng de fāngxiàng.", "tèquán", "privilege"],
    ],
    [
      ["Culinary heritage survives through adaptation as much as through faithful preservation.", "Yǐnshí yíchǎn de yánxù, jì yīlài zhōngshí de bǎocún, yě tóngyàng yīlài shìyìng xìng de gǎibiàn.", "yánxù", "continuation"],
      ["What is marketed as an individual choice often obscures structural constraints.", "Bèi xuānchuán wéi gèrén xuǎnzé de shìqing, wǎngwǎng yǎngài le jiégòu xìng de zhìyuē.", "zhìyuē", "constraint"],
    ],
    [
      ["The demand for measurable outcomes risks reducing education to what can easily be quantified.", "Duì kě héngliáng chéngguǒ de yāoqiú, kěnéng shǐ jiàoyù bèi jiǎnhuà wéi róngyì liànghuà de nèiróng.", "liànghuà", "to quantify"],
      ["Expertise is demonstrated less by certainty than by knowing the limits of one's knowledge.", "Zhuānyè nénglì de tǐxiàn, yǔqí shuō zài yú quèxìn, bùrú shuō zài yú rènshi dào zìjǐ zhīshi de júxiàn.", "júxiàn", "limitation"],
    ],
    [
      ["To treat cultural identity as fixed is to overlook its ongoing negotiation.", "Jiāng wénhuà rèntóng shì wéi gùdìng bù biàn, jiù shì hūshì le tā bùduàn bèi xiéshāng de guòchéng.", "rèntóng", "identity"],
      ["Historical narratives reveal as much about the present as about the past they describe.", "Lìshǐ xùshì suǒ jiēshì de dāngxià, bìng bù yà yú qí suǒ miáoshù de guòqù.", "xùshì", "narrative"],
    ],
    [
      ["To conflate correlation with causation is to mistake a pattern for an explanation.", "Jiāng xiāngguānxìng yǔ yīnguǒ guānxì hún wéi yì tán, jiù shì bǎ guīlǜ wù rèn wéi jiěshì.", "yīnguǒ guānxì", "causation"],
      ["The strength of this position lies in its openness to revision rather than its certainty.", "Zhè yì lìchǎng de yōushì, zài yú tā duì xiūzhèng de kāifàng tàidu, ér fēi qí quèdìngxìng.", "xiūzhèng", "revision"],
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
  const word = (row: Sentence) => ({ german: row[2], english: row[3], language: "chinese" as const });
  if (settings.format === "single") return rows.map((row) => ({
    english: row[0], german: row[1],
    hint: `${hints[settings.level]} Useful expression: ${row[2]} (${row[3]}). Tone marks are optional.`,
    vocabulary: [word(row)],
  }));
  return rows.flatMap((first, i) => rows.filter((_, j) => i !== j).map((second) => ({
    english: `${first[0]} ${second[0]}`,
    german: `${first[1].replace(/[.?]$/, "")}, érqiě ${second[1][0].toLowerCase()}${second[1].slice(1)}`,
    hint: `Link the ideas with érqiě (and also). ${hints[settings.level]} Tone marks are optional.`,
    vocabulary: [word(first), word(second)],
  })));
}
