// Français — textes juridiques (roadmap item 5, phase 5.2).
// Traduction du texte source en-GB ; la structure des blocs doit correspondre
// (vérifiée par `npm run i18n:check`).

import type {LegalCatalog} from './types';

const fr: LegalCatalog = {
  terms: {
    id: 'terms',
    title: 'Conditions d’utilisation',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Qui sommes-nous'},
      {
        type: 'paragraph',
        text: 'Nutribio (« Nutribio », « nous ») est exploité par [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Vous pouvez nous joindre à [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. Le service'},
      {
        type: 'paragraph',
        text: 'Nutribio crée des menus hebdomadaires à partir des informations que vous fournissez — profil, objectif et restrictions alimentaires — et, si vous les enregistrez, des mesures de bio-impédance. Les calculs nutritionnels sont déterministes ; les plats, les portions et la liste de courses sont générés par un modèle d’intelligence artificielle (Google Gemini) à partir de ces calculs.',
      },
      {
        type: 'paragraph',
        text: 'Nutribio est un outil d’accompagnement pour adultes en bonne santé. Ce n’est pas un dispositif médical et il ne fournit pas de conseil médical ou nutritionnel — consultez l’Avertissement santé.',
      },
      {type: 'heading', text: '3. Qui peut l’utiliser'},
      {
        type: 'paragraph',
        text: 'Vous devez avoir au moins 18 ans et la capacité juridique de conclure un contrat. Vous ne pouvez pas utiliser Nutribio au nom d’une autre personne sans son autorisation.',
      },
      {type: 'heading', text: '4. Votre compte'},
      {
        type: 'paragraph',
        text: 'Vous créez un compte avec une adresse e-mail et un mot de passe. Vous devez fournir des informations exactes, garder votre mot de passe confidentiel et nous prévenir immédiatement en cas de suspicion d’accès non autorisé. Vous êtes responsable de l’activité effectuée avec votre compte.',
      },
      {type: 'heading', text: '5. Utilisation acceptable'},
      {type: 'paragraph', text: 'Vous vous engagez à ne pas :'},
      {
        type: 'list',
        items: [
          'faire un usage abusif du service ou tenter d’accéder aux données d’autres utilisateurs ;',
          'copier, extraire automatiquement, désosser ou revendre le service ;',
          'utiliser le service pour enfreindre la loi ou les droits de tiers ;',
          'tenter de manipuler le modèle d’IA, de contourner les limites ou d’échapper à la limite de générations gratuites ;',
          'téléverser des contenus illicites ou sur lesquels vous n’avez aucun droit.',
        ],
      },
      {type: 'heading', text: '6. Contenu généré par IA'},
      {
        type: 'paragraph',
        text: 'Les menus sont générés par un modèle et peuvent contenir des erreurs ou des approximations : les valeurs de calories et de macronutriments sont des estimations, les portions peuvent varier et la disponibilité des produits dépend de votre pays et de votre supermarché. Vous devez vérifier vous-même les ingrédients et les allergènes, en particulier si vous avez une allergie ou une intolérance. La liste de courses est une suggestion qui couvre toutes les variantes de la semaine — n’achetez que ce que vous avez l’intention de cuisiner.',
      },
      {type: 'heading', text: '7. Offres, prix et abonnement'},
      {
        type: 'paragraph',
        text: 'Chaque compte dispose d’une génération de menu gratuite. Ensuite, générer un menu nécessite un abonnement mensuel actif. Il n’existe pas d’offre annuelle. Les prix, les devises (EUR ou BRL selon votre pays) et les taxes sont affichés au paiement avant que vous ne payiez.',
      },
      {
        type: 'paragraph',
        text: 'L’abonnement se renouvelle automatiquement chaque mois jusqu’à résiliation. Vous pouvez résilier à tout moment dans le portail de facturation ; la résiliation prend effet à la fin de la période payée en cours et vous conservez l’accès jusque-là. Nous pouvons modifier le prix avec un préavis d’au moins 30 jours ; si vous n’acceptez pas la modification, vous pouvez résilier avant qu’elle ne s’applique.',
      },
      {
        type: 'paragraph',
        text: 'Les paiements sont traités par notre prestataire de paiement, qui agit en qualité de vendeur (merchant of record) de la transaction. Les données de votre carte ne parviennent jamais à nos serveurs.',
      },
      {type: 'heading', text: '8. Droit de rétractation'},
      {
        type: 'paragraph',
        text: 'Si vous êtes consommateur dans l’Union européenne, vous disposez de 14 jours pour vous rétracter d’un contrat de contenu numérique. En nous demandant de commencer le service immédiatement, vous reconnaissez perdre ce droit une fois le contenu fourni (c’est-à-dire une fois le menu généré). Si vous êtes consommateur au Brésil, l’article 49 du Code de défense du consommateur vous accorde 7 jours pour vous rétracter d’un achat effectué hors d’un établissement physique.',
      },
      {type: 'paragraph', text: 'Pour exercer ces droits, écrivez à [CONTACT_EMAIL].'},
      {type: 'heading', text: '9. Propriété intellectuelle'},
      {
        type: 'paragraph',
        text: 'L’application, ses textes et son design nous appartiennent ou appartiennent à nos concédants. Vos données vous appartiennent. Les menus générés pour vous sont destinés à un usage personnel ; vous pouvez les partager, mais pas les vendre ni les utiliser à des fins commerciales.',
      },
      {type: 'heading', text: '10. Disponibilité et modifications'},
      {
        type: 'paragraph',
        text: 'Nous fournissons le service au mieux de nos capacités et pouvons l’interrompre pour maintenance ou amélioration. Nous pouvons modifier ou supprimer des fonctionnalités ; si une modification vous affecte de manière significative, nous vous en informerons dans un délai raisonnable.',
      },
      {type: 'heading', text: '11. Responsabilité'},
      {
        type: 'paragraph',
        text: 'Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects ni des conséquences sur la santé résultant du suivi d’un menu. Rien dans ces Conditions ne limite les droits que la législation de la consommation vous accorde et auxquels il ne peut être renoncé.',
      },
      {type: 'heading', text: '12. Suspension et résiliation'},
      {
        type: 'paragraph',
        text: 'Vous pouvez supprimer votre compte à tout moment dans les Réglages. Nous pouvons suspendre ou résilier un compte qui enfreint ces Conditions, qui est utilisé frauduleusement ou qui met en danger le service ou d’autres utilisateurs. La suppression du compte efface vos données comme décrit dans la Politique de confidentialité.',
      },
      {type: 'heading', text: '13. Droit applicable et litiges'},
      {
        type: 'paragraph',
        text: 'Ces Conditions sont régies par le droit portugais. Si vous êtes consommateur, vous pouvez également invoquer les règles impératives de protection du consommateur de votre pays de résidence et saisir les tribunaux compétents de ce pays.',
      },
      {type: 'heading', text: '14. Modifications des présentes Conditions'},
      {
        type: 'paragraph',
        text: 'Nous pouvons mettre à jour ces Conditions. Chaque version porte un identifiant ; les modifications substantielles exigent que vous acceptiez la nouvelle version avant de continuer à utiliser le service. La version que vous avez acceptée est enregistrée avec la date.',
      },
      {type: 'heading', text: '15. Contact'},
      {type: 'paragraph', text: 'Questions sur ces Conditions : [CONTACT_EMAIL].'},
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Politique de confidentialité',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Qui est responsable'},
      {
        type: 'paragraph',
        text: 'Le responsable du traitement est [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Contact : [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. En bref'},
      {
        type: 'list',
        items: [
          'nous ne collectons que les données nécessaires pour calculer vos objectifs, générer des menus et gérer votre compte ;',
          'les données de santé ne sont traitées qu’avec votre consentement explicite ;',
          'nous ne vendons pas vos données et n’utilisons ni analyse d’audience ni publicité ;',
          'vous pouvez exporter ou supprimer vos données à tout moment.',
        ],
      },
      {type: 'heading', text: '3. Ce que nous collectons'},
      {
        type: 'list',
        items: [
          'Compte : adresse e-mail, mot de passe (stocké sous forme hachée par notre prestataire d’authentification), langue et jetons de session.',
          'Profil : sexe, âge, taille, poids initial, objectif, pays, habitudes d’exercice et compléments ; et, uniquement si vous choisissez de les fournir, votre nom et vos restrictions alimentaires et observations en texte libre.',
          'Bio-impédance : les mesures que vous enregistrez — poids, masse grasse, eau, métabolisme de base, graisse viscérale, IMC, muscle, protéines, masse osseuse, âge corporel et poids idéal.',
          'Menus : la semaine générée, les calculs utilisés, la variante de plat choisie et les articles marqués comme achetés.',
          'Consentements : les documents et versions acceptés, dans quelle langue et à quelle date.',
          'Facturation (abonnés) : identifiant client, statut de l’abonnement et factures, traités par le prestataire de paiement.',
          'Journaux techniques : route, statut de la réponse et code d’erreur. Nous n’enregistrons ni corps de requête, ni jetons, ni données de santé.',
        ],
      },
      {type: 'heading', text: '4. Données de santé'},
      {
        type: 'paragraph',
        text: 'Les mesures de bio-impédance, les restrictions alimentaires et les observations peuvent révéler des informations sur votre santé, notamment des allergies, des intolérances ou des pratiques religieuses. Nous les traitons comme des données de catégorie particulière et uniquement avec votre consentement explicite, donné séparément lors de l’inscription et retirable à tout moment. Sans ce consentement, nous ne pouvons pas générer de menus.',
      },
      {type: 'heading', text: '5. Pourquoi nous les traitons et sur quelle base'},
      {
        type: 'list',
        items: [
          'Pour créer et sécuriser votre compte et envoyer les e-mails nécessaires à la connexion — exécution d’un contrat.',
          'Pour calculer vos objectifs et générer des menus — exécution d’un contrat, complétée par votre consentement explicite pour les données de santé.',
          'Pour conserver la preuve de vos consentements — obligation légale (responsabilité).',
          'Pour traiter les paiements et conserver les pièces comptables — contrat et obligation légale.',
          'Pour protéger le service, via des journaux de sécurité et la prévention des abus — notre intérêt légitime.',
        ],
      },
      {type: 'heading', text: '6. Avec qui nous les partageons'},
      {
        type: 'paragraph',
        text: 'Nous faisons appel à des prestataires qui traitent des données pour notre compte :',
      },
      {
        type: 'list',
        items: [
          'Supabase — base de données et authentification, hébergées dans l’Union européenne.',
          'L’hébergeur de notre API — serveur d’application, dans l’Union européenne.',
          'Google (API Gemini) — génère le menu à partir des informations décrites ci-dessous.',
          'Notre prestataire e-mail — remet les codes de connexion et de récupération.',
          'Notre prestataire de paiement — traite les paiements et les factures.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Les informations envoyées au modèle d’IA comprennent votre sexe, âge, taille, poids, objectif, habitudes d’exercice, compléments, la dernière mesure de bio-impédance, vos restrictions alimentaires et observations, ainsi que votre pays et votre langue. Elles ne comprennent ni votre nom, ni votre adresse e-mail, ni votre identifiant de compte. Nous ne vendons pas vos données et ne les partageons pas à des fins publicitaires.',
      },
      {type: 'heading', text: '7. Transferts internationaux'},
      {
        type: 'paragraph',
        text: 'Notre base de données et notre API sont hébergées dans l’Union européenne. Certains prestataires, notamment le prestataire d’IA, peuvent traiter des données en dehors de l’Espace économique européen ; dans ce cas, nous nous appuyons sur les garanties exigées par la loi, telles que les clauses contractuelles types ou une décision d’adéquation. [TRANSFER_NOTE]',
      },
      {type: 'heading', text: '8. Combien de temps nous les conservons'},
      {
        type: 'paragraph',
        text: 'Nous conservons votre compte, votre profil, vos mesures, vos menus et vos consentements jusqu’à la suppression de votre compte. Les comptes inactifs sont supprimés après [RETENTION_PERIOD]. Les pièces de facturation sont conservées pendant la durée exigée par la loi fiscale. Les journaux techniques sont conservés peu de temps et ne contiennent pas de données personnelles.',
      },
      {type: 'heading', text: '9. Sécurité'},
      {
        type: 'paragraph',
        text: 'Les données sont chiffrées en transit. La base de données est privée, n’est pas exposée à l’API publique de notre prestataire et n’est accessible que via notre serveur d’application. Les jetons d’accès sont de courte durée et vérifiés cryptographiquement. Les secrets sont conservés en dehors du code de l’application.',
      },
      {type: 'heading', text: '10. Vos droits'},
      {
        type: 'list',
        items: [
          'Accès et portabilité : téléchargez une copie de vos données dans les Réglages.',
          'Rectification : corrigez votre profil et vos mesures dans l’écran Données.',
          'Effacement : supprimez votre compte dans les Réglages ; la suppression efface vos données de notre base.',
          'Retrait du consentement : retirez le consentement aux données de santé dans les Réglages ; la génération de menus s’arrête.',
          'Limitation et opposition : écrivez-nous à [CONTACT_EMAIL].',
          'Réclamation : vous pouvez saisir votre autorité de contrôle nationale — au Portugal, la CNPD ; en France, la CNIL ; au Brésil, l’ANPD. [COMPLAINT_AUTHORITY]',
        ],
      },
      {
        type: 'paragraph',
        text: 'Nous répondons aux demandes dans les délais légaux : un mois au titre du RGPD et 15 jours au titre de la LGPD.',
      },
      {type: 'heading', text: '11. Cookies et stockage local'},
      {
        type: 'paragraph',
        text: 'Nous n’utilisons que le stockage strictement nécessaire : la session qui vous maintient connecté et un cache local de vos données pour la lecture hors ligne. Nous n’utilisons ni analyse d’audience, ni cookies publicitaires, ni pixels de suivi, ce qui explique l’absence de bandeau cookies.',
      },
      {type: 'heading', text: '12. Mineurs'},
      {
        type: 'paragraph',
        text: 'Le service est destiné aux adultes. Nous ne collectons pas sciemment de données de personnes de moins de 18 ans.',
      },
      {type: 'heading', text: '13. Modifications'},
      {
        type: 'paragraph',
        text: 'Nous pouvons mettre à jour cette politique. Chaque version porte un identifiant ; les modifications substantielles exigent votre acceptation avant de continuer à utiliser le service.',
      },
      {type: 'heading', text: '14. Contact'},
      {type: 'paragraph', text: 'Questions et demandes relatives à la confidentialité : [CONTACT_EMAIL].'},
    ],
  },
  health_data: {
    id: 'health_data',
    title: 'Consentement relatif aux données de santé',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Ce consentement couvre le traitement de vos données de santé par Nutribio.',
      },
      {type: 'heading', text: 'Quelles données'},
      {
        type: 'list',
        items: [
          'mesures de bio-impédance : poids, masse grasse, eau, métabolisme de base, graisse viscérale, IMC, muscle, protéines, masse osseuse, âge corporel et poids idéal ;',
          'votre objectif et vos habitudes d’exercice ;',
          'vos restrictions alimentaires et observations générales, qui peuvent révéler des allergies, des intolérances ou des pratiques religieuses ;',
          'les menus générés à partir de ces informations.',
        ],
      },
      {type: 'heading', text: 'Pourquoi'},
      {
        type: 'paragraph',
        text: 'Pour calculer vos objectifs énergétiques et en macronutriments, générer des menus hebdomadaires adaptés à votre corps et à vos restrictions, et suivre votre évolution dans le temps.',
      },
      {type: 'heading', text: 'Qui les reçoit'},
      {
        type: 'paragraph',
        text: 'Notre base de données et notre serveur d’application, dans l’Union européenne, et Google Gemini, qui génère le menu. Les informations envoyées au modèle d’IA ne comprennent ni votre nom, ni votre adresse e-mail, ni votre identifiant de compte.',
      },
      {type: 'heading', text: 'Que se passe-t-il en cas de refus'},
      {
        type: 'paragraph',
        text: 'Fournir des données de santé est facultatif, mais le service ne peut ni calculer vos objectifs ni générer de menus sans elles. Si vous retirez ce consentement, nous cessons de générer des menus et vous pouvez toujours exporter ou supprimer vos données.',
      },
      {type: 'heading', text: 'Votre déclaration'},
      {
        type: 'paragraph',
        text: 'J’ai lu la Politique de confidentialité et je consens librement, de manière éclairée et explicite au traitement de mes données de santé aux fins décrites ci-dessus. Je comprends que je peux retirer ce consentement à tout moment dans les Réglages et que ce retrait ne remet pas en cause la licéité du traitement effectué avant celui-ci.',
      },
    ],
  },
  health_disclaimer: {
    id: 'health_disclaimer',
    title: 'Avertissement santé',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Nutribio est un outil d’accompagnement pour adultes en bonne santé. Ce n’est pas un dispositif médical, il ne diagnostique, ne traite ni ne prévient aucune maladie et ne remplace pas l’avis d’un médecin ou d’un nutritionniste diplômé.',
      },
      {type: 'heading', text: 'Quand ne pas utiliser les menus'},
      {
        type: 'paragraph',
        text: 'N’utilisez pas les menus comme unique source d’alimentation si vous êtes enceinte ou allaitante, si vous avez ou avez eu un trouble alimentaire, si vous avez un diabète ou une maladie rénale, hépatique, cardiaque ou thyroïdienne, si vous prenez un médicament qui affecte l’appétit ou le métabolisme, ou si vous vous remettez d’une opération. Dans ces cas, suivez le menu d’un professionnel de santé.',
      },
      {type: 'heading', text: 'Vérifiez avant de cuisiner'},
      {
        type: 'paragraph',
        text: 'Les menus sont générés par un modèle d’intelligence artificielle et peuvent contenir des erreurs : vérifiez les ingrédients en ce qui concerne les allergènes et les intolérances, et confirmez que le plat vous convient. Les valeurs de calories et de macronutriments sont des estimations.',
      },
      {type: 'heading', text: 'Quand consulter'},
      {
        type: 'paragraph',
        text: 'Si vous vous sentez mal, si vous avez des vertiges, une fatigue inhabituelle ou tout symptôme qui vous inquiète, arrêtez de suivre le menu et consultez un médecin. En cas d’urgence, appelez le numéro d’urgence local.',
      },
    ],
  },
};

export default fr;
