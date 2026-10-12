import { Level, topics } from "./practice";

// Authored language for real tasks. Each line is English / German / a gloss
// for every German word. No combinatorial templates or artificial filler.
type Row = [english: string, german: string, glosses: string];
const rows = (text: string): Row[] => text.trim().split("\n").map(line => line.trim().split(" / ") as Row);
const bank: Record<Level, Row[][]> = {
  A1: [
    rows(`I need help. / Ich brauche Hilfe. / I|need|help
Where is the toilet? / Wo ist die Toilette? / where|is|the|toilet
I am cold. / Mir ist kalt. / to me|is|cold
I am tired. / Ich bin müde. / I|am|tired
I need a doctor. / Ich brauche einen Arzt. / I|need|a|doctor
My phone is broken. / Mein Handy ist kaputt. / my|phone|is|broken
I am looking for my keys. / Ich suche meine Schlüssel. / I|look for|my|keys
The door is locked. / Die Tür ist abgeschlossen. / the|door|is|locked
Can you help me? / Können Sie mir helfen? / can|you (formal)|me|help
I have an appointment today. / Ich habe heute einen Termin. / I|have|today|an|appointment`),
    rows(`Where is the station? / Wo ist der Bahnhof? / where|is|the|station
Where does this bus go? / Wohin fährt dieser Bus? / where to|goes|this|bus
Is this seat free? / Ist dieser Platz frei? / is|this|seat|free
I need two tickets. / Ich brauche zwei Fahrkarten. / I|need|two|tickets
How much does a ticket cost? / Wie viel kostet eine Fahrkarte? / how|much|costs|a|ticket
Where is the bus stop? / Wo ist die Bushaltestelle? / where|is|the|bus stop
I have a reservation. / Ich habe eine Reservierung. / I|have|a|reservation
I am looking for the hotel. / Ich suche das Hotel. / I|look for|the|hotel
When does the train leave? / Wann fährt der Zug ab? / when|departs (with ab)|the|train|away (with fährt)
I would like a taxi. / Ich möchte ein Taxi. / I|would like|a|taxi`),
    rows(`The bill, please. / Die Rechnung, bitte. / the|bill|please
A coffee, please. / Einen Kaffee, bitte. / a|coffee|please
I would like a tea. / Ich möchte einen Tee. / I|would like|a|tea
I am hungry. / Ich habe Hunger. / I|have|hunger
I am thirsty. / Ich habe Durst. / I|have|thirst
Without sugar, please. / Ohne Zucker, bitte. / without|sugar|please
Do you have oat milk? / Haben Sie Hafermilch? / have|you (formal)|oat milk
I do not eat meat. / Ich esse kein Fleisch. / I|eat|no|meat
Can I pay here? / Kann ich hier bezahlen? / can|I|here|pay
Is there a supermarket here? / Gibt es hier einen Supermarkt? / is there (with es)|it (with gibt)|here|a|supermarket`),
    rows(`I do not understand. / Ich verstehe das nicht. / I|understand|that|not
Please speak slowly. / Bitte sprechen Sie langsam. / please|speak|you (formal)|slowly
What does that mean? / Was bedeutet das? / what|means|that
How do you spell that? / Wie schreibt man das? / how|writes|one|that
I am new here. / Ich bin neu hier. / I|am|new|here
I need a pen. / Ich brauche einen Stift. / I|need|a|pen
When does the lesson start? / Wann beginnt der Unterricht? / when|starts|the|lesson
I have a break now. / Ich habe jetzt eine Pause. / I|have|now|a|break
I work until five today. / Ich arbeite heute bis fünf. / I|work|today|until|five
Can you repeat that? / Können Sie das wiederholen? / can|you (formal)|that|repeat`),
    rows(`What is your name? / Wie heißt du? / how|are called|you
My name is Anna. / Ich heiße Anna. / I|am called|Anna
Nice to meet you. / Schön, dich kennenzulernen. / nice|you|to meet
Where are you from? / Woher kommst du? / from where|come|you
I live in Berlin. / Ich wohne in Berlin. / I|live|in|Berlin
Do you have time tomorrow? / Hast du morgen Zeit? / have|you|tomorrow|time
See you tomorrow. / Bis morgen. / until|tomorrow
Thank you for your help. / Danke für deine Hilfe. / thanks|for|your|help
I am sorry. / Es tut mir leid. / it|does|to me|sorrow
How are you? / Wie geht es dir? / how|goes|it|to you`),
    rows(`I do not know. / Ich weiß es nicht. / I|know|it|not
That is too expensive. / Das ist zu teuer. / that|is|too|expensive
That is a good idea. / Das ist eine gute Idee. / that|is|a|good|idea
I need more time. / Ich brauche mehr Zeit. / I|need|more|time
I like that. / Das gefällt mir. / that|pleases|me
I do not like that. / Das gefällt mir nicht. / that|pleases|me|not
What do you think? / Was denkst du? / what|think|you
I am not sure. / Ich bin nicht sicher. / I|am|not|sure
That is fine with me. / Das passt für mich. / that|works|for|me
I have another question. / Ich habe noch eine Frage. / I|have|another (with eine)|a|question`),
  ],
  A2: [
    rows(`I would like to make an appointment. / Ich möchte einen Termin vereinbaren. / I|would like|an|appointment|arrange
The heating is not working. / Die Heizung funktioniert nicht. / the|heating|works|not
I have lost my wallet. / Ich habe meinen Geldbeutel verloren. / I|have (past tense helper)|my|wallet|lost
I need to pick up a parcel. / Ich muss ein Paket abholen. / I|must|a|parcel|pick up
Could you open the window? / Könnten Sie das Fenster öffnen? / could|you (formal)|the|window|open
Where can I buy this medicine? / Wo kann ich dieses Medikament kaufen? / where|can|I|this|medicine|buy
I have a headache. / Ich habe Kopfschmerzen. / I|have|headache
I would like to return this. / Ich möchte das zurückgeben. / I|would like|this|return
Could you send me the address? / Könnten Sie mir die Adresse schicken? / could|you (formal)|me|the|address|send
I cannot come today. / Ich kann heute nicht kommen. / I|can|today|not|come`),
    rows(`Do I have to change trains? / Muss ich umsteigen? / must|I|change trains
Which platform does the train leave from? / Von welchem Gleis fährt der Zug ab? / from|which|platform|departs (with ab)|the|train|away (with fährt)
Is breakfast included in the price? / Ist das Frühstück im Preis enthalten? / is|the|breakfast|in the|price|included
Can I leave my luggage here? / Kann ich mein Gepäck hier lassen? / can|I|my|luggage|here|leave
I would like to stay one more night. / Ich möchte noch eine Nacht bleiben. / I|would like|another (with eine)|a|night|stay
When do I have to check out? / Wann muss ich auschecken? / when|must|I|check out
I got on the wrong bus. / Ich bin in den falschen Bus eingestiegen. / I|have (past tense helper)|into|the|wrong|bus|got on
Is there a lift here? / Gibt es hier einen Aufzug? / is there (with es)|it (with gibt)|here|a|lift
Could you show me the way? / Könnten Sie mir den Weg zeigen? / could|you (formal)|me|the|way|show
How long does the journey take? / Wie lange dauert die Fahrt? / how|long|takes|the|journey`),
    rows(`Can we order now? / Können wir jetzt bestellen? / can|we|now|order
I would like something without milk. / Ich möchte etwas ohne Milch. / I|would like|something|without|milk
Can we pay separately? / Können wir getrennt bezahlen? / can|we|separately|pay
I ordered a different dish. / Ich habe ein anderes Gericht bestellt. / I|have (past tense helper)|a|different|dish|ordered
Could I have some more water? / Könnte ich noch etwas Wasser bekommen? / could|I|more|some|water|get
Can I take the rest home? / Kann ich den Rest mitnehmen? / can|I|the|rest|take away
Do you have a table for two? / Haben Sie einen Tisch für zwei Personen? / have|you (formal)|a|table|for|two|people
How much does a kilo cost? / Wie viel kostet ein Kilo? / how|much|costs|a|kilo
Where can I find the rice? / Wo finde ich den Reis? / where|find|I|the|rice
I do not need a bag. / Ich brauche keine Tüte. / I|need|no|bag`),
    rows(`Could you explain that again? / Könnten Sie das noch einmal erklären? / could|you (formal)|that|again (with einmal)|once|explain
I will be ten minutes late. / Ich komme zehn Minuten zu spät. / I|arrive|ten|minutes|too|late
I have not finished yet. / Ich bin noch nicht fertig. / I|am|yet|not|finished
Could you send me the file? / Könnten Sie mir die Datei schicken? / could|you (formal)|me|the|file|send
I cannot open the document. / Ich kann das Dokument nicht öffnen. / I|can|the|document|not|open
I would like to register for the course. / Ich möchte mich für den Kurs anmelden. / I|would like|myself|for|the|course|register
I have to leave earlier today. / Ich muss heute früher gehen. / I|must|today|earlier|leave
Is there any homework? / Gibt es Hausaufgaben? / is there (with es)|it (with gibt)|homework
Can we take a short break? / Können wir eine kurze Pause machen? / can|we|a|short|break|take
I am available on Monday. / Ich habe am Montag Zeit. / I|have|on|Monday|time`),
    rows(`Would you like to come along? / Möchtest du mitkommen? / would like|you|come along
Shall we meet at six? / Wollen wir uns um sechs treffen? / shall|we|each other|at|six|meet
I will call you later. / Ich rufe dich später an. / I|call (with an)|you|later|up (with rufe)
I had a lovely evening. / Ich hatte einen schönen Abend. / I|had|a|lovely|evening
Can I bring a friend? / Kann ich einen Freund mitbringen? / can|I|a|friend|bring along
Unfortunately, I have to cancel. / Leider muss ich absagen. / unfortunately|must|I|cancel
Happy birthday! / Alles Gute zum Geburtstag! / all|good things|for the|birthday
Thank you for the invitation. / Danke für die Einladung. / thanks|for|the|invitation
I hope you get well soon. / Ich hoffe, du wirst bald gesund. / I|hope|you|become|soon|healthy
Let me know when you are free. / Sag mir Bescheid, wenn du Zeit hast. / tell|me|notice (with sag: let me know)|when|you|time|have`),
    rows(`I would rather stay at home. / Ich würde lieber zu Hause bleiben. / I|would|rather|at|home|stay
I think that is too far away. / Ich finde das zu weit weg. / I|find|that|too|far|away
Can we try something else? / Können wir etwas anderes versuchen? / can|we|something|else|try
That sounds interesting. / Das klingt interessant. / that|sounds|interesting
I agree with you. / Ich stimme dir zu. / I|agree (with zu)|with you|with (with stimme)
I see it differently. / Ich sehe das anders. / I|see|that|differently
What would you recommend? / Was würdest du empfehlen? / what|would|you|recommend
I would like to think about it. / Ich möchte darüber nachdenken. / I|would like|about it|think
This is easier than I thought. / Das ist einfacher als gedacht. / that|is|easier|than|thought
I prefer the other option. / Ich mag die andere Möglichkeit lieber. / I|like|the|other|option|better`),
  ],
  B1: [
    rows(`Could you let me know when the repair is finished? / Könnten Sie mir Bescheid geben, wenn die Reparatur fertig ist? / could|you (formal)|me|notice (with geben: let me know)|give|when|the|repair|finished|is
I would like to reschedule my appointment because I am ill. / Ich möchte meinen Termin verschieben, weil ich krank bin. / I|would like|my|appointment|reschedule|because|I|ill|am
The parcel says delivered, but I have not received it. / Das Paket gilt als zugestellt, aber ich habe es nicht erhalten. / the|parcel|counts|as|delivered|but|I|have (past tense helper)|it|not|received`),
    rows(`Could you tell me where I need to change trains? / Könnten Sie mir sagen, wo ich umsteigen muss? / could|you (formal)|me|tell|where|I|change trains|must
I missed my connection because the train was delayed. / Ich habe meinen Anschluss verpasst, weil der Zug Verspätung hatte. / I|have (past tense helper)|my|connection|missed|because|the|train|delay|had
The room is too noisy, so I would like a different one. / Das Zimmer ist zu laut, deshalb möchte ich ein anderes. / the|room|is|too|noisy|therefore|would like|I|a|different one`),
    rows(`Could you check whether the sauce contains milk? / Könnten Sie prüfen, ob die Soße Milch enthält? / could|you (formal)|check|whether|the|sauce|milk|contains
We would like to sit outside if there is a free table. / Wir möchten draußen sitzen, wenn ein Tisch frei ist. / we|would like|outside|sit|if|a|table|free|is
I think there is a mistake on the bill. / Ich glaube, auf der Rechnung ist ein Fehler. / I|believe|on|the|bill|is|a|mistake`),
    rows(`Could we move the meeting to tomorrow? / Könnten wir die Besprechung auf morgen verschieben? / could|we|the|meeting|to|tomorrow|move
I need more information before I can start. / Ich brauche mehr Informationen, bevor ich anfangen kann. / I|need|more|information|before|I|start|can
I am not sure whether I have understood the task correctly. / Ich bin nicht sicher, ob ich die Aufgabe richtig verstanden habe. / I|am|not|sure|whether|I|the|task|correctly|understood|have (past tense helper)`),
    rows(`I enjoyed seeing you again after such a long time. / Ich habe mich gefreut, dich nach so langer Zeit wiederzusehen. / I|have (past tense helper)|myself|was pleased|you|after|such|long|time|to see again
Let me know if you need help with the move. / Sag mir Bescheid, wenn du Hilfe beim Umzug brauchst. / tell|me|notice (with sag: let me know)|if|you|help|with the|move|need
I cannot make it on Saturday, but Sunday would work. / Am Samstag kann ich nicht, aber Sonntag würde passen. / on|Saturday|can|I|not|but|Sunday|would|work`),
    rows(`I understand your point, but I have a different opinion. / Ich verstehe deinen Standpunkt, aber ich bin anderer Meinung. / I|understand|your|point of view|but|I|am|of a different|opinion
Could you explain why you prefer this option? / Könntest du erklären, warum du diese Möglichkeit bevorzugst? / could|you|explain|why|you|this|option|prefer
I would like to compare the prices before deciding. / Ich möchte die Preise vergleichen, bevor ich mich entscheide. / I|would like|the|prices|compare|before|I|myself|decide`),
  ],
  B2: [
    rows(`I would appreciate it if you could confirm the appointment in writing. / Ich wäre Ihnen dankbar, wenn Sie den Termin schriftlich bestätigen könnten. / I|would be|to you (formal)|grateful|if|you (formal)|the|appointment|in writing|confirm|could
The problem keeps occurring even though the device has been repaired. / Das Problem tritt weiterhin auf, obwohl das Gerät repariert wurde. / the|problem|occurs (with auf)|still|up (with tritt)|although|the|device|repaired|was
Could you explain which costs are covered by the insurance? / Könnten Sie erläutern, welche Kosten von der Versicherung übernommen werden? / could|you (formal)|explain|which|costs|by|the|insurance|covered|are`),
    rows(`If we had known about the cancellation, we would have taken the bus. / Wenn wir von der Absage gewusst hätten, hätten wir den Bus genommen. / if|we|about|the|cancellation|known|had|would have|we|the|bus|taken
I would like a refund because the service I booked was not provided. / Ich möchte eine Erstattung, da die gebuchte Leistung nicht erbracht wurde. / I|would like|a|refund|because|the|booked|service|not|provided|was
Could you confirm that the room is accessible without stairs? / Könnten Sie bestätigen, dass das Zimmer ohne Treppen erreichbar ist? / could|you (formal)|confirm|that|the|room|without|stairs|accessible|is`),
    rows(`I need to know whether the dish may contain traces of nuts. / Ich muss wissen, ob das Gericht Spuren von Nüssen enthalten kann. / I|must|know|whether|the|dish|traces|of|nuts|contain|may
We had reserved a table, but our reservation seems to have been lost. / Wir hatten einen Tisch reserviert, aber unsere Reservierung scheint verloren gegangen zu sein. / we|had|a|table|reserved|but|our|reservation|seems|lost|gone|to|be
Could you suggest a similar dish that does not contain dairy products? / Könnten Sie ein ähnliches Gericht empfehlen, das keine Milchprodukte enthält? / could|you (formal)|a|similar|dish|recommend|that|no|dairy products|contains`),
    rows(`I can meet the deadline provided I receive the data today. / Ich kann die Frist einhalten, sofern ich die Daten heute erhalte. / I|can|the|deadline|meet|provided|I|the|data|today|receive
Could we clarify who is responsible for each task? / Könnten wir klären, wer für welche Aufgabe zuständig ist? / could|we|clarify|who|for|which|task|responsible|is
I would have finished earlier if the requirements had been clearer. / Ich wäre früher fertig geworden, wenn die Anforderungen klarer gewesen wären. / I|would have|earlier|finished|become|if|the|requirements|clearer|been|had been`),
    rows(`I did not mean to interrupt you; please carry on. / Ich wollte dich nicht unterbrechen; bitte sprich weiter. / I|wanted|you|not|interrupt|please|speak|on
I would prefer it if we discussed this in private. / Mir wäre es lieber, wenn wir das unter vier Augen besprechen würden. / to me|would be|it|preferable|if|we|that|among|four|eyes (with unter vier: in private)|discuss|would
I am glad we cleared up the misunderstanding. / Ich bin froh, dass wir das Missverständnis geklärt haben. / I|am|glad|that|we|the|misunderstanding|cleared up|have (past tense helper)`),
    rows(`I see the advantages, but the costs still worry me. / Ich sehe die Vorteile, aber die Kosten bereiten mir weiterhin Sorgen. / I|see|the|advantages|but|the|costs|cause|me|still|concerns
Before we commit, we should consider the alternatives. / Bevor wir uns festlegen, sollten wir die Alternativen prüfen. / before|we|ourselves|commit|should|we|the|alternatives|consider
I am willing to compromise as long as we agree on the essentials. / Ich bin zu einem Kompromiss bereit, solange wir uns über das Wesentliche einig sind. / I|am|to|a|compromise|willing|as long as|we|ourselves|about|the|essentials|agreed|are`),
  ],
  C1: [
    rows(`Please provide an itemized breakdown of the additional charges. / Bitte stellen Sie mir eine detaillierte Aufschlüsselung der zusätzlichen Gebühren zur Verfügung. / please|provide (with zur Verfügung)|you (formal)|me|an|itemized|breakdown|of the|additional|charges|at the|disposal (with stellen: provide)
I would like to terminate the contract at the earliest possible date. / Ich möchte den Vertrag zum nächstmöglichen Zeitpunkt kündigen. / I|would like|the|contract|at the|earliest possible|date|terminate
Could you clarify whether my consent can be withdrawn at any time? / Könnten Sie klarstellen, ob meine Einwilligung jederzeit widerrufen werden kann? / could|you (formal)|clarify|whether|my|consent|at any time|withdrawn|be|can`),
    rows(`Please let me know what compensation I am entitled to for the delay. / Bitte teilen Sie mir mit, welche Entschädigung mir wegen der Verspätung zusteht. / please|inform (with mit)|you (formal)|me|with (with teilen)|which|compensation|to me|because of|the|delay|is entitled
I booked on the understanding that cancellation would be free. / Ich habe unter der Voraussetzung gebucht, dass die Stornierung kostenlos wäre. / I|have (past tense helper)|under|the|condition|booked|that|the|cancellation|free|would be
Could you arrange an alternative that does not involve an overnight stay? / Könnten Sie eine Alternative organisieren, die keine Übernachtung erfordert? / could|you (formal)|an|alternative|arrange|that|no|overnight stay|requires`),
    rows(`Please ensure that my meal is prepared separately to avoid cross-contamination. / Bitte stellen Sie sicher, dass mein Essen separat zubereitet wird, um Kreuzkontamination zu vermeiden. / please|make (with sicher)|you (formal)|sure|that|my|meal|separately|prepared|is|in order to (with zu)|cross-contamination|to|avoid
Could you specify which ingredients have been substituted? / Könnten Sie angeben, welche Zutaten ersetzt worden sind? / could|you (formal)|specify|which|ingredients|substituted|been|have been
I would appreciate advance notice if the menu changes. / Ich wäre Ihnen dankbar, wenn Sie mich vorab über Änderungen der Speisekarte informieren könnten. / I|would be|to you (formal)|grateful|if|you (formal)|me|in advance|about|changes|of the|menu|inform|could`),
    rows(`Could we agree on clear priorities before allocating resources? / Könnten wir uns auf klare Prioritäten einigen, bevor wir Ressourcen zuweisen? / could|we|ourselves|on|clear|priorities|agree|before|we|resources|allocate
I would like to raise a concern about the proposed timeline. / Ich möchte Bedenken hinsichtlich des vorgeschlagenen Zeitplans äußern. / I|would like|concerns|regarding|the|proposed|timeline|express
Please distinguish between what has been agreed and what is still under discussion. / Bitte unterscheiden Sie zwischen dem, was vereinbart wurde, und dem, was noch zur Diskussion steht. / please|distinguish|you (formal)|between|that|which|agreed|was|and|that|which|still|for the|discussion|stands`),
    rows(`I appreciate your honesty, even though the feedback was difficult to hear. / Ich schätze deine Ehrlichkeit, auch wenn das Feedback schwer zu hören war. / I|appreciate|your|honesty|even|though|the|feedback|difficult|to|hear|was
I would rather address the issue now than let resentment build up. / Ich würde das Problem lieber jetzt ansprechen, als Groll aufkommen zu lassen. / I|would|the|issue|rather|now|address|than|resentment|build up|to|let
Please do not take my silence as agreement. / Bitte verstehe mein Schweigen nicht als Zustimmung. / please|interpret|my|silence|not|as|agreement`),
    rows(`I support the aim, but I have reservations about how it would be implemented. / Ich unterstütze das Ziel, habe aber Vorbehalte hinsichtlich der Umsetzung. / I|support|the|aim|have|but|reservations|regarding|the|implementation
Could you explain what evidence this assumption is based on? / Könnten Sie erläutern, auf welche Belege sich diese Annahme stützt? / could|you (formal)|explain|on|which|evidence|itself|this|assumption|is based
I would reconsider my position if new information became available. / Ich würde meinen Standpunkt überdenken, falls neue Informationen vorliegen sollten. / I|would|my|position|reconsider|if|new|information|be available|should`),
  ],
  C2: [
    rows(`I dispute the charge on the grounds that no such service was authorized. / Ich bestreite die Forderung mit der Begründung, dass keine entsprechende Leistung genehmigt wurde. / I|dispute|the|charge|with|the|reason|that|no|such|service|authorized|was
Please confirm receipt without treating this as acceptance of the revised terms. / Bitte bestätigen Sie den Erhalt, ohne dies als Zustimmung zu den geänderten Bedingungen zu werten. / please|confirm|you (formal)|the|receipt|without|this|as|acceptance|of|the|revised|terms|to|treat
I would appreciate a solution that takes both the inconvenience and the costs incurred into account. / Ich wäre für eine Lösung dankbar, die sowohl die Unannehmlichkeiten als auch die entstandenen Kosten berücksichtigt. / I|would be|for|a|solution|grateful|that|both|the|inconvenience|as|well as|the|incurred|costs|takes into account`),
    rows(`Had the restriction been disclosed at booking, I would have chosen another route. / Wäre die Einschränkung bei der Buchung offengelegt worden, hätte ich eine andere Route gewählt. / had been|the|restriction|at|the|booking|disclosed|been|would have|I|an|other|route|chosen
I expect a comparable alternative without incurring additional costs. / Ich erwarte eine gleichwertige Alternative, ohne dass mir zusätzliche Kosten entstehen. / I|expect|a|comparable|alternative|without|that|to me|additional|costs|arise
Please explain why the stated exception does not apply in my case. / Bitte erläutern Sie, weshalb die genannte Ausnahme in meinem Fall nicht greift. / please|explain|you (formal)|why|the|stated|exception|in|my|case|not|applies`),
    rows(`Given the severity of the allergy, verbal reassurance alone is insufficient. / Angesichts der Schwere der Allergie reicht eine mündliche Zusicherung allein nicht aus. / given|the|severity|of the|allergy|is sufficient (with aus)|a|verbal|reassurance|alone|not|out (with reicht)
I would like the discrepancy between the advertised menu and the meal served to be addressed. / Ich möchte, dass die Abweichung zwischen der angekündigten Speisekarte und dem servierten Essen geklärt wird. / I|would like|that|the|discrepancy|between|the|advertised|menu|and|the|served|meal|addressed|is
Could you confirm that the preparation process meets the requirements we discussed? / Könnten Sie bestätigen, dass die Zubereitung den besprochenen Anforderungen entspricht? / could|you (formal)|confirm|that|the|preparation|the|discussed|requirements|meets`),
    rows(`I am happy to take responsibility, provided my authority matches the expectations placed on me. / Ich übernehme gern Verantwortung, sofern meine Befugnisse den an mich gestellten Erwartungen entsprechen. / I|take|gladly|responsibility|provided|my|authority|the|on|me|placed|expectations|matches
The current wording leaves room for interpretations that could undermine our agreement. / Die derzeitige Formulierung lässt Interpretationen zu, die unsere Vereinbarung untergraben könnten. / the|current|wording|allows (with zu)|interpretations|for (with lässt)|that|our|agreement|undermine|could
Could we document the outstanding points so that neither side relies on implicit assumptions? / Könnten wir die offenen Punkte dokumentieren, damit sich keine Seite auf stillschweigende Annahmen verlässt? / could|we|the|outstanding|points|document|so that|itself|neither|side|on|implicit|assumptions|relies`),
    rows(`I do not wish to reopen the dispute, but I do need us to acknowledge what happened. / Ich möchte den Streit nicht wieder aufrollen, aber ich brauche die Anerkennung dessen, was geschehen ist. / I|would like|the|dispute|not|again|reopen|but|I|need|the|acknowledgment|of that|which|happened|has (past tense helper)
Your intention may have been kind, but the effect on me was quite different. / Deine Absicht mag wohlwollend gewesen sein, doch die Wirkung auf mich war eine ganz andere. / your|intention|may|kind|been|be|but|the|effect|on|me|was|a|quite|different one
I would prefer an honest disagreement to an agreement made merely out of politeness. / Ein ehrlicher Widerspruch wäre mir lieber als eine Zustimmung aus bloßer Höflichkeit. / an|honest|disagreement|would be|to me|preferable|than|an|agreement|out of|mere|politeness`),
    rows(`I am open to revising my view, but the objection does not address my central concern. / Ich bin bereit, meine Ansicht zu revidieren, doch der Einwand geht nicht auf mein zentrales Anliegen ein. / I|am|willing|my|view|to|revise|but|the|objection|addresses (with ein)|not|on|my|central|concern|in (with geht)
Even if the proposal is feasible, that alone does not make it desirable. / Selbst wenn der Vorschlag umsetzbar ist, macht ihn das allein noch nicht wünschenswert. / even|if|the|proposal|feasible|is|makes|it|that|alone|yet|not|desirable
Let us distinguish between a genuine constraint and a preference presented as a necessity. / Lassen Sie uns zwischen einer tatsächlichen Einschränkung und einer als Notwendigkeit dargestellten Präferenz unterscheiden. / let|you (formal)|us|between|a|genuine|constraint|and|a|as|necessity|presented|preference|distinguish`),
  ],
};

export function practicalSentenceRows(level: Level, topic: string): Row[] {
  return bank[level][topics.indexOf(topic as (typeof topics)[number])] ?? [];
}
