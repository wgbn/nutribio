// Português (Brasil) — textos legais (roadmap item 5, fase 5.2).
// Adaptação do texto-fonte en-GB ao português do Brasil (forma "você");
// a estrutura de blocos tem de coincidir (verificada por `npm run i18n:check`).

import type {LegalCatalog} from './types';

const ptBR: LegalCatalog = {
  terms: {
    id: 'terms',
    title: 'Termos de Uso',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Quem somos'},
      {
        type: 'paragraph',
        text: 'O Nutribio («Nutribio», «nós») é operado por [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Você pode falar conosco pelo email [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. O serviço'},
      {
        type: 'paragraph',
        text: 'O Nutribio cria planos alimentares semanais a partir das informações que você fornece — perfil, objetivo e restrições alimentares — e, se você registrá-las, das medições de bioimpedância. Os cálculos nutricionais são determinísticos; os pratos, as porções e a lista de compras são gerados por um modelo de inteligência artificial (Google Gemini) a partir desses cálculos.',
      },
      {
        type: 'paragraph',
        text: 'O Nutribio é uma ferramenta de apoio para adultos saudáveis. Não é um dispositivo médico e não oferece orientação médica ou nutricional — consulte o Aviso de saúde.',
      },
      {type: 'heading', text: '3. Quem pode usar'},
      {
        type: 'paragraph',
        text: 'Você precisa ter pelo menos 18 anos e capacidade legal para firmar um contrato. Não é permitido usar o Nutribio em nome de outra pessoa sem a autorização dela.',
      },
      {type: 'heading', text: '4. Sua conta'},
      {
        type: 'paragraph',
        text: 'Você cria uma conta com um endereço de email e uma senha. Deve fornecer informações corretas, manter a senha em sigilo e nos avisar imediatamente se suspeitar de acesso não autorizado. Você é responsável pela atividade realizada na sua conta.',
      },
      {type: 'heading', text: '5. Uso aceitável'},
      {type: 'paragraph', text: 'Você concorda em não:'},
      {
        type: 'list',
        items: [
          'usar o serviço de forma indevida ou tentar acessar os dados de outros usuários;',
          'copiar, extrair automaticamente, fazer engenharia reversa ou revender o serviço;',
          'usar o serviço para violar a lei ou direitos de terceiros;',
          'tentar manipular o modelo de IA, contornar limites ou burlar o limite de gerações gratuitas;',
          'enviar conteúdos ilícitos ou sobre os quais você não tenha direitos.',
        ],
      },
      {type: 'heading', text: '6. Conteúdo gerado por IA'},
      {
        type: 'paragraph',
        text: 'Os planos são gerados por um modelo e podem conter erros ou aproximações: os valores de calorias e macronutrientes são estimativas, as porções podem variar e a disponibilidade dos produtos depende do seu país e do supermercado. Você deve conferir os ingredientes e os alergênicos, principalmente se tiver alguma alergia ou intolerância. A lista de compras é uma sugestão que abrange todas as variações da semana — compre apenas o que pretende cozinhar.',
      },
      {type: 'heading', text: '7. Planos, preços e assinatura'},
      {
        type: 'paragraph',
        text: 'Cada conta tem uma geração de plano gratuita. Depois disso, para gerar um plano é preciso ter uma assinatura mensal ativa. Não existe plano anual. Os preços, as moedas (EUR ou BRL conforme o seu país) e os impostos são mostrados no pagamento antes de você pagar.',
      },
      {
        type: 'paragraph',
        text: 'A assinatura é renovada automaticamente todos os meses até ser cancelada. Você pode cancelar a qualquer momento no portal de cobrança; o cancelamento vale a partir do fim do período já pago e o acesso continua até lá. Podemos alterar o preço com aviso prévio mínimo de 30 dias; se você não aceitar a mudança, pode cancelar antes de ela valer.',
      },
      {
        type: 'paragraph',
        text: 'Os pagamentos são processados pelo nosso provedor de pagamentos, que atua como vendedor (merchant of record) da transação. Os dados do seu cartão nunca chegam aos nossos servidores.',
      },
      {type: 'heading', text: '8. Direito de arrependimento'},
      {
        type: 'paragraph',
        text: 'Se você for consumidor na União Europeia, tem 14 dias para desistir de um contrato de conteúdo digital. Ao nos pedir o início imediato do serviço, você reconhece que perde esse direito assim que o conteúdo for entregue (ou seja, assim que o plano for gerado). Se você for consumidor no Brasil, o artigo 49 do Código de Defesa do Consumidor garante 7 dias para desistir de uma compra feita fora de um estabelecimento físico.',
      },
      {type: 'paragraph', text: 'Para exercer esses direitos, fale conosco pelo email [CONTACT_EMAIL].'},
      {type: 'heading', text: '9. Propriedade intelectual'},
      {
        type: 'paragraph',
        text: 'O aplicativo, seus textos e seu design pertencem a nós ou aos nossos licenciantes. Seus dados pertencem a você. Os planos gerados para você são de uso pessoal; você pode compartilhá-los, mas não vendê-los nem usá-los comercialmente.',
      },
      {type: 'heading', text: '10. Disponibilidade e mudanças'},
      {
        type: 'paragraph',
        text: 'Prestamos o serviço com a melhor diligência e podemos interrompê-lo para manutenção ou melhorias. Podemos alterar ou descontinuar funcionalidades; se uma mudança afetar você de forma relevante, daremos um aviso razoável.',
      },
      {type: 'heading', text: '11. Responsabilidade'},
      {
        type: 'paragraph',
        text: 'Na medida permitida por lei, não somos responsáveis por danos indiretos nem por resultados de saúde decorrentes do seguimento de um plano. Nada nestes Termos limita os direitos que a lei do consumidor garante a você e que não podem ser renunciados.',
      },
      {type: 'heading', text: '12. Suspensão e encerramento'},
      {
        type: 'paragraph',
        text: 'Você pode excluir a sua conta a qualquer momento nas Configurações. Podemos suspender ou encerrar uma conta que viole estes Termos, que seja usada de forma fraudulenta ou que coloque em risco o serviço ou outros usuários. Excluir a conta remove os seus dados conforme descrito na Política de Privacidade.',
      },
      {type: 'heading', text: '13. Lei aplicável e conflitos'},
      {
        type: 'paragraph',
        text: 'Estes Termos são regidos pela lei de Portugal. Se você for consumidor, pode também invocar as normas obrigatórias de proteção do consumidor do seu país de residência e recorrer aos tribunais competentes desse país.',
      },
      {type: 'heading', text: '14. Mudanças nestes Termos'},
      {
        type: 'paragraph',
        text: 'Podemos atualizar estes Termos. Cada versão tem um identificador; mudanças relevantes exigem que você aceite a nova versão antes de continuar a usar o serviço. A versão que você aceitou fica registrada com a data.',
      },
      {type: 'heading', text: '15. Contato'},
      {type: 'paragraph', text: 'Dúvidas sobre estes Termos: [CONTACT_EMAIL].'},
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Política de Privacidade',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Quem é o responsável'},
      {
        type: 'paragraph',
        text: 'O controlador dos dados é [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Contato: [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. Em resumo'},
      {
        type: 'list',
        items: [
          'coletamos apenas os dados necessários para calcular as suas metas, gerar planos e manter a sua conta;',
          'os dados de saúde só são tratados com o seu consentimento explícito;',
          'não vendemos os seus dados e não usamos análises nem publicidade;',
          'você pode exportar ou excluir os seus dados a qualquer momento.',
        ],
      },
      {type: 'heading', text: '3. O que coletamos'},
      {
        type: 'list',
        items: [
          'Conta: endereço de email, senha (guardada com hash pelo nosso provedor de autenticação), idioma e tokens de sessão.',
          'Perfil: sexo, idade, altura, peso inicial, objetivo, país, hábitos de exercício e suplementos; e, apenas se você decidir informá-los, o seu nome e as restrições alimentares e observações em texto livre.',
          'Bioimpedância: as medições que você registra — peso, gordura corporal, água, metabolismo basal, gordura visceral, IMC, músculo, proteína, massa óssea, idade corporal e peso ideal.',
          'Planos: a semana gerada, os cálculos usados, a variação de prato escolhida e os itens marcados como comprados.',
          'Consentimentos: quais documentos e versões você aceitou, em qual idioma e quando.',
          'Cobrança (assinantes): identificador de cliente, status da assinatura e faturas, tratados pelo provedor de pagamentos.',
          'Registros técnicos: rota, status da resposta e código de erro. Não registramos corpos de requisições, tokens nem dados de saúde.',
        ],
      },
      {type: 'heading', text: '4. Dados de saúde'},
      {
        type: 'paragraph',
        text: 'As medições de bioimpedância, as restrições alimentares e as observações podem revelar informações sobre a sua saúde, incluindo alergias, intolerâncias ou práticas religiosas. Tratamos esses dados como dados pessoais sensíveis e só os tratamos com o seu consentimento explícito, dado separadamente no cadastro e que pode ser retirado a qualquer momento. Sem esse consentimento não podemos gerar planos.',
      },
      {type: 'heading', text: '5. Por que tratamos os dados e com que base legal'},
      {
        type: 'list',
        items: [
          'Para criar e proteger a sua conta e enviar os emails necessários para entrar — execução de contrato.',
          'Para calcular as suas metas e gerar planos — execução de contrato, somada ao seu consentimento explícito para os dados de saúde.',
          'Para manter o registro dos seus consentimentos — obrigação legal (prestação de contas).',
          'Para processar pagamentos e manter registros fiscais — contrato e obrigação legal.',
          'Para proteger o serviço, por meio de registros de segurança e prevenção de abusos — legítimo interesse.',
        ],
      },
      {type: 'heading', text: '6. Com quem compartilhamos'},
      {
        type: 'paragraph',
        text: 'Usamos prestadores de serviços que tratam dados em nosso nome:',
      },
      {
        type: 'list',
        items: [
          'Supabase — banco de dados e autenticação, hospedado na União Europeia.',
          'O host da nossa API — servidor de aplicações, na União Europeia.',
          'Google (API Gemini) — gera o plano a partir das informações descritas abaixo.',
          'Nosso provedor de email — entrega os códigos de acesso e de recuperação.',
          'Nosso provedor de pagamentos — processa pagamentos e faturas.',
        ],
      },
      {
        type: 'paragraph',
        text: 'As informações enviadas ao modelo de IA incluem o seu sexo, idade, altura, peso, objetivo, hábitos de exercício, suplementos, a última medição de bioimpedância, as suas restrições alimentares e observações, e o seu país e idioma. Não incluem o seu nome, endereço de email ou identificador de conta. Não vendemos os seus dados nem os compartilhamos para publicidade.',
      },
      {type: 'heading', text: '7. Transferências internacionais'},
      {
        type: 'paragraph',
        text: 'Nosso banco de dados e nossa API são hospedados na União Europeia. Alguns prestadores, em especial o provedor de IA, podem tratar dados fora do Espaço Econômico Europeu; quando isso acontece, usamos as garantias exigidas por lei, como cláusulas contratuais padrão ou uma decisão de adequação. [TRANSFER_NOTE]',
      },
      {type: 'heading', text: '8. Por quanto tempo guardamos'},
      {
        type: 'paragraph',
        text: 'Guardamos a conta, o perfil, as medições, os planos e os consentimentos até você excluir a conta. Contas inativas são excluídas após [RETENTION_PERIOD]. Registros de cobrança são guardados pelo período exigido pela legislação fiscal. Registros técnicos são guardados por um período curto e não contêm dados pessoais.',
      },
      {type: 'heading', text: '9. Segurança'},
      {
        type: 'paragraph',
        text: 'Os dados são criptografados em trânsito. O banco de dados é privado, não está exposto à API pública do nosso provedor e só é acessível pelo nosso servidor de aplicações. Os tokens de acesso são de curta duração e verificados criptograficamente. Os segredos ficam fora do código da aplicação.',
      },
      {type: 'heading', text: '10. Seus direitos'},
      {
        type: 'list',
        items: [
          'Acesso e portabilidade: baixe uma cópia dos seus dados nas Configurações.',
          'Correção: corrija o seu perfil e as suas medições na tela Dados.',
          'Exclusão: exclua a sua conta nas Configurações; a exclusão remove os seus dados do nosso banco de dados.',
          'Retirada do consentimento: retire o consentimento para dados de saúde nas Configurações; a geração de planos para.',
          'Limitação e oposição: fale conosco pelo email [CONTACT_EMAIL].',
          'Reclamação: você pode reclamar à autoridade nacional de proteção de dados — em Portugal, a CNPD; no Brasil, a ANPD. [COMPLAINT_AUTHORITY]',
        ],
      },
      {
        type: 'paragraph',
        text: 'Respondemos aos pedidos dentro dos prazos legais: um mês no âmbito do RGPD e 15 dias no âmbito da LGPD.',
      },
      {type: 'heading', text: '11. Cookies e armazenamento local'},
      {
        type: 'paragraph',
        text: 'Usamos apenas armazenamento estritamente necessário: a sessão que mantém você conectado e um cache local dos seus dados para leitura offline. Não usamos análises, cookies de publicidade nem pixels de rastreamento, por isso você não vê um banner de cookies.',
      },
      {type: 'heading', text: '12. Crianças'},
      {
        type: 'paragraph',
        text: 'O serviço é destinado a adultos. Não coletamos conscientemente dados de menores de 18 anos.',
      },
      {type: 'heading', text: '13. Mudanças'},
      {
        type: 'paragraph',
        text: 'Podemos atualizar esta política. Cada versão tem um identificador; mudanças relevantes exigem a sua aceitação antes de você continuar a usar o serviço.',
      },
      {type: 'heading', text: '14. Contato'},
      {type: 'paragraph', text: 'Dúvidas e pedidos de privacidade: [CONTACT_EMAIL].'},
    ],
  },
  health_data: {
    id: 'health_data',
    title: 'Consentimento para dados de saúde',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Este consentimento abrange o tratamento dos seus dados de saúde pelo Nutribio.',
      },
      {type: 'heading', text: 'Quais dados'},
      {
        type: 'list',
        items: [
          'medições de bioimpedância: peso, gordura corporal, água, metabolismo basal, gordura visceral, IMC, músculo, proteína, massa óssea, idade corporal e peso ideal;',
          'o seu objetivo e os seus hábitos de exercício;',
          'as suas restrições alimentares e observações gerais, que podem revelar alergias, intolerâncias ou práticas religiosas;',
          'os planos alimentares gerados a partir dessas informações.',
        ],
      },
      {type: 'heading', text: 'Por quê'},
      {
        type: 'paragraph',
        text: 'Para calcular as suas metas de energia e macronutrientes, gerar planos alimentares semanais adaptados ao seu corpo e às suas restrições, e mostrar a sua evolução ao longo do tempo.',
      },
      {type: 'heading', text: 'Quem recebe'},
      {
        type: 'paragraph',
        text: 'Nosso banco de dados e nosso servidor de aplicações, na União Europeia, e o Google Gemini, que gera o plano. As informações enviadas ao modelo de IA não incluem o seu nome, endereço de email ou identificador de conta.',
      },
      {type: 'heading', text: 'O que acontece se você recusar'},
      {
        type: 'paragraph',
        text: 'O fornecimento de dados de saúde é opcional, mas o serviço não consegue calcular metas nem gerar planos sem eles. Se você retirar este consentimento, deixamos de gerar planos e você ainda pode exportar ou excluir os seus dados.',
      },
      {type: 'heading', text: 'Sua declaração'},
      {
        type: 'paragraph',
        text: 'Li a Política de Privacidade e consinto, de forma livre, informada e explícita, no tratamento dos meus dados de saúde para as finalidades descritas acima. Entendo que posso retirar este consentimento a qualquer momento nas Configurações e que a retirada não afeta a legalidade do tratamento realizado antes dela.',
      },
    ],
  },
  health_disclaimer: {
    id: 'health_disclaimer',
    title: 'Aviso de saúde',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'O Nutribio é uma ferramenta de apoio para adultos saudáveis. Não é um dispositivo médico, não diagnostica, trata ou previne doenças e não substitui a orientação de um médico ou de um nutricionista habilitado.',
      },
      {type: 'heading', text: 'Quando não usar os planos'},
      {
        type: 'paragraph',
        text: 'Não use os planos como única fonte de alimentação se estiver grávida ou amamentando, se tiver ou já tiver tido um transtorno alimentar, se tiver diabetes ou doença renal, hepática, cardíaca ou da tireoide, se tomar medicamentos que afetem o apetite ou o metabolismo, ou se estiver se recuperando de uma cirurgia. Nesses casos, siga o plano de um profissional de saúde.',
      },
      {type: 'heading', text: 'Confira antes de cozinhar'},
      {
        type: 'paragraph',
        text: 'Os planos são gerados por um modelo de inteligência artificial e podem conter erros: confira os ingredientes quanto a alergênicos e intolerâncias e confirme que o prato é adequado para você. Os valores de calorias e macronutrientes são estimativas.',
      },
      {type: 'heading', text: 'Quando procurar ajuda'},
      {
        type: 'paragraph',
        text: 'Se você se sentir mal, com tontura, cansaço incomum ou qualquer sintoma que o preocupe, pare de seguir o plano e procure orientação médica. Em uma emergência, ligue para o número de emergência local.',
      },
    ],
  },
};

export default ptBR;
