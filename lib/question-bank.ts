import { Exercise, Language, Level, Settings, topics, sentenceVocabulary } from "./practice";
import { getChineseExercisePool } from "./chinese-bank";
import { connectedExercises } from "./connected-bank";

// Four authored situations per topic and level, plus four connected exercises
// per pool with explicit addition, contrast, reason and concession.
type Sentence = [english: string, german: string, word: string, meaning: string, glosses: string];
const sentences: Record<Level, Sentence[][]> = {
  A1: [
    [
      ["I drink a coffee every morning.", "Ich trinke jeden Morgen einen Kaffee.", "der Kaffee", "coffee", "I|drink|every|morning|a|coffee"],
      ["I buy bread in the evening.", "Ich kaufe am Abend Brot.", "das Brot", "bread", "I|buy|in the|evening|bread"],
      ["My apartment is small.", "Meine Wohnung ist klein.", "die Wohnung", "apartment", "my|apartment|is|small"],
      ["I go to bed at ten o'clock.", "Ich gehe um zehn Uhr ins Bett.", "das Bett", "bed", "I|go|at|ten|o'clock|into the|bed"],
    ],
    [
      ["I travel to Berlin by train.", "Ich fahre mit dem Zug nach Berlin.", "der Zug", "train", "I|travel|with|the|train|to|Berlin"],
      ["The hotel is near the station.", "Das Hotel ist in der Nähe des Bahnhofs.", "der Bahnhof", "station", "the|hotel|is|in|the|vicinity|of the|station"],
      ["I need a ticket.", "Ich brauche eine Fahrkarte.", "die Fahrkarte", "ticket", "I|need|a|ticket"],
      ["We visit a museum today.", "Wir besuchen heute ein Museum.", "das Museum", "museum", "we|visit|today|a|museum"],
    ],
    [
      ["I would like a glass of water.", "Ich möchte ein Glas Wasser.", "das Glas", "glass", "I|would like|a|glass|water"],
      ["The soup is hot.", "Die Suppe ist heiß.", "die Suppe", "soup", "the|soup|is|hot"],
      ["I eat an apple.", "Ich esse einen Apfel.", "der Apfel", "apple", "I|eat|an|apple"],
      ["The café opens at eight o'clock.", "Das Café öffnet um acht Uhr.", "öffnen", "to open", "the|café|opens|at|eight|o'clock"],
    ],
    [
      ["I learn German every day.", "Ich lerne jeden Tag Deutsch.", "lernen", "to learn", "I|learn|every|day|German"],
      ["My teacher is friendly.", "Mein Lehrer ist freundlich.", "der Lehrer", "teacher", "my|teacher|is|friendly"],
      ["We work in an office.", "Wir arbeiten in einem Büro.", "das Büro", "office", "we|work|in|an|office"],
      ["I write an email.", "Ich schreibe eine E-Mail.", "schreiben", "to write", "I|write|an|email"],
    ],
    [
      ["My sister lives in Hamburg.", "Meine Schwester wohnt in Hamburg.", "die Schwester", "sister", "my|sister|lives|in|Hamburg"],
      ["We listen to music.", "Wir hören Musik.", "die Musik", "music", "we|listen to|music"],
      ["My friend speaks German.", "Mein Freund spricht Deutsch.", "sprechen", "to speak", "my|friend|speaks|German"],
      ["The festival is on Saturday.", "Das Fest ist am Samstag.", "das Fest", "festival", "the|festival|is|on the|Saturday"],
    ],
    [
      ["I like this book.", "Ich mag dieses Buch.", "das Buch", "book", "I|like|this|book"],
      ["I find the film interesting.", "Ich finde den Film interessant.", "der Film", "film", "I|find|the|film|interesting"],
      ["Sport is important to me.", "Sport ist mir wichtig.", "wichtig", "important", "sport|is|to me|important"],
      ["I have a question.", "Ich habe eine Frage.", "die Frage", "question", "I|have|a|question"],
    ],
  ],
  A2: [
    [
      ["I cleaned my apartment yesterday.", "Ich habe gestern meine Wohnung geputzt.", "putzen", "to clean", "I|have (past tense helper)|yesterday|my|apartment|cleaned"],
      ["I have to do the shopping after work.", "Ich muss nach der Arbeit einkaufen.", "einkaufen", "to shop", "I|must|after|the|work|shop"],
      ["My neighbor helped me with the move.", "Mein Nachbar hat mir beim Umzug geholfen.", "der Umzug", "move", "my|neighbor|has (past tense helper)|me|with the|move|helped"],
      ["I usually get up earlier on weekdays.", "Ich stehe unter der Woche meistens früher auf.", "aufstehen", "to get up", "I|get (with auf: get up)|during|the|week|usually|earlier|up (with stehe)"],
    ],
    [
      ["We booked a room for two nights.", "Wir haben ein Zimmer für zwei Nächte gebucht.", "buchen", "to book", "we|have (past tense helper)|a|room|for|two|nights|booked"],
      ["I would like to rent a bicycle.", "Ich möchte ein Fahrrad mieten.", "mieten", "to rent", "I|would like|a|bicycle|to rent"],
      ["The train leaves in half an hour.", "Der Zug fährt in einer halben Stunde ab.", "abfahren", "to depart", "the|train|departs (with ab)|in|a|half|hour|away (with fährt)"],
      ["We walked through the old town yesterday.", "Wir sind gestern durch die Altstadt spaziert.", "die Altstadt", "old town", "we|have (past tense helper)|yesterday|through|the|old town|walked"],
    ],
    [
      ["I would like to pay by card.", "Ich möchte mit Karte bezahlen.", "bezahlen", "to pay", "I|would like|with|card|to pay"],
      ["We cooked pasta with vegetables yesterday.", "Wir haben gestern Nudeln mit Gemüse gekocht.", "das Gemüse", "vegetables", "we|have (past tense helper)|yesterday|pasta|with|vegetables|cooked"],
      ["The cake tastes better than the bread.", "Der Kuchen schmeckt besser als das Brot.", "schmecken", "to taste", "the|cake|tastes|better|than|the|bread"],
      ["I am looking for a table by the window.", "Ich suche einen Tisch am Fenster.", "das Fenster", "window", "I|look for|a|table|by the|window"],
    ],
    [
      ["I have to prepare for the exam.", "Ich muss mich auf die Prüfung vorbereiten.", "die Prüfung", "exam", "I|must|myself|for|the|exam|prepare"],
      ["My colleague explained the task to me.", "Meine Kollegin hat mir die Aufgabe erklärt.", "die Aufgabe", "task", "my|colleague|has (past tense helper)|to me|the|task|explained"],
      ["The course starts next Monday.", "Der Kurs beginnt nächsten Montag.", "beginnen", "to begin", "the|course|starts|next|Monday"],
      ["We discussed the project yesterday.", "Wir haben gestern über das Projekt gesprochen.", "das Projekt", "project", "we|have (past tense helper)|yesterday|about|the|project|talked"],
    ],
    [
      ["I invited my friends to dinner.", "Ich habe meine Freunde zum Abendessen eingeladen.", "einladen", "to invite", "I|have (past tense helper)|my|friends|to the|dinner|invited"],
      ["My brother is older than me.", "Mein Bruder ist älter als ich.", "älter", "older", "my|brother|is|older|than|I"],
      ["We met at a concert last week.", "Wir haben uns letzte Woche bei einem Konzert kennengelernt.", "kennenlernen", "to meet for the first time", "we|have (past tense helper)|each other|last|week|at|a|concert|met"],
      ["I often visit my grandparents on Sundays.", "Ich besuche sonntags oft meine Großeltern.", "die Großeltern", "grandparents", "I|visit|on Sundays|often|my|grandparents"],
    ],
    [
      ["I think we need more time.", "Ich denke, wir brauchen mehr Zeit.", "die Zeit", "time", "I|think|we|need|more|time"],
      ["I would rather read a book tonight.", "Ich würde heute Abend lieber ein Buch lesen.", "lieber", "rather", "I|would|this|evening|rather|a|book|read"],
      ["This idea sounds good to me.", "Diese Idee klingt für mich gut.", "klingen", "to sound", "this|idea|sounds|for|me|good"],
      ["I find learning languages useful.", "Ich finde es nützlich, Sprachen zu lernen.", "nützlich", "useful", "I|find|it|useful|languages|to|learn"],
    ],
  ],
  B1: [
    [
      ["I stay at home when it rains.", "Ich bleibe zu Hause, wenn es regnet.", "regnen", "to rain", "I|stay|at|home|when|it|rains"],
      ["I forgot to take out the rubbish.", "Ich habe vergessen, den Müll rauszubringen.", "der Müll", "rubbish", "I|have (past tense helper)|forgotten|the|rubbish|to take out"],
      ["My neighbor asked whether I could water her plants.", "Meine Nachbarin hat gefragt, ob ich ihre Pflanzen gießen könnte.", "gießen", "to water", "my|neighbor|has (past tense helper)|asked|whether|I|her|plants|water|could"],
      ["I have been living in this neighborhood for three years.", "Ich wohne seit drei Jahren in diesem Viertel.", "das Viertel", "neighborhood", "I|live|for (duration)|three|years|in|this|neighborhood"],
    ],
    [
      ["We missed the train because we left too late.", "Wir haben den Zug verpasst, weil wir zu spät losgefahren sind.", "verpassen", "to miss", "we|have (past tense helper)|the|train|missed|because|we|too|late|set off|have (past tense helper)"],
      ["I would like to know how much the journey costs.", "Ich möchte wissen, wie viel die Fahrt kostet.", "die Fahrt", "journey", "I|would like|to know|how|much|the|journey|costs"],
      ["The hotel where we stayed was very quiet.", "Das Hotel, in dem wir übernachtet haben, war sehr ruhig.", "übernachten", "to stay overnight", "the|hotel|in|which|we|stayed overnight|have (past tense helper)|was|very|quiet"],
      ["We decided to spend our holiday in the mountains.", "Wir haben beschlossen, unseren Urlaub in den Bergen zu verbringen.", "beschließen", "to decide", "we|have (past tense helper)|decided|our|holiday|in|the|mountains|to|spend"],
    ],
    [
      ["I prefer cooking at home because it is cheaper.", "Ich koche lieber zu Hause, weil es günstiger ist.", "günstig", "inexpensive", "I|cook|rather|at|home|because|it|cheaper|is"],
      ["The waiter recommended a dish without meat.", "Der Kellner hat ein Gericht ohne Fleisch empfohlen.", "empfehlen", "to recommend", "the|waiter|has (past tense helper)|a|dish|without|meat|recommended"],
      ["I would like to try something I have never eaten before.", "Ich möchte etwas probieren, das ich noch nie gegessen habe.", "probieren", "to try", "I|would like|something|to try|that|I|yet|never|eaten|have (past tense helper)"],
      ["We reserved a table so that we would not have to wait.", "Wir haben einen Tisch reserviert, damit wir nicht warten müssen.", "reservieren", "to reserve", "we|have (past tense helper)|a|table|reserved|so that|we|not|wait|must"],
    ],
    [
      ["I hope that I will pass the exam.", "Ich hoffe, dass ich die Prüfung bestehe.", "bestehen", "to pass", "I|hope|that|I|the|exam|pass"],
      ["My boss asked me to finish the report by Friday.", "Meine Chefin hat mich gebeten, den Bericht bis Freitag fertigzustellen.", "der Bericht", "report", "my|boss|has (past tense helper)|me|asked|the|report|by|Friday|to finish"],
      ["We learn faster when we practice regularly.", "Wir lernen schneller, wenn wir regelmäßig üben.", "regelmäßig", "regularly", "we|learn|faster|when|we|regularly|practice"],
      ["I am interested in a job that allows flexible hours.", "Ich interessiere mich für eine Stelle, die flexible Arbeitszeiten bietet.", "die Stelle", "job position", "I|am interested (with mich)|myself (with interessiere)|in|a|position|that|flexible|working hours|offers"],
    ],
    [
      ["I enjoy meeting people who have different experiences.", "Ich lerne gern Menschen kennen, die andere Erfahrungen haben.", "die Erfahrung", "experience", "I|meet (with kennen)|gladly|people|get to know (with lerne)|who|different|experiences|have"],
      ["We celebrate this tradition every year with our family.", "Wir feiern diese Tradition jedes Jahr mit unserer Familie.", "die Tradition", "tradition", "we|celebrate|this|tradition|every|year|with|our|family"],
      ["My friend told me that she grew up in Austria.", "Meine Freundin hat mir erzählt, dass sie in Österreich aufgewachsen ist.", "aufwachsen", "to grow up", "my|friend|has (past tense helper)|to me|told|that|she|in|Austria|grew up|has (past tense helper)"],
      ["I think it is important to listen to other people.", "Ich finde es wichtig, anderen Menschen zuzuhören.", "zuhören", "to listen", "I|find|it|important|other|people|to listen to"],
    ],
    [
      ["I believe that public transport should be cheaper.", "Ich glaube, dass öffentliche Verkehrsmittel günstiger sein sollten.", "das Verkehrsmittel", "means of transport", "I|believe|that|public|transport|cheaper|be|should"],
      ["I disagree because the proposal is too expensive.", "Ich bin anderer Meinung, weil der Vorschlag zu teuer ist.", "der Vorschlag", "proposal", "I|am|of a different|opinion|because|the|proposal|too|expensive|is"],
      ["It depends on how much time we have.", "Es hängt davon ab, wie viel Zeit wir haben.", "abhängen von", "to depend on", "it|depends (with ab)|on that|away (with hängt)|how|much|time|we|have"],
      ["I would change the rules if I could.", "Ich würde die Regeln ändern, wenn ich könnte.", "die Regel", "rule", "I|would|the|rules|change|if|I|could"],
    ],
  ],
  B2: [
    [
      ["Although I work from home, I maintain a clear daily routine.", "Obwohl ich von zu Hause aus arbeite, halte ich einen klaren Tagesablauf ein.", "der Tagesablauf", "daily routine", "although|I|from|at|home|from (with von … aus)|work|maintain (with ein)|I|a|clear|daily routine|up (with halte)"],
      ["The more organized my week is, the less stressed I feel.", "Je besser meine Woche organisiert ist, desto weniger gestresst fühle ich mich.", "organisieren", "to organize", "the (with desto: the more)|better|my|week|organized|is|the (with je: the less)|less|stressed|feel|I|myself"],
      ["I would have repaired the washing machine if I had had the tools.", "Ich hätte die Waschmaschine repariert, wenn ich das Werkzeug gehabt hätte.", "das Werkzeug", "tools", "I|would have|the|washing machine|repaired|if|I|the|tools|had|had (past tense helper)"],
      ["Instead of buying new furniture, we restored the old pieces.", "Anstatt neue Möbel zu kaufen, haben wir die alten Stücke restauriert.", "die Möbel", "furniture", "instead of|new|furniture|to|buy|have (past tense helper)|we|the|old|pieces|restored"],
    ],
    [
      ["Had we booked earlier, the flights would have been cheaper.", "Hätten wir früher gebucht, wären die Flüge günstiger gewesen.", "der Flug", "flight", "had|we|earlier|booked|would have been|the|flights|cheaper|been"],
      ["The journey was postponed due to an unexpected strike.", "Die Reise wurde wegen eines unerwarteten Streiks verschoben.", "der Streik", "strike", "the|journey|was (passive helper)|because of|an|unexpected|strike|postponed"],
      ["We chose accommodation that could be reached without a car.", "Wir haben eine Unterkunft gewählt, die ohne Auto erreichbar war.", "die Unterkunft", "accommodation", "we|have (past tense helper)|an|accommodation|chosen|that|without|car|reachable|was"],
      ["Despite the bad weather, the hike exceeded our expectations.", "Trotz des schlechten Wetters hat die Wanderung unsere Erwartungen übertroffen.", "übertreffen", "to exceed", "despite|the|bad|weather|has (past tense helper)|the|hike|our|expectations|exceeded"],
    ],
    [
      ["The restaurant places great importance on regional ingredients.", "Das Restaurant legt großen Wert auf regionale Zutaten.", "die Zutat", "ingredient", "the|restaurant|places|great|value|on|regional|ingredients"],
      ["If I had known about the allergy, I would have changed the recipe.", "Wenn ich von der Allergie gewusst hätte, hätte ich das Rezept geändert.", "das Rezept", "recipe", "if|I|about|the|allergy|known|had (past tense helper)|would have|I|the|recipe|changed"],
      ["The less food we waste, the more money we save.", "Je weniger Lebensmittel wir verschwenden, desto mehr Geld sparen wir.", "verschwenden", "to waste", "the (with desto: the less)|less|food|we|waste|the (with je: the more)|more|money|save|we"],
      ["I prefer meals that can be prepared in advance.", "Ich bevorzuge Gerichte, die im Voraus zubereitet werden können.", "im Voraus", "in advance", "I|prefer|dishes|that|in|advance|prepared|be (passive helper)|can"],
    ],
    [
      ["The deadline was extended so that everyone could revise their work.", "Die Frist wurde verlängert, damit alle ihre Arbeit überarbeiten konnten.", "die Frist", "deadline", "the|deadline|was (passive helper)|extended|so that|everyone|their|work|revise|could"],
      ["I would accept the position provided that the hours were flexible.", "Ich würde die Stelle annehmen, vorausgesetzt, die Arbeitszeiten wären flexibel.", "vorausgesetzt", "provided that", "I|would|the|position|accept|provided that|the|working hours|were|flexible"],
      ["The project requires both technical knowledge and patience.", "Das Projekt erfordert sowohl Fachwissen als auch Geduld.", "das Fachwissen", "specialist knowledge", "the|project|requires|both|specialist knowledge|as (with auch: and)|also (with als)|patience"],
      ["Instead of memorizing everything, I try to understand the connections.", "Anstatt alles auswendig zu lernen, versuche ich, die Zusammenhänge zu verstehen.", "der Zusammenhang", "connection", "instead of|everything|by heart|to|learn|try|I|the|connections|to|understand"],
    ],
    [
      ["Cultural differences can lead to misunderstandings if they are ignored.", "Kulturelle Unterschiede können zu Missverständnissen führen, wenn sie ignoriert werden.", "das Missverständnis", "misunderstanding", "cultural|differences|can|to|misunderstandings|lead|if|they|ignored|are (passive helper)"],
      ["Although we grew up in different countries, we share many values.", "Obwohl wir in verschiedenen Ländern aufgewachsen sind, teilen wir viele Werte.", "der Wert", "value", "although|we|in|different|countries|grew up|have (past tense helper)|share|we|many|values"],
      ["The exhibition encouraged visitors to question their assumptions.", "Die Ausstellung regte die Besucher dazu an, ihre Annahmen zu hinterfragen.", "hinterfragen", "to question critically", "the|exhibition|encouraged (with an)|the|visitors|to do so|on (with regte)|their|assumptions|to|question"],
      ["Traditions change as society develops.", "Traditionen verändern sich, während sich die Gesellschaft weiterentwickelt.", "die Gesellschaft", "society", "traditions|change|themselves|while|the|society|itself|develops"],
    ],
    [
      ["The proposal is convincing, even though some details remain unclear.", "Der Vorschlag ist überzeugend, auch wenn einige Einzelheiten unklar bleiben.", "überzeugend", "convincing", "the|proposal|is|convincing|even|if|some|details|unclear|remain"],
      ["Whether this approach succeeds depends on its implementation.", "Ob dieser Ansatz erfolgreich ist, hängt von seiner Umsetzung ab.", "die Umsetzung", "implementation", "whether|this|approach|successful|is|depends (with ab)|on|its|implementation|away (with hängt)"],
      ["We should consider the consequences before making a decision.", "Wir sollten die Folgen berücksichtigen, bevor wir eine Entscheidung treffen.", "berücksichtigen", "to consider", "we|should|the|consequences|consider|before|we|a|decision|make"],
      ["The advantages outweigh the disadvantages in my opinion.", "Meiner Meinung nach überwiegen die Vorteile die Nachteile.", "überwiegen", "to outweigh", "in my|opinion|according to|outweigh|the|advantages|the|disadvantages"],
    ],
  ],
  C1: [
    [
      ["Only when my routine was disrupted did I realize how much I relied on it.", "Erst als mein Tagesablauf durcheinandergeriet, wurde mir bewusst, wie sehr ich mich darauf verließ.", "sich verlassen auf", "to rely on", "only|when|my|daily routine|was disrupted|became|to me|apparent|how|much|I|myself|on it|relied"],
      ["Given the rising rents, moving seems increasingly unavoidable.", "Angesichts der steigenden Mieten erscheint ein Umzug zunehmend unvermeidlich.", "unvermeidlich", "unavoidable", "given|the|rising|rents|appears|a|move|increasingly|unavoidable"],
      ["What matters to me is having enough freedom despite my obligations.", "Worauf es mir ankommt, ist, trotz meiner Verpflichtungen genügend Freiraum zu haben.", "der Freiraum", "freedom", "what (with ankommt: what matters)|it|to me|matters|is|despite|my|obligations|enough|freedom|to|have"],
      ["The assumption that convenience always improves our lives deserves scrutiny.", "Die Annahme, dass Bequemlichkeit unser Leben stets verbessert, verdient eine kritische Prüfung.", "die Bequemlichkeit", "convenience", "the|assumption|that|convenience|our|life|always|improves|deserves|a|critical|examination"],
    ],
    [
      ["The appeal of the destination lies less in its sights than in its atmosphere.", "Der Reiz des Reiseziels liegt weniger in seinen Sehenswürdigkeiten als in seiner Atmosphäre.", "der Reiz", "appeal", "the|appeal|of the|destination|lies|less|in|its|sights|than|in|its|atmosphere"],
      ["Considering the environmental impact, the trip can hardly be justified.", "In Anbetracht der Umweltauswirkungen lässt sich die Reise kaum rechtfertigen.", "rechtfertigen", "to justify", "in|consideration|of the|environmental impacts|can (with sich)|itself (with lässt)|the|journey|hardly|be justified"],
      ["What had been advertised as an adventure turned out to be a logistical challenge.", "Was als Abenteuer beworben worden war, entpuppte sich als logistische Herausforderung.", "sich entpuppen als", "to turn out to be", "what|as|adventure|advertised|been (passive helper)|had|turned out (with sich)|itself|as|logistical|challenge"],
      ["Traveling independently requires a willingness to cope with uncertainty.", "Selbstständiges Reisen setzt die Bereitschaft voraus, mit Unsicherheit umzugehen.", "voraussetzen", "to require", "independent|travel|requires (with voraus)|the|willingness|beforehand (with setzt)|with|uncertainty|to cope"],
    ],
    [
      ["The claim that healthy eating is necessarily expensive is too simplistic.", "Die Behauptung, dass gesunde Ernährung zwangsläufig teuer sei, ist zu vereinfachend.", "zwangsläufig", "necessarily", "the|claim|that|healthy|eating|necessarily|expensive|is (reported speech)|is|too|simplistic"],
      ["The chef succeeded in reinterpreting traditional dishes without losing their character.", "Dem Koch gelang es, traditionelle Gerichte neu zu interpretieren, ohne ihren Charakter zu verlieren.", "gelingen", "to succeed", "the|chef|succeeded|it|traditional|dishes|newly|to|interpret|without|their|character|to|lose"],
      ["In view of limited resources, reducing food waste should take priority.", "Angesichts begrenzter Ressourcen sollte die Verringerung von Lebensmittelverschwendung Vorrang haben.", "der Vorrang", "priority", "given|limited|resources|should|the|reduction|of|food waste|priority|have"],
      ["Whether a restaurant is sustainable cannot be judged from its menu alone.", "Ob ein Restaurant nachhaltig ist, lässt sich nicht allein anhand seiner Speisekarte beurteilen.", "beurteilen", "to judge", "whether|a|restaurant|sustainable|is|can (with sich)|itself (with lässt)|not|alone|on the basis of|its|menu|be judged"],
    ],
    [
      ["The extent to which remote work improves productivity remains disputed.", "Inwieweit Fernarbeit die Produktivität steigert, bleibt umstritten.", "umstritten", "disputed", "to what extent|remote work|the|productivity|increases|remains|disputed"],
      ["The manager emphasized that the proposed measures were merely provisional.", "Die Führungskraft betonte, die vorgeschlagenen Maßnahmen seien lediglich vorläufig.", "vorläufig", "provisional", "the|manager|emphasized|the|proposed|measures|were (reported speech)|merely|provisional"],
      ["It is essential to distinguish between a lack of knowledge and a lack of motivation.", "Es ist wesentlich, zwischen mangelndem Wissen und mangelnder Motivation zu unterscheiden.", "unterscheiden", "to distinguish", "it|is|essential|between|lacking|knowledge|and|lacking|motivation|to|distinguish"],
      ["Had the concerns been taken seriously, the conflict could have been avoided.", "Wären die Bedenken ernst genommen worden, hätte der Konflikt vermieden werden können.", "die Bedenken", "concerns", "had been|the|concerns|seriously|taken|been (passive helper)|would have|the|conflict|avoided|be (passive helper)|could"],
    ],
    [
      ["Cultural identity cannot be reduced to a single set of traditions.", "Kulturelle Identität lässt sich nicht auf eine einzige Reihe von Traditionen reduzieren.", "reduzieren auf", "to reduce to", "cultural|identity|can (with sich)|itself (with lässt)|not|to|a|single|set|of|traditions|be reduced"],
      ["The exhibition raises the question of who gets to define collective memory.", "Die Ausstellung wirft die Frage auf, wer das kollektive Gedächtnis bestimmen darf.", "das Gedächtnis", "memory", "the|exhibition|raises (with auf)|the|question|up (with wirft)|who|the|collective|memory|define|may"],
      ["Mutual understanding presupposes a willingness to examine one's own prejudices.", "Gegenseitiges Verständnis setzt die Bereitschaft voraus, die eigenen Vorurteile zu hinterfragen.", "das Vorurteil", "prejudice", "mutual|understanding|presupposes (with voraus)|the|willingness|beforehand (with setzt)|the|own|prejudices|to|question"],
      ["The author argues that belonging need not imply conformity.", "Die Autorin vertritt die Ansicht, dass Zugehörigkeit nicht zwangsläufig Anpassung bedeuten müsse.", "die Zugehörigkeit", "belonging", "the|author|holds|the|view|that|belonging|not|necessarily|conformity|imply|must (reported speech)"],
    ],
    [
      ["The argument is plausible insofar as it accounts for the available evidence.", "Das Argument ist insofern plausibel, als es die verfügbaren Belege berücksichtigt.", "der Beleg", "evidence", "the|argument|is|insofar|plausible|as|it|the|available|evidence|accounts for"],
      ["It would be premature to draw definitive conclusions from these findings.", "Es wäre verfrüht, aus diesen Ergebnissen endgültige Schlussfolgerungen zu ziehen.", "die Schlussfolgerung", "conclusion", "it|would be|premature|from|these|findings|definitive|conclusions|to|draw"],
      ["Even if the intention is commendable, the means remain questionable.", "Selbst wenn die Absicht lobenswert ist, bleiben die Mittel fragwürdig.", "fragwürdig", "questionable", "even|if|the|intention|commendable|is|remain|the|means|questionable"],
      ["The burden of proof lies with those who advocate this change.", "Die Beweislast liegt bei denjenigen, die diese Änderung befürworten.", "die Beweislast", "burden of proof", "the|burden of proof|lies|with|those|who|this|change|advocate"],
    ],
  ],
  C2: [
    [
      ["The supposed liberation from routine often amounts to exchanging one constraint for another.", "Die vermeintliche Befreiung vom Alltag läuft oft darauf hinaus, einen Zwang gegen einen anderen einzutauschen.", "hinauslaufen auf", "to amount to", "the|supposed|liberation|from the|daily routine|amounts (with hinaus)|often|to that|out (with läuft)|a|constraint|for|another|one|to exchange"],
      ["However trivial these habits may seem, their cumulative effect should not be underestimated.", "So belanglos diese Gewohnheiten auch erscheinen mögen, ihre kumulative Wirkung sollte nicht unterschätzt werden.", "belanglos", "trivial", "however|trivial|these|habits|also (with so … auch)|seem|may|their|cumulative|effect|should|not|underestimated|be (passive helper)"],
      ["The relentless pursuit of efficiency risks depriving everyday life of its spontaneity.", "Das unablässige Streben nach Effizienz droht den Alltag seiner Spontaneität zu berauben.", "berauben", "to deprive", "the|relentless|pursuit|of|efficiency|threatens|the|everyday life|of its|spontaneity|to|deprive"],
      ["The fact that a compromise is practical does not make it any less regrettable.", "Dass ein Kompromiss praktikabel ist, macht ihn nicht weniger bedauerlich.", "bedauerlich", "regrettable", "that|a|compromise|practical|is|makes|it|not|less|regrettable"],
    ],
    [
      ["The promise of unspoiled authenticity is undermined by the very tourism it attracts.", "Das Versprechen unberührter Authentizität wird durch eben jenen Tourismus untergraben, den es anzieht.", "untergraben", "to undermine", "the|promise|of unspoiled|authenticity|is (passive helper)|by|precisely|that|tourism|undermined|which|it|attracts"],
      ["Far from broadening one's horizons automatically, travel can reinforce existing prejudices.", "Weit davon entfernt, den Horizont automatisch zu erweitern, kann Reisen bestehende Vorurteile verfestigen.", "verfestigen", "to reinforce", "far|from that|removed|the|horizon|automatically|to|broaden|can|travel|existing|prejudices|reinforce"],
      ["However meticulously the expedition had been planned, unforeseen contingencies proved decisive.", "So akribisch die Expedition auch geplant worden war, unvorhergesehene Umstände erwiesen sich als ausschlaggebend.", "ausschlaggebend", "decisive", "however|meticulously|the|expedition|also (with so … auch)|planned|been (passive helper)|had|unforeseen|circumstances|proved|themselves|as|decisive"],
      ["The attraction of remoteness lies precisely in its resistance to effortless accessibility.", "Der Reiz der Abgeschiedenheit liegt gerade darin, dass sie sich einer mühelosen Erreichbarkeit widersetzt.", "die Abgeschiedenheit", "remoteness", "the|appeal|of the|remoteness|lies|precisely|in that|that|it|itself|an|effortless|accessibility|resists"],
    ],
    [
      ["The rhetoric of ethical consumption obscures the structural inequalities underpinning food production.", "Die Rhetorik des ethischen Konsums verschleiert die strukturellen Ungleichheiten, die der Lebensmittelproduktion zugrunde liegen.", "zugrunde liegen", "to underpin", "the|rhetoric|of the|ethical|consumption|obscures|the|structural|inequalities|that|the|food production|at the foundation (with liegen)|underlie"],
      ["To dismiss culinary innovation as mere fashion is to overlook its capacity for cultural dialogue.", "Kulinarische Innovation als bloße Mode abzutun heißt, ihr Potenzial für kulturellen Dialog zu verkennen.", "verkennen", "to fail to recognize", "culinary|innovation|as|mere|fashion|to dismiss|means|its|capacity|for|cultural|dialogue|to|fail to recognize"],
      ["Were affordability the sole criterion, the debate on sustainable nutrition would be considerably simpler.", "Wäre Erschwinglichkeit das einzige Kriterium, wäre die Debatte über nachhaltige Ernährung erheblich einfacher.", "die Erschwinglichkeit", "affordability", "were|affordability|the|sole|criterion|would be|the|debate|about|sustainable|nutrition|considerably|simpler"],
      ["The dish owes its subtlety as much to restraint as to the sophistication of its ingredients.", "Das Gericht verdankt seine Raffinesse ebenso der Zurückhaltung wie der Ausgefeiltheit seiner Zutaten.", "die Zurückhaltung", "restraint", "the|dish|owes|its|subtlety|equally|the|restraint|as|the|sophistication|of its|ingredients"],
    ],
    [
      ["The insistence on measurable outcomes belies the inherently unpredictable nature of learning.", "Das Beharren auf messbaren Ergebnissen wird der grundsätzlich unvorhersehbaren Natur des Lernens nicht gerecht.", "das Beharren", "insistence", "the|insistence|on|measurable|outcomes|does (with gerecht: does justice)|the|inherently|unpredictable|nature|of the|learning|not|justice (with wird)"],
      ["Had dissent not been equated with disloyalty, the organization might have averted its crisis.", "Wäre Widerspruch nicht mit Illoyalität gleichgesetzt worden, hätte die Organisation ihre Krise womöglich abwenden können.", "abwenden", "to avert", "had been|dissent|not|with|disloyalty|equated|been (passive helper)|would have|the|organization|its|crisis|possibly|avert|could"],
      ["What passes for meritocracy may in fact perpetuate entrenched privilege.", "Was als Leistungsgesellschaft gilt, kann in Wirklichkeit verfestigte Privilegien fortschreiben.", "fortschreiben", "to perpetuate", "what|as|meritocracy|passes|can|in|reality|entrenched|privileges|perpetuate"],
      ["The proposal is not without merit, albeit contingent on assumptions that remain unsubstantiated.", "Der Vorschlag hat durchaus seine Vorzüge, beruht allerdings auf Annahmen, die bislang unbelegt bleiben.", "unbelegt", "unsubstantiated", "the|proposal|has|certainly|its|merits|rests|however|on|assumptions|that|so far|unsubstantiated|remain"],
    ],
    [
      ["The invocation of tradition can serve to legitimize practices that would otherwise be indefensible.", "Die Berufung auf Tradition kann dazu dienen, Praktiken zu legitimieren, die andernfalls nicht zu rechtfertigen wären.", "die Berufung auf", "invocation of", "the|invocation|of|tradition|can|for that purpose|serve|practices|to|legitimize|that|otherwise|not|to|justify|would be"],
      ["However well intentioned, the portrayal risks reducing a diverse community to a convenient stereotype.", "So gut gemeint die Darstellung auch sein mag, sie droht eine vielfältige Gemeinschaft auf ein bequemes Klischee zu reduzieren.", "das Klischee", "stereotype", "however|well|intentioned|the|portrayal|also (with so … auch)|be|may|it|threatens|a|diverse|community|to|a|convenient|stereotype|to|reduce"],
      ["To acknowledge historical injustice is neither to deny progress nor to relinquish critical judgment.", "Historisches Unrecht anzuerkennen bedeutet weder, Fortschritt zu leugnen, noch, auf kritisches Urteilsvermögen zu verzichten.", "das Urteilsvermögen", "judgment", "historical|injustice|to acknowledge|means|neither|progress|to|deny|nor|on|critical|judgment|to|relinquish"],
      ["The tension between individual autonomy and collective belonging resists any definitive resolution.", "Das Spannungsverhältnis zwischen individueller Autonomie und kollektiver Zugehörigkeit entzieht sich einer endgültigen Auflösung.", "sich entziehen", "to resist or elude", "the|tension|between|individual|autonomy|and|collective|belonging|eludes|itself (with entzieht)|a|definitive|resolution"],
    ],
    [
      ["The apparent inevitability of this conclusion stems from premises that have never been adequately scrutinized.", "Die scheinbare Unausweichlichkeit dieser Schlussfolgerung ergibt sich aus Prämissen, die nie hinreichend geprüft worden sind.", "die Prämisse", "premise", "the|apparent|inevitability|of this|conclusion|arises|itself (with ergibt)|from|premises|that|never|adequately|scrutinized|been (passive helper)|have (past tense helper)"],
      ["Be that as it may, the objection does not invalidate the argument in its entirety.", "Wie dem auch sei, der Einwand entkräftet das Argument nicht in seiner Gesamtheit.", "entkräften", "to invalidate", "how|that|also|may be|the|objection|invalidates|the|argument|not|in|its|entirety"],
      ["To conflate correlation with causation is to mistake a pattern for an explanation.", "Korrelation mit Kausalität gleichzusetzen heißt, ein Muster mit einer Erklärung zu verwechseln.", "gleichsetzen", "to equate", "correlation|with|causation|to equate|means|a|pattern|with|an|explanation|to|confuse"],
      ["The strength of the position lies not in its certainty but in its openness to revision.", "Die Stärke der Position liegt nicht in ihrer Gewissheit, sondern in ihrer Offenheit für Revisionen.", "die Gewissheit", "certainty", "the|strength|of the|position|lies|not|in|its|certainty|but|in|its|openness|to|revisions"],
    ],
  ],
};

const levelHints: Record<Level, string> = {
  A1: "Keep the conjugated verb in second position. Check noun articles and the accusative after verbs such as kaufen or trinken.",
  A2: "Watch separable verbs and modal verbs: the second verb goes at the end. In the perfect tense, use haben or sein with a past participle.",
  B1: "In subordinate clauses introduced by weil, dass, wenn or ob, the conjugated verb goes at the end.",
  B2: "Check subordinate-clause word order and passive forms. For unreal past situations, use hätte or wäre with a past participle.",
  C1: "Preserve the nuance of the claim. Pay attention to reported speech, precise linking expressions and complex clause order.",
  C2: "Aim for idiomatic precision: preserve qualifications, emphasis and the relationship between the clauses.",
};

function single(row: Sentence, level: Level): Exercise {
  return {
    english: row[0],
    german: row[1],
    hint: `${levelHints[level]} Useful expression: ${row[2]} (${row[3]}).`,
    vocabulary: sentenceVocabulary(row[1], row[4]),
  };
}

export function getExercisePool(settings: Settings): Exercise[] {
  if (settings.language === "chinese") return getChineseExercisePool(settings);
  const rows = sentences[settings.level][topics.indexOf(settings.topic as (typeof topics)[number])];
  if (!rows) throw new Error("Choose valid practice settings.");
  if (settings.format === "single") return rows.map((row) => single(row, settings.level));
  return connectedExercises(settings, single(rows[0], settings.level), single(rows[1], settings.level));
}

export function pickExercise(settings: Settings, previous: string[] = []): Exercise {
  const pool = getExercisePool(settings);
  const unseen = pool.filter((item) => !previous.includes(item.english));
  if (unseen.length) return unseen[Math.floor(Math.random() * unseen.length)];
  // After exhausting a pool, revisit the least recently seen prompt rather
  // than repeating the current one. Retain history across settings changes.
  return pool.reduce((oldest, item) =>
    previous.lastIndexOf(item.english) < previous.lastIndexOf(oldest.english) ? item : oldest,
  );
}

export function normalizeAnswer(answer: string, language: Language = "german") {
  if (language === "chinese") {
    return answer.toLowerCase().normalize("NFD")
      .replace(/u\u0308/g, "v").replace(/u:/g, "v")
      .replace(/[\u0300-\u036f]/g, "").replace(/v/g, "u")
      .replace(/([a-z])[1-5]/g, "$1")
      .replace(/[\s.,!?;:'’“”"，。！？；：]+/g, "");
  }
  return answer.normalize("NFC").trim().toLocaleLowerCase("de")
    .replace(/[.!?]+$/, "").replace(/\s+/g, " ");
}
