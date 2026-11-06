// Deutsch — Rechtstexte (Roadmap Punkt 5, Phase 5.2).
// Übersetzung der en-GB-Quelle; die Blockstruktur muss übereinstimmen
// (geprüft durch `npm run i18n:check`).

import type {LegalCatalog} from './types';

const de: LegalCatalog = {
  terms: {
    id: 'terms',
    title: 'Nutzungsbedingungen',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Wer wir sind'},
      {
        type: 'paragraph',
        text: 'Nutribio („Nutribio“, „wir“) wird von [CONTROLLER_NAME], [CONTROLLER_ADDRESS] betrieben. Du erreichst uns unter [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. Der Dienst'},
      {
        type: 'paragraph',
        text: 'Nutribio erstellt wöchentliche Ernährungspläne aus den Angaben, die du machst — Profil, Ziel und Ernährungseinschränkungen — und, wenn du sie erfasst, aus Bioimpedanz-Messungen. Die Nährwertberechnungen sind deterministisch; Gerichte, Portionen und Einkaufsliste werden von einem Modell der künstlichen Intelligenz (Google Gemini) auf Basis dieser Berechnungen erzeugt.',
      },
      {
        type: 'paragraph',
        text: 'Nutribio ist ein Hilfsmittel für gesunde Erwachsene. Es ist kein Medizinprodukt und bietet keine medizinische oder ernährungswissenschaftliche Beratung — siehe den Gesundheitshinweis.',
      },
      {type: 'heading', text: '3. Wer ihn nutzen darf'},
      {
        type: 'paragraph',
        text: 'Du musst mindestens 18 Jahre alt und geschäftsfähig sein. Du darfst Nutribio nicht ohne Erlaubnis im Namen einer anderen Person nutzen.',
      },
      {type: 'heading', text: '4. Dein Konto'},
      {
        type: 'paragraph',
        text: 'Du erstellst ein Konto mit einer E-Mail-Adresse und einem Passwort. Du musst korrekte Angaben machen, dein Passwort geheim halten und uns sofort informieren, wenn du einen unbefugten Zugriff vermutest. Du bist für die Aktivitäten unter deinem Konto verantwortlich.',
      },
      {type: 'heading', text: '5. Zulässige Nutzung'},
      {type: 'paragraph', text: 'Du verpflichtest dich, nicht:'},
      {
        type: 'list',
        items: [
          'den Dienst missbräuchlich zu nutzen oder auf Daten anderer Nutzer zuzugreifen;',
          'den Dienst zu kopieren, automatisiert auszulesen, zurückzuentwickeln oder weiterzuverkaufen;',
          'den Dienst zu nutzen, um gegen Gesetze oder Rechte Dritter zu verstoßen;',
          'zu versuchen, das KI-Modell zu manipulieren, Grenzen zu umgehen oder das Gratis-Kontingent zu umgehen;',
          'rechtswidrige Inhalte oder Inhalte hochzuladen, an denen du keine Rechte hast.',
        ],
      },
      {type: 'heading', text: '6. KI-generierte Inhalte'},
      {
        type: 'paragraph',
        text: 'Die Pläne werden von einem Modell erzeugt und können Fehler oder Näherungen enthalten: Kalorien- und Makronährstoffwerte sind Schätzungen, Portionen können abweichen und die Verfügbarkeit von Produkten hängt von deinem Land und deinem Supermarkt ab. Du musst Zutaten und Allergene selbst prüfen, besonders bei einer Allergie oder Unverträglichkeit. Die Einkaufsliste ist ein Vorschlag, der alle Varianten der Woche abdeckt — kaufe nur, was du kochen willst.',
      },
      {type: 'heading', text: '7. Pläne, Preise und Abonnement'},
      {
        type: 'paragraph',
        text: 'Jedes Konto hat eine kostenlose Planerstellung. Danach erfordert die Erstellung eines Plans ein aktives Monatsabonnement. Ein Jahresabonnement gibt es nicht. Preise, Währungen (EUR oder BRL je nach Land) und Steuern werden vor der Zahlung an der Kasse angezeigt.',
      },
      {
        type: 'paragraph',
        text: 'Das Abonnement verlängert sich automatisch jeden Monat, bis du kündigst. Du kannst jederzeit im Kundenportal kündigen; die Kündigung wirkt zum Ende des laufenden bezahlten Zeitraums, bis dahin bleibt der Zugang bestehen. Wir können den Preis mit einer Frist von mindestens 30 Tagen ändern; wenn du die Änderung nicht akzeptierst, kannst du vorher kündigen.',
      },
      {
        type: 'paragraph',
        text: 'Zahlungen werden von unserem Zahlungsdienstleister verarbeitet, der als Verkäufer (Merchant of Record) der Transaktion auftritt. Deine Kartendaten erreichen unsere Server nie.',
      },
      {type: 'heading', text: '8. Widerrufsrecht'},
      {
        type: 'paragraph',
        text: 'Wenn du Verbraucher in der Europäischen Union bist, hast du 14 Tage, um einen Vertrag über digitale Inhalte zu widerrufen. Indem du uns bittest, den Dienst sofort zu beginnen, erkennst du an, dass du dieses Recht verlierst, sobald der Inhalt bereitgestellt wurde (also sobald der Plan erstellt wurde). Wenn du Verbraucher in Brasilien bist, gibt dir Artikel 49 des Verbraucherschutzgesetzbuchs 7 Tage, um einen außerhalb eines Ladengeschäfts getätigten Kauf zu widerrufen.',
      },
      {type: 'paragraph', text: 'Um diese Rechte auszuüben, schreibe an [CONTACT_EMAIL].'},
      {type: 'heading', text: '9. Geistiges Eigentum'},
      {
        type: 'paragraph',
        text: 'Die App, ihre Texte und ihr Design gehören uns oder unseren Lizenzgebern. Deine Daten gehören dir. Die für dich erstellten Pläne sind für den persönlichen Gebrauch bestimmt; du darfst sie teilen, aber nicht verkaufen oder kommerziell nutzen.',
      },
      {type: 'heading', text: '10. Verfügbarkeit und Änderungen'},
      {
        type: 'paragraph',
        text: 'Wir stellen den Dienst nach bestem Bemühen bereit und können ihn für Wartung oder Verbesserungen unterbrechen. Wir können Funktionen ändern oder einstellen; wenn eine Änderung dich wesentlich betrifft, informieren wir dich rechtzeitig.',
      },
      {type: 'heading', text: '11. Haftung'},
      {
        type: 'paragraph',
        text: 'Soweit gesetzlich zulässig, haften wir nicht für mittelbare Schäden oder gesundheitliche Folgen aus der Befolgung eines Plans. Nichts in diesen Bedingungen beschränkt Rechte, die dir das Verbraucherrecht einräumt und auf die nicht verzichtet werden kann.',
      },
      {type: 'heading', text: '12. Sperrung und Kündigung'},
      {
        type: 'paragraph',
        text: 'Du kannst dein Konto jederzeit in den Einstellungen löschen. Wir können ein Konto sperren oder beenden, das gegen diese Bedingungen verstößt, betrügerisch genutzt wird oder den Dienst oder andere Nutzer gefährdet. Das Löschen des Kontos entfernt deine Daten wie in der Datenschutzerklärung beschrieben.',
      },
      {type: 'heading', text: '13. Anwendbares Recht und Streitigkeiten'},
      {
        type: 'paragraph',
        text: 'Diese Bedingungen unterliegen portugiesischem Recht. Wenn du Verbraucher bist, kannst du dich auch auf die zwingenden Verbraucherschutzvorschriften deines Wohnsitzlandes berufen und dort die zuständigen Gerichte anrufen.',
      },
      {type: 'heading', text: '14. Änderungen dieser Bedingungen'},
      {
        type: 'paragraph',
        text: 'Wir können diese Bedingungen aktualisieren. Jede Version hat eine Kennung; wesentliche Änderungen erfordern deine Zustimmung zur neuen Version, bevor du den Dienst weiter nutzt. Die von dir akzeptierte Version wird mit Datum gespeichert.',
      },
      {type: 'heading', text: '15. Kontakt'},
      {type: 'paragraph', text: 'Fragen zu diesen Bedingungen: [CONTACT_EMAIL].'},
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Datenschutzerklärung',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Wer verantwortlich ist'},
      {
        type: 'paragraph',
        text: 'Verantwortlicher ist [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Kontakt: [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. Kurz gesagt'},
      {
        type: 'list',
        items: [
          'wir erheben nur die Daten, die zur Berechnung deiner Ziele, zur Erstellung von Plänen und zur Führung deines Kontos nötig sind;',
          'Gesundheitsdaten werden nur mit deiner ausdrücklichen Einwilligung verarbeitet;',
          'wir verkaufen deine Daten nicht und nutzen keine Analyse- oder Werbetools;',
          'du kannst deine Daten jederzeit exportieren oder löschen.',
        ],
      },
      {type: 'heading', text: '3. Was wir erheben'},
      {
        type: 'list',
        items: [
          'Konto: E-Mail-Adresse, Passwort (gehasht bei unserem Authentifizierungsdienstleister gespeichert), Sprache und Sitzungstoken.',
          'Profil: Geschlecht, Alter, Größe, Ausgangsgewicht, Ziel, Land, Trainingsgewohnheiten und Supplements; und, nur wenn du sie freiwillig angibst, deinen Namen sowie Ernährungseinschränkungen und Beobachtungen als Freitext.',
          'Bioimpedanz: die von dir erfassten Messungen — Gewicht, Körperfett, Wasser, Grundumsatz, viszerales Fett, BMI, Muskelmasse, Protein, Knochenmasse, Körperalter und Idealgewicht.',
          'Pläne: die erzeugte Woche, die verwendeten Berechnungen, die gewählte Gerichtvariante und die als gekauft markierten Artikel.',
          'Einwilligungen: welche Dokumente und Versionen du akzeptiert hast, in welcher Sprache und wann.',
          'Abrechnung (Abonnenten): Kundenkennung, Abonnementstatus und Rechnungen, verarbeitet vom Zahlungsdienstleister.',
          'Technische Protokolle: Route, Antwortstatus und Fehlercode. Wir protokollieren keine Anfrageinhalte, Token oder Gesundheitsdaten.',
        ],
      },
      {type: 'heading', text: '4. Gesundheitsdaten'},
      {
        type: 'paragraph',
        text: 'Bioimpedanz-Messungen, Ernährungseinschränkungen und Beobachtungen können Informationen über deine Gesundheit offenlegen, einschließlich Allergien, Unverträglichkeiten oder religiöser Praktiken. Wir behandeln sie als besondere Kategorien von Daten und verarbeiten sie nur mit deiner ausdrücklichen Einwilligung, die du bei der Registrierung gesondert erteilst und jederzeit widerrufen kannst. Ohne diese Einwilligung können wir keine Pläne erstellen.',
      },
      {type: 'heading', text: '5. Warum wir sie verarbeiten und auf welcher Grundlage'},
      {
        type: 'list',
        items: [
          'Um dein Konto zu erstellen und zu sichern und dir die für die Anmeldung nötigen E-Mails zu senden — Vertragserfüllung.',
          'Um deine Ziele zu berechnen und Pläne zu erstellen — Vertragserfüllung sowie deine ausdrückliche Einwilligung für Gesundheitsdaten.',
          'Um deine Einwilligungen zu dokumentieren — rechtliche Verpflichtung (Rechenschaftspflicht).',
          'Um Zahlungen abzuwickeln und steuerliche Aufzeichnungen zu führen — Vertrag und rechtliche Verpflichtung.',
          'Um den Dienst zu schützen, durch Sicherheitsprotokolle und Missbrauchsprävention — unser berechtigtes Interesse.',
        ],
      },
      {type: 'heading', text: '6. Mit wem wir sie teilen'},
      {
        type: 'paragraph',
        text: 'Wir setzen Dienstleister ein, die Daten in unserem Auftrag verarbeiten:',
      },
      {
        type: 'list',
        items: [
          'Supabase — Datenbank und Authentifizierung, in der Europäischen Union gehostet.',
          'Der Hoster unserer API — Anwendungsserver, in der Europäischen Union.',
          'Google (Gemini API) — erstellt den Plan aus den unten beschriebenen Angaben.',
          'Unser E-Mail-Dienstleister — stellt Anmelde- und Wiederherstellungscodes zu.',
          'Unser Zahlungsdienstleister — verarbeitet Zahlungen und Rechnungen.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Die an das KI-Modell übermittelten Angaben umfassen Geschlecht, Alter, Größe, Gewicht, Ziel, Trainingsgewohnheiten, Supplements, die letzte Bioimpedanz-Messung, deine Ernährungseinschränkungen und Beobachtungen sowie Land und Sprache. Sie umfassen nicht deinen Namen, deine E-Mail-Adresse oder deine Konto-Kennung. Wir verkaufen deine Daten nicht und teilen sie nicht zu Werbezwecken.',
      },
      {type: 'heading', text: '7. Internationale Übermittlungen'},
      {
        type: 'paragraph',
        text: 'Unsere Datenbank und unsere API werden in der Europäischen Union gehostet. Einige Dienstleister, insbesondere der KI-Dienstleister, können Daten außerhalb des Europäischen Wirtschaftsraums verarbeiten; in diesem Fall stützen wir uns auf die gesetzlich geforderten Garantien wie Standardvertragsklauseln oder einen Angemessenheitsbeschluss. [TRANSFER_NOTE]',
      },
      {type: 'heading', text: '8. Wie lange wir sie speichern'},
      {
        type: 'paragraph',
        text: 'Wir speichern Konto, Profil, Messungen, Pläne und Einwilligungen, bis du dein Konto löschst. Inaktive Konten werden nach [RETENTION_PERIOD] gelöscht. Abrechnungsunterlagen werden für den steuerlich vorgeschriebenen Zeitraum aufbewahrt. Technische Protokolle werden kurz aufbewahrt und enthalten keine personenbezogenen Daten.',
      },
      {type: 'heading', text: '9. Sicherheit'},
      {
        type: 'paragraph',
        text: 'Daten werden bei der Übertragung verschlüsselt. Die Datenbank ist privat, nicht über die öffentliche API unseres Anbieters erreichbar und nur über unseren Anwendungsserver zugänglich. Zugangstoken sind kurzlebig und werden kryptografisch geprüft. Geheimnisse werden außerhalb des Anwendungscodes aufbewahrt.',
      },
      {type: 'heading', text: '10. Deine Rechte'},
      {
        type: 'list',
        items: [
          'Auskunft und Übertragbarkeit: lade in den Einstellungen eine Kopie deiner Daten herunter.',
          'Berichtigung: korrigiere dein Profil und deine Messungen im Bildschirm Daten.',
          'Löschung: lösche dein Konto in den Einstellungen; die Löschung entfernt deine Daten aus unserer Datenbank.',
          'Widerruf der Einwilligung: widerrufe die Einwilligung zu Gesundheitsdaten in den Einstellungen; die Planerstellung endet.',
          'Einschränkung und Widerspruch: schreibe an [CONTACT_EMAIL].',
          'Beschwerde: du kannst dich bei deiner nationalen Aufsichtsbehörde beschweren — in Portugal die CNPD, in Brasilien die ANPD. [COMPLAINT_AUTHORITY]',
        ],
      },
      {
        type: 'paragraph',
        text: 'Wir beantworten Anfragen innerhalb der gesetzlichen Fristen: einen Monat nach der DSGVO und 15 Tage nach der LGPD.',
      },
      {type: 'heading', text: '11. Cookies und lokaler Speicher'},
      {
        type: 'paragraph',
        text: 'Wir verwenden nur unbedingt erforderlichen Speicher: die Sitzung, die dich angemeldet hält, und einen lokalen Cache deiner Daten zum Offline-Lesen. Wir verwenden keine Analysen, Werbe-Cookies oder Tracking-Pixel — deshalb siehst du kein Cookie-Banner.',
      },
      {type: 'heading', text: '12. Kinder'},
      {
        type: 'paragraph',
        text: 'Der Dienst richtet sich an Erwachsene. Wir erheben wissentlich keine Daten von Personen unter 18 Jahren.',
      },
      {type: 'heading', text: '13. Änderungen'},
      {
        type: 'paragraph',
        text: 'Wir können diese Erklärung aktualisieren. Jede Version hat eine Kennung; wesentliche Änderungen erfordern deine Zustimmung, bevor du den Dienst weiter nutzt.',
      },
      {type: 'heading', text: '14. Kontakt'},
      {type: 'paragraph', text: 'Fragen und Anfragen zum Datenschutz: [CONTACT_EMAIL].'},
    ],
  },
  health_data: {
    id: 'health_data',
    title: 'Einwilligung in Gesundheitsdaten',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Diese Einwilligung umfasst die Verarbeitung deiner Gesundheitsdaten durch Nutribio.',
      },
      {type: 'heading', text: 'Welche Daten'},
      {
        type: 'list',
        items: [
          'Bioimpedanz-Messungen: Gewicht, Körperfett, Wasser, Grundumsatz, viszerales Fett, BMI, Muskelmasse, Protein, Knochenmasse, Körperalter und Idealgewicht;',
          'dein Ziel und deine Trainingsgewohnheiten;',
          'deine Ernährungseinschränkungen und allgemeinen Beobachtungen, die Allergien, Unverträglichkeiten oder religiöse Praktiken offenlegen können;',
          'die aus diesen Angaben erstellten Ernährungspläne.',
        ],
      },
      {type: 'heading', text: 'Warum'},
      {
        type: 'paragraph',
        text: 'Um deinen Energie- und Makronährstoffbedarf zu berechnen, wöchentliche Pläne passend zu deinem Körper und deinen Einschränkungen zu erstellen und deinen Verlauf über die Zeit zu zeigen.',
      },
      {type: 'heading', text: 'Wer sie erhält'},
      {
        type: 'paragraph',
        text: 'Unsere Datenbank und unser Anwendungsserver in der Europäischen Union sowie Google Gemini, das den Plan erstellt. Die an das KI-Modell übermittelten Angaben enthalten nicht deinen Namen, deine E-Mail-Adresse oder deine Konto-Kennung.',
      },
      {type: 'heading', text: 'Was passiert bei Ablehnung'},
      {
        type: 'paragraph',
        text: 'Die Angabe von Gesundheitsdaten ist freiwillig, aber ohne sie kann der Dienst weder Ziele berechnen noch Pläne erstellen. Wenn du diese Einwilligung widerrufst, stellen wir die Planerstellung ein; du kannst deine Daten weiterhin exportieren oder löschen.',
      },
      {type: 'heading', text: 'Deine Erklärung'},
      {
        type: 'paragraph',
        text: 'Ich habe die Datenschutzerklärung gelesen und willige freiwillig, informiert und ausdrücklich in die Verarbeitung meiner Gesundheitsdaten zu den oben beschriebenen Zwecken ein. Mir ist bewusst, dass ich diese Einwilligung jederzeit in den Einstellungen widerrufen kann und dass der Widerruf die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung nicht berührt.',
      },
    ],
  },
  health_disclaimer: {
    id: 'health_disclaimer',
    title: 'Gesundheitshinweis',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Nutribio ist ein Hilfsmittel für gesunde Erwachsene. Es ist kein Medizinprodukt, diagnostiziert, behandelt oder verhindert keine Krankheit und ersetzt nicht die Beratung durch einen Arzt oder eine qualifizierte Ernährungsfachkraft.',
      },
      {type: 'heading', text: 'Wann du die Pläne nicht nutzen solltest'},
      {
        type: 'paragraph',
        text: 'Nutze die Pläne nicht als alleinige Nahrungsquelle, wenn du schwanger bist oder stillst, wenn du eine Essstörung hast oder hattest, wenn du Diabetes oder eine Nieren-, Leber-, Herz- oder Schilddrüsenerkrankung hast, wenn du Medikamente einnimmst, die Appetit oder Stoffwechsel beeinflussen, oder wenn du dich von einer Operation erholst. In diesen Fällen folge dem Plan einer medizinischen Fachkraft.',
      },
      {type: 'heading', text: 'Prüfe vor dem Kochen'},
      {
        type: 'paragraph',
        text: 'Die Pläne werden von einem KI-Modell erstellt und können Fehler enthalten: prüfe die Zutaten auf Allergene und Unverträglichkeiten und bestätige, dass das Gericht für dich geeignet ist. Kalorien- und Makronährstoffwerte sind Schätzungen.',
      },
      {type: 'heading', text: 'Wann du Hilfe suchen solltest'},
      {
        type: 'paragraph',
        text: 'Wenn du dich unwohl, schwindelig oder ungewöhnlich müde fühlst oder ein Symptom hast, das dich beunruhigt, brich den Plan ab und suche ärztlichen Rat. Im Notfall rufe die örtliche Notrufnummer an.',
      },
    ],
  },
};

export default de;
