// Localized copy for the Supabase Auth transactional emails (DECISIONS #39).
//
// These strings feed `scripts/build_email_templates.mjs`, which generates the
// Go templates in `supabase/templates/*.html`. The templates pick a language
// from `{{ .Data.locale }}` — the `user_metadata.locale` the web app sends on
// signUp/OTP calls — and fall back to en-GB when it is missing (e.g. Google
// sign-in) or unknown.
//
// Keep the copy short and plain: transactional emails must survive aggressive
// spam filters and render on any client.

export const EMAIL_LOCALES = ['en-GB', 'pt-PT', 'pt-BR', 'es', 'fr', 'de', 'it'];

export const FALLBACK_LOCALE = 'en-GB';

export const emailStrings = {
  'en-GB': {
    hello: 'Hi,',
    codeLabel: 'Your verification code',
    expiry: 'This code expires in 15 minutes.',
    confirmIntro:
      'Use the code below to confirm your email address and finish creating your Nutribio account.',
    recoveryIntro: 'Use the code below to reset your Nutribio password.',
    emailChangeIntro: 'Use the code below to confirm your new email address.',
    reauthIntro: "Use the code below to confirm it's you before continuing.",
    linkFallback: 'Or use this link:',
    linkLabel: 'Continue',
    ignoreConfirm: "If you didn't sign up for Nutribio, you can ignore this email.",
    ignoreRecovery: "If you didn't ask to reset your password, you can ignore this email.",
    ignoreChange: "If you didn't ask to change your email, you can ignore this email.",
    ignoreReauth: "If you didn't try to change a sensitive setting, you can ignore this email.",
    footer:
      'Nutribio — weekly meal plans built from your body data. This is an automated message, please do not reply.',
  },
  'pt-PT': {
    hello: 'Olá,',
    codeLabel: 'O teu código de verificação',
    expiry: 'Este código expira em 15 minutos.',
    confirmIntro:
      'Usa o código abaixo para confirmar o teu email e concluir a criação da conta Nutribio.',
    recoveryIntro: 'Usa o código abaixo para redefinir a palavra-passe da tua conta Nutribio.',
    emailChangeIntro: 'Usa o código abaixo para confirmar o teu novo email.',
    reauthIntro: 'Usa o código abaixo para confirmar que és tu antes de continuares.',
    linkFallback: 'Ou usa esta ligação:',
    linkLabel: 'Continuar',
    ignoreConfirm: 'Se não criaste uma conta Nutribio, podes ignorar este email.',
    ignoreRecovery: 'Se não pediste para redefinir a palavra-passe, podes ignorar este email.',
    ignoreChange: 'Se não pediste para alterar o email, podes ignorar este email.',
    ignoreReauth: 'Se não tentaste alterar uma definição sensível, podes ignorar este email.',
    footer:
      'Nutribio — planos alimentares semanais criados a partir dos teus dados corporais. Esta é uma mensagem automática, não respondas.',
  },
  'pt-BR': {
    hello: 'Olá,',
    codeLabel: 'Seu código de verificação',
    expiry: 'Este código expira em 15 minutos.',
    confirmIntro:
      'Use o código abaixo para confirmar seu e-mail e concluir a criação da conta Nutribio.',
    recoveryIntro: 'Use o código abaixo para redefinir a senha da sua conta Nutribio.',
    emailChangeIntro: 'Use o código abaixo para confirmar seu novo e-mail.',
    reauthIntro: 'Use o código abaixo para confirmar que é você antes de continuar.',
    linkFallback: 'Ou use este link:',
    linkLabel: 'Continuar',
    ignoreConfirm: 'Se você não criou uma conta Nutribio, pode ignorar este e-mail.',
    ignoreRecovery: 'Se você não pediu para redefinir a senha, pode ignorar este e-mail.',
    ignoreChange: 'Se você não pediu para alterar o e-mail, pode ignorar este e-mail.',
    ignoreReauth: 'Se você não tentou alterar uma configuração sensível, pode ignorar este e-mail.',
    footer:
      'Nutribio — planos alimentares semanais criados a partir dos seus dados corporais. Esta é uma mensagem automática, não responda.',
  },
  es: {
    hello: 'Hola:',
    codeLabel: 'Tu código de verificación',
    expiry: 'Este código caduca en 15 minutos.',
    confirmIntro:
      'Usa el código de abajo para confirmar tu correo electrónico y terminar de crear tu cuenta de Nutribio.',
    recoveryIntro: 'Usa el código de abajo para restablecer la contraseña de tu cuenta de Nutribio.',
    emailChangeIntro: 'Usa el código de abajo para confirmar tu nuevo correo electrónico.',
    reauthIntro: 'Usa el código de abajo para confirmar que eres tú antes de continuar.',
    linkFallback: 'O usa este enlace:',
    linkLabel: 'Continuar',
    ignoreConfirm: 'Si no creaste una cuenta de Nutribio, puedes ignorar este correo.',
    ignoreRecovery: 'Si no pediste restablecer la contraseña, puedes ignorar este correo.',
    ignoreChange: 'Si no pediste cambiar el correo, puedes ignorar este correo.',
    ignoreReauth: 'Si no intentaste cambiar una opción sensible, puedes ignorar este correo.',
    footer:
      'Nutribio — planes de comidas semanales creados a partir de tus datos corporales. Este es un mensaje automático, no respondas.',
  },
  fr: {
    hello: 'Bonjour,',
    codeLabel: 'Votre code de vérification',
    expiry: 'Ce code expire dans 15 minutes.',
    confirmIntro:
      'Utilisez le code ci-dessous pour confirmer votre adresse e-mail et terminer la création de votre compte Nutribio.',
    recoveryIntro:
      'Utilisez le code ci-dessous pour réinitialiser le mot de passe de votre compte Nutribio.',
    emailChangeIntro: 'Utilisez le code ci-dessous pour confirmer votre nouvelle adresse e-mail.',
    reauthIntro: 'Utilisez le code ci-dessous pour confirmer votre identité avant de continuer.',
    linkFallback: 'Ou utilisez ce lien :',
    linkLabel: 'Continuer',
    ignoreConfirm: "Si vous n'avez pas créé de compte Nutribio, ignorez cet e-mail.",
    ignoreRecovery: "Si vous n'avez pas demandé de réinitialisation, ignorez cet e-mail.",
    ignoreChange: "Si vous n'avez pas demandé de changement d'e-mail, ignorez cet e-mail.",
    ignoreReauth: "Si vous n'avez pas tenté de modifier un réglage sensible, ignorez cet e-mail.",
    footer:
      'Nutribio — des menus hebdomadaires créés à partir de vos données corporelles. Ceci est un message automatique, merci de ne pas y répondre.',
  },
  de: {
    hello: 'Hallo,',
    codeLabel: 'Dein Bestätigungscode',
    expiry: 'Dieser Code läuft in 15 Minuten ab.',
    confirmIntro:
      'Nutze den Code unten, um deine E-Mail-Adresse zu bestätigen und dein Nutribio-Konto fertig einzurichten.',
    recoveryIntro: 'Nutze den Code unten, um das Passwort deines Nutribio-Kontos zurückzusetzen.',
    emailChangeIntro: 'Nutze den Code unten, um deine neue E-Mail-Adresse zu bestätigen.',
    reauthIntro: 'Nutze den Code unten, um dich zu bestätigen, bevor du fortfährst.',
    linkFallback: 'Oder nutze diesen Link:',
    linkLabel: 'Weiter',
    ignoreConfirm: 'Wenn du kein Nutribio-Konto erstellt hast, kannst du diese E-Mail ignorieren.',
    ignoreRecovery: 'Wenn du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.',
    ignoreChange: 'Wenn du die E-Mail-Adresse nicht ändern wolltest, kannst du diese E-Mail ignorieren.',
    ignoreReauth: 'Wenn du keine sensible Einstellung ändern wolltest, kannst du diese E-Mail ignorieren.',
    footer:
      'Nutribio — wöchentliche Ernährungspläne auf Basis deiner Körperdaten. Dies ist eine automatische Nachricht, bitte antworte nicht darauf.',
  },
  it: {
    hello: 'Ciao,',
    codeLabel: 'Il tuo codice di verifica',
    expiry: 'Questo codice scade tra 15 minuti.',
    confirmIntro:
      "Usa il codice qui sotto per confermare la tua email e completare la creazione dell'account Nutribio.",
    recoveryIntro: 'Usa il codice qui sotto per reimpostare la password del tuo account Nutribio.',
    emailChangeIntro: 'Usa il codice qui sotto per confermare la tua nuova email.',
    reauthIntro: 'Usa il codice qui sotto per confermare che sei tu prima di continuare.',
    linkFallback: 'Oppure usa questo link:',
    linkLabel: 'Continua',
    ignoreConfirm: 'Se non hai creato un account Nutribio, puoi ignorare questa email.',
    ignoreRecovery: 'Se non hai richiesto il cambio password, puoi ignorare questa email.',
    ignoreChange: "Se non hai richiesto il cambio email, puoi ignorare questa email.",
    ignoreReauth: 'Se non hai tentato di modificare un\'impostazione sensibile, puoi ignorare questa email.',
    footer:
      'Nutribio — piani alimentari settimanali creati dai tuoi dati corporei. Questo è un messaggio automatico, non rispondere.',
  },
};

export const TEMPLATE_KINDS = {
  confirmation: {intro: 'confirmIntro', ignore: 'ignoreConfirm'},
  recovery: {intro: 'recoveryIntro', ignore: 'ignoreRecovery'},
  email_change: {intro: 'emailChangeIntro', ignore: 'ignoreChange'},
  reauthentication: {intro: 'reauthIntro', ignore: 'ignoreReauth'},
};
