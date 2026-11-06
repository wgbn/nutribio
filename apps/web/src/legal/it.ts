// Italiano — testi legali (roadmap punto 5, fase 5.2).
// Traduzione della fonte en-GB; la struttura dei blocchi deve coincidere
// (verificata da `npm run i18n:check`).

import type {LegalCatalog} from './types';

const it: LegalCatalog = {
  terms: {
    id: 'terms',
    title: 'Termini di utilizzo',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Chi siamo'},
      {
        type: 'paragraph',
        text: 'Nutribio («Nutribio», «noi») è gestito da [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Puoi contattarci a [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. Il servizio'},
      {
        type: 'paragraph',
        text: 'Nutribio crea piani alimentari settimanali a partire dalle informazioni che fornisci — profilo, obiettivo e restrizioni alimentari — e, se le registri, dalle misurazioni di bioimpedenza. I calcoli nutrizionali sono deterministici; i piatti, le porzioni e la lista della spesa sono generati da un modello di intelligenza artificiale (Google Gemini) a partire da quei calcoli.',
      },
      {
        type: 'paragraph',
        text: 'Nutribio è uno strumento di supporto per adulti sani. Non è un dispositivo medico e non fornisce consulenza medica o nutrizionale — vedi l’Avviso sulla salute.',
      },
      {type: 'heading', text: '3. Chi può usarlo'},
      {
        type: 'paragraph',
        text: 'Devi avere almeno 18 anni e la capacità legale di stipulare un contratto. Non puoi usare Nutribio per conto di un’altra persona senza il suo permesso.',
      },
      {type: 'heading', text: '4. Il tuo account'},
      {
        type: 'paragraph',
        text: 'Crei un account con un indirizzo email e una password. Devi fornire informazioni corrette, mantenere la password riservata e avvisarci subito se sospetti un accesso non autorizzato. Sei responsabile dell’attività svolta con il tuo account.',
      },
      {type: 'heading', text: '5. Uso accettabile'},
      {type: 'paragraph', text: 'Ti impegni a non:'},
      {
        type: 'list',
        items: [
          'abusare del servizio o tentare di accedere ai dati di altri utenti;',
          'copiare, estrarre automaticamente, decodificare o rivendere il servizio;',
          'usare il servizio per violare la legge o i diritti di terzi;',
          'tentare di manipolare il modello di IA, aggirare i limiti o eludere il limite di generazioni gratuite;',
          'caricare contenuti illeciti o sui quali non hai diritti.',
        ],
      },
      {type: 'heading', text: '6. Contenuti generati dall’IA'},
      {
        type: 'paragraph',
        text: 'I piani sono generati da un modello e possono contenere errori o approssimazioni: i valori di calorie e macronutrienti sono stime, le porzioni possono variare e la disponibilità dei prodotti dipende dal tuo paese e dal supermercato. Devi verificare gli ingredienti e gli allergeni, soprattutto se hai un’allergia o un’intolleranza. La lista della spesa è un suggerimento che copre tutte le varianti della settimana — compra solo ciò che intendi cucinare.',
      },
      {type: 'heading', text: '7. Piani, prezzi e abbonamento'},
      {
        type: 'paragraph',
        text: 'Ogni account ha una generazione del piano gratuita. Dopo, per generare un piano serve un abbonamento mensile attivo. Non esiste un piano annuale. Prezzi, valute (EUR o BRL secondo il tuo paese) e imposte sono mostrati al pagamento prima che paghi.',
      },
      {
        type: 'paragraph',
        text: 'L’abbonamento si rinnova automaticamente ogni mese finché non lo annulli. Puoi annullarlo in qualsiasi momento nel portale di fatturazione; l’annullamento ha effetto alla fine del periodo pagato in corso e mantieni l’accesso fino ad allora. Possiamo modificare il prezzo con un preavviso di almeno 30 giorni; se non accetti la modifica, puoi annullare prima che si applichi.',
      },
      {
        type: 'paragraph',
        text: 'I pagamenti sono elaborati dal nostro fornitore di pagamenti, che agisce come venditore (merchant of record) della transazione. I dati della tua carta non arrivano mai ai nostri server.',
      },
      {type: 'heading', text: '8. Diritto di recesso'},
      {
        type: 'paragraph',
        text: 'Se sei un consumatore nell’Unione europea, hai 14 giorni per recedere da un contratto di contenuto digitale. Chiedendoci di iniziare subito il servizio, riconosci di perdere questo diritto una volta consegnato il contenuto (cioè una volta generato il piano). Se sei un consumatore in Brasile, l’articolo 49 del Codice di difesa del consumatore ti dà 7 giorni per recedere da un acquisto effettuato fuori da un negozio fisico.',
      },
      {type: 'paragraph', text: 'Per esercitare questi diritti, scrivi a [CONTACT_EMAIL].'},
      {type: 'heading', text: '9. Proprietà intellettuale'},
      {
        type: 'paragraph',
        text: 'L’app, i suoi testi e il suo design appartengono a noi o ai nostri licenzianti. I tuoi dati appartengono a te. I piani generati per te sono per uso personale; puoi condividerli, ma non venderli né usarli commercialmente.',
      },
      {type: 'heading', text: '10. Disponibilità e modifiche'},
      {
        type: 'paragraph',
        text: 'Forniamo il servizio con la massima diligenza e possiamo interromperlo per manutenzione o miglioramenti. Possiamo modificare o disattivare funzionalità; se una modifica ti riguarda in modo significativo, ti avviseremo con un preavviso ragionevole.',
      },
      {type: 'heading', text: '11. Responsabilità'},
      {
        type: 'paragraph',
        text: 'Nella misura consentita dalla legge, non siamo responsabili di danni indiretti né di esiti sulla salute derivanti dal seguire un piano. Nulla in questi Termini limita i diritti che la legge a tutela dei consumatori ti riconosce e a cui non si può rinunciare.',
      },
      {type: 'heading', text: '12. Sospensione e cessazione'},
      {
        type: 'paragraph',
        text: 'Puoi eliminare il tuo account in qualsiasi momento nelle Impostazioni. Possiamo sospendere o chiudere un account che viola questi Termini, che è usato in modo fraudolento o che mette a rischio il servizio o altri utenti. Eliminare l’account rimuove i tuoi dati come descritto nell’Informativa sulla privacy.',
      },
      {type: 'heading', text: '13. Legge applicabile e controversie'},
      {
        type: 'paragraph',
        text: 'Questi Termini sono regolati dalla legge portoghese. Se sei un consumatore, puoi anche invocare le norme imperative a tutela dei consumatori del tuo paese di residenza e rivolgerti ai tribunali competenti di quel paese.',
      },
      {type: 'heading', text: '14. Modifiche alle presenti Condizioni'},
      {
        type: 'paragraph',
        text: 'Possiamo aggiornare questi Termini. Ogni versione ha un identificatore; le modifiche sostanziali richiedono che tu accetti la nuova versione prima di continuare a usare il servizio. La versione che hai accettato è registrata con la data.',
      },
      {type: 'heading', text: '15. Contatti'},
      {type: 'paragraph', text: 'Domande su questi Termini: [CONTACT_EMAIL].'},
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Informativa sulla privacy',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Chi è il responsabile'},
      {
        type: 'paragraph',
        text: 'Il titolare del trattamento è [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Contatto: [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. In breve'},
      {
        type: 'list',
        items: [
          'raccogliamo solo i dati necessari per calcolare i tuoi obiettivi, generare piani e gestire il tuo account;',
          'i dati sulla salute sono trattati solo con il tuo consenso esplicito;',
          'non vendiamo i tuoi dati e non usiamo analisi né pubblicità;',
          'puoi esportare o eliminare i tuoi dati in qualsiasi momento.',
        ],
      },
      {type: 'heading', text: '3. Cosa raccogliamo'},
      {
        type: 'list',
        items: [
          'Account: indirizzo email, password (conservata con hash dal nostro fornitore di autenticazione), lingua e token di sessione.',
          'Profilo: sesso, età, altezza, peso iniziale, obiettivo, paese, abitudini di allenamento e integratori; e, solo se scegli di fornirli, il tuo nome e le restrizioni alimentari e osservazioni in testo libero.',
          'Bioimpedenza: le misurazioni che registri — peso, grasso corporeo, acqua, metabolismo basale, grasso viscerale, IMC, muscolo, proteine, massa ossea, età corporea e peso ideale.',
          'Piani: la settimana generata, i calcoli utilizzati, la variante di piatto scelta e gli articoli contrassegnati come acquistati.',
          'Consensi: quali documenti e versioni hai accettato, in quale lingua e quando.',
          'Fatturazione (abbonati): identificativo cliente, stato dell’abbonamento e fatture, gestiti dal fornitore di pagamenti.',
          'Registri tecnici: rotta, stato della risposta e codice di errore. Non registriamo corpi delle richieste, token né dati sulla salute.',
        ],
      },
      {type: 'heading', text: '4. Dati sulla salute'},
      {
        type: 'paragraph',
        text: 'Le misurazioni di bioimpedenza, le restrizioni alimentari e le osservazioni possono rivelare informazioni sulla tua salute, comprese allergie, intolleranze o pratiche religiose. Li trattiamo come dati di categoria particolare e solo con il tuo consenso esplicito, che fornisci separatamente alla registrazione e puoi revocare in qualsiasi momento. Senza questo consenso non possiamo generare piani.',
      },
      {type: 'heading', text: '5. Perché li trattiamo e su quale base'},
      {
        type: 'list',
        items: [
          'Per creare e proteggere il tuo account e inviarti le email necessarie per accedere — esecuzione di un contratto.',
          'Per calcolare i tuoi obiettivi e generare piani — esecuzione di un contratto, oltre al tuo consenso esplicito per i dati sulla salute.',
          'Per conservare la prova dei tuoi consensi — obbligo legale (responsabilizzazione).',
          'Per elaborare i pagamenti e conservare i registri fiscali — contratto e obbligo legale.',
          'Per proteggere il servizio, tramite registri di sicurezza e prevenzione degli abusi — nostro interesse legittimo.',
        ],
      },
      {type: 'heading', text: '6. Con chi li condividiamo'},
      {
        type: 'paragraph',
        text: 'Utilizziamo fornitori di servizi che trattano dati per nostro conto:',
      },
      {
        type: 'list',
        items: [
          'Supabase — database e autenticazione, ospitati nell’Unione europea.',
          'L’hosting della nostra API — server applicativo, nell’Unione europea.',
          'Google (API Gemini) — genera il piano dalle informazioni descritte sotto.',
          'Il nostro fornitore di email — consegna i codici di accesso e di recupero.',
          'Il nostro fornitore di pagamenti — elabora pagamenti e fatture.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Le informazioni inviate al modello di IA includono sesso, età, altezza, peso, obiettivo, abitudini di allenamento, integratori, l’ultima misurazione di bioimpedenza, le tue restrizioni alimentari e osservazioni, e il tuo paese e la tua lingua. Non includono il tuo nome, indirizzo email o identificativo dell’account. Non vendiamo i tuoi dati né li condividiamo per finalità pubblicitarie.',
      },
      {type: 'heading', text: '7. Trasferimenti internazionali'},
      {
        type: 'paragraph',
        text: 'Il nostro database e la nostra API sono ospitati nell’Unione europea. Alcuni fornitori, in particolare quello di IA, possono trattare dati fuori dallo Spazio economico europeo; in tal caso ci basiamo sulle garanzie richieste dalla legge, come le clausole contrattuali standard o una decisione di adeguatezza. [TRANSFER_NOTE]',
      },
      {type: 'heading', text: '8. Per quanto tempo li conserviamo'},
      {
        type: 'paragraph',
        text: 'Conserviamo account, profilo, misurazioni, piani e consensi finché non elimini l’account. Gli account inattivi vengono eliminati dopo [RETENTION_PERIOD]. I registri di fatturazione sono conservati per il periodo richiesto dalla legge fiscale. I registri tecnici sono conservati per un breve periodo e non contengono dati personali.',
      },
      {type: 'heading', text: '9. Sicurezza'},
      {
        type: 'paragraph',
        text: 'I dati sono cifrati in transito. Il database è privato, non esposto all’API pubblica del nostro fornitore ed è accessibile solo tramite il nostro server applicativo. I token di accesso sono di breve durata e verificati crittograficamente. I segreti sono conservati fuori dal codice dell’applicazione.',
      },
      {type: 'heading', text: '10. I tuoi diritti'},
      {
        type: 'list',
        items: [
          'Accesso e portabilità: scarica una copia dei tuoi dati nelle Impostazioni.',
          'Rettifica: correggi il tuo profilo e le tue misurazioni nella schermata Dati.',
          'Cancellazione: elimina il tuo account nelle Impostazioni; l’eliminazione rimuove i tuoi dati dal nostro database.',
          'Revoca del consenso: revoca il consenso ai dati sulla salute nelle Impostazioni; la generazione dei piani si ferma.',
          'Limitazione e opposizione: scrivici a [CONTACT_EMAIL].',
          'Reclamo: puoi rivolgerti alla tua autorità di controllo nazionale — in Portogallo la CNPD, in Italia il Garante per la protezione dei dati personali, in Brasile l’ANPD. [COMPLAINT_AUTHORITY]',
        ],
      },
      {
        type: 'paragraph',
        text: 'Rispondiamo alle richieste entro i termini di legge: un mese ai sensi del GDPR e 15 giorni ai sensi della LGPD.',
      },
      {type: 'heading', text: '11. Cookie e archiviazione locale'},
      {
        type: 'paragraph',
        text: 'Usiamo solo archiviazione strettamente necessaria: la sessione che ti mantiene connesso e una copia locale dei tuoi dati per la lettura offline. Non usiamo analisi, cookie pubblicitari o pixel di tracciamento, per questo non vedi un banner dei cookie.',
      },
      {type: 'heading', text: '12. Minori'},
      {
        type: 'paragraph',
        text: 'Il servizio è destinato agli adulti. Non raccogliamo consapevolmente dati di persone di età inferiore a 18 anni.',
      },
      {type: 'heading', text: '13. Modifiche'},
      {
        type: 'paragraph',
        text: 'Possiamo aggiornare questa informativa. Ogni versione ha un identificatore; le modifiche sostanziali richiedono la tua accettazione prima di continuare a usare il servizio.',
      },
      {type: 'heading', text: '14. Contatti'},
      {type: 'paragraph', text: 'Domande e richieste sulla privacy: [CONTACT_EMAIL].'},
    ],
  },
  health_data: {
    id: 'health_data',
    title: 'Consenso ai dati sulla salute',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Questo consenso riguarda il trattamento dei tuoi dati sulla salute da parte di Nutribio.',
      },
      {type: 'heading', text: 'Quali dati'},
      {
        type: 'list',
        items: [
          'misurazioni di bioimpedenza: peso, grasso corporeo, acqua, metabolismo basale, grasso viscerale, IMC, muscolo, proteine, massa ossea, età corporea e peso ideale;',
          'il tuo obiettivo e le tue abitudini di allenamento;',
          'le tue restrizioni alimentari e osservazioni generali, che possono rivelare allergie, intolleranze o pratiche religiose;',
          'i piani alimentari generati da queste informazioni.',
        ],
      },
      {type: 'heading', text: 'Perché'},
      {
        type: 'paragraph',
        text: 'Per calcolare i tuoi obiettivi energetici e di macronutrienti, generare piani alimentari settimanali adatti al tuo corpo e alle tue restrizioni e mostrare la tua evoluzione nel tempo.',
      },
      {type: 'heading', text: 'Chi li riceve'},
      {
        type: 'paragraph',
        text: 'Il nostro database e il nostro server applicativo, nell’Unione europea, e Google Gemini, che genera il piano. Le informazioni inviate al modello di IA non includono il tuo nome, indirizzo email o identificativo dell’account.',
      },
      {type: 'heading', text: 'Cosa succede se rifiuti'},
      {
        type: 'paragraph',
        text: 'Fornire dati sulla salute è facoltativo, ma il servizio non può calcolare obiettivi né generare piani senza di essi. Se revochi questo consenso, smettiamo di generare piani e puoi comunque esportare o eliminare i tuoi dati.',
      },
      {type: 'heading', text: 'La tua dichiarazione'},
      {
        type: 'paragraph',
        text: 'Ho letto l’Informativa sulla privacy e acconsento, in modo libero, informato ed esplicito, al trattamento dei miei dati sulla salute per le finalità descritte sopra. Comprendo che posso revocare questo consenso in qualsiasi momento nelle Impostazioni e che la revoca non pregiudica la liceità del trattamento effettuato prima di essa.',
      },
    ],
  },
  health_disclaimer: {
    id: 'health_disclaimer',
    title: 'Avviso sulla salute',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Nutribio è uno strumento di supporto per adulti sani. Non è un dispositivo medico, non diagnostica, cura o previene alcuna malattia e non sostituisce il parere di un medico o di un nutrizionista abilitato.',
      },
      {type: 'heading', text: 'Quando non usare i piani'},
      {
        type: 'paragraph',
        text: 'Non usare i piani come unica fonte di alimentazione se sei incinta o allatti, se hai o hai avuto un disturbo alimentare, se hai il diabete o una malattia renale, epatica, cardiaca o della tiroide, se assumi farmaci che influenzano l’appetito o il metabolismo, o se ti stai riprendendo da un intervento chirurgico. In questi casi segui il piano di un professionista sanitario.',
      },
      {type: 'heading', text: 'Controlla prima di cucinare'},
      {
        type: 'paragraph',
        text: 'I piani sono generati da un modello di intelligenza artificiale e possono contenere errori: controlla gli ingredienti per allergeni e intolleranze e conferma che il piatto sia adatto a te. I valori di calorie e macronutrienti sono stime.',
      },
      {type: 'heading', text: 'Quando chiedere aiuto'},
      {
        type: 'paragraph',
        text: 'Se ti senti male, hai capogiri, stanchezza insolita o qualsiasi sintomo che ti preoccupa, smetti di seguire il piano e chiedi un parere medico. In caso di emergenza, chiama il numero di emergenza locale.',
      },
    ],
  },
};

export default it;
