// Português (Portugal) — textos legais (roadmap item 5, fase 5.2).
// Tradução do texto-fonte en-GB; a estrutura de blocos tem de coincidir
// (verificada por `npm run i18n:check`). Marcadores entre parênteses retos
// aguardam os dados do responsável — ver docs/legal/README.md.

import type {LegalCatalog} from './types';

const ptPT: LegalCatalog = {
  terms: {
    id: 'terms',
    title: 'Termos de Utilização',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Quem somos'},
      {
        type: 'paragraph',
        text: 'O Nutribio («Nutribio», «nós») é operado por [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Podes contactar-nos através de [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. O serviço'},
      {
        type: 'paragraph',
        text: 'O Nutribio cria planos alimentares semanais a partir das informações que forneces — perfil, objetivo e restrições alimentares — e, se as registares, das medições de bioimpedância. Os cálculos nutricionais são determinísticos; os pratos, as porções e a lista de compras são gerados por um modelo de inteligência artificial (Google Gemini) a partir desses cálculos.',
      },
      {
        type: 'paragraph',
        text: 'O Nutribio é uma ferramenta de apoio para adultos saudáveis. Não é um dispositivo médico e não presta aconselhamento médico ou nutricional — consulta o Aviso de saúde.',
      },
      {type: 'heading', text: '3. Quem pode usar'},
      {
        type: 'paragraph',
        text: 'Tens de ter pelo menos 18 anos e capacidade legal para celebrar um contrato. Não podes usar o Nutribio em nome de outra pessoa sem a sua autorização.',
      },
      {type: 'heading', text: '4. A tua conta'},
      {
        type: 'paragraph',
        text: 'Crias uma conta com um endereço de email e uma palavra-passe. Tens de fornecer informações corretas, manter a palavra-passe confidencial e avisar-nos imediatamente se suspeitares de acesso não autorizado. És responsável pela atividade realizada na tua conta.',
      },
      {type: 'heading', text: '5. Utilização aceitável'},
      {type: 'paragraph', text: 'Comprometes-te a não:'},
      {
        type: 'list',
        items: [
          'utilizar indevidamente o serviço ou tentar aceder aos dados de outros utilizadores;',
          'copiar, extrair automaticamente, fazer engenharia inversa ou revender o serviço;',
          'utilizar o serviço para violar a lei ou direitos de terceiros;',
          'tentar manipular o modelo de IA, contornar limites ou evadir o limite de gerações gratuitas;',
          'carregar conteúdos ilícitos ou sobre os quais não tenhas direitos.',
        ],
      },
      {type: 'heading', text: '6. Conteúdo gerado por IA'},
      {
        type: 'paragraph',
        text: 'Os planos são gerados por um modelo e podem conter erros ou aproximações: os valores de calorias e macronutrientes são estimativas, as porções podem variar e a disponibilidade dos produtos depende do teu país e do supermercado. Tens de verificar os ingredientes e os alergénios, sobretudo se tiveres uma alergia ou intolerância. A lista de compras é uma sugestão que abrange todas as variações da semana — compra apenas o que pretendes cozinhar.',
      },
      {type: 'heading', text: '7. Planos, preços e subscrição'},
      {
        type: 'paragraph',
        text: 'Cada conta tem uma geração de plano gratuita. Depois disso, gerar um plano exige uma subscrição mensal ativa. Não existe plano anual. Os preços, as moedas (EUR ou BRL conforme o teu país) e os impostos são apresentados no pagamento antes de pagares.',
      },
      {
        type: 'paragraph',
        text: 'A subscrição renova automaticamente todos os meses até ser cancelada. Podes cancelar a qualquer momento no portal de faturação; o cancelamento produz efeitos no fim do período pago em curso e mantém o acesso até lá. Podemos alterar o preço com um aviso prévio mínimo de 30 dias; se não aceitares a alteração, podes cancelar antes de esta se aplicar.',
      },
      {
        type: 'paragraph',
        text: 'Os pagamentos são processados pelo nosso prestador de pagamentos, que atua como vendedor (merchant of record) da transação. Os dados do teu cartão nunca chegam aos nossos servidores.',
      },
      {type: 'heading', text: '8. Direito de livre resolução'},
      {
        type: 'paragraph',
        text: 'Se fores consumidor na União Europeia, tens 14 dias para resolver um contrato de conteúdo digital. Ao pedires-nos o início imediato do serviço, reconheces que perdes esse direito assim que o conteúdo for entregue (ou seja, assim que o plano for gerado). Se fores consumidor no Brasil, o artigo 49.º do Código de Defesa do Consumidor dá-te 7 dias para desistir de uma compra feita fora de um estabelecimento físico.',
      },
      {type: 'paragraph', text: 'Para exercer estes direitos, contacta [CONTACT_EMAIL].'},
      {type: 'heading', text: '9. Propriedade intelectual'},
      {
        type: 'paragraph',
        text: 'A aplicação, os seus textos e o seu design pertencem-nos ou aos nossos licenciantes. Os teus dados pertencem-te. Os planos gerados para ti destinam-se a uso pessoal; podes partilhá-los, mas não vendê-los nem usá-los comercialmente.',
      },
      {type: 'heading', text: '10. Disponibilidade e alterações'},
      {
        type: 'paragraph',
        text: 'Prestamos o serviço com a melhor diligência e podemos interrompê-lo para manutenção ou melhorias. Podemos alterar ou descontinuar funcionalidades; se uma alteração te afetar de forma significativa, daremos um aviso razoável.',
      },
      {type: 'heading', text: '11. Responsabilidade'},
      {
        type: 'paragraph',
        text: 'Na medida permitida por lei, não somos responsáveis por danos indiretos nem por resultados de saúde decorrentes do seguimento de um plano. Nada nestes Termos limita os direitos que a lei de consumo te confere e que não podem ser renunciados.',
      },
      {type: 'heading', text: '12. Suspensão e cessação'},
      {
        type: 'paragraph',
        text: 'Podes eliminar a tua conta a qualquer momento nas Definições. Podemos suspender ou encerrar uma conta que viole estes Termos, que seja usada de forma fraudulenta ou que coloque em risco o serviço ou outros utilizadores. Eliminar a conta remove os teus dados conforme descrito na Política de Privacidade.',
      },
      {type: 'heading', text: '13. Lei aplicável e litígios'},
      {
        type: 'paragraph',
        text: 'Estes Termos regem-se pela lei portuguesa. Se fores consumidor, podes também invocar as normas imperativas de proteção do consumidor do teu país de residência e recorrer aos tribunais competentes desse país.',
      },
      {type: 'heading', text: '14. Alterações a estes Termos'},
      {
        type: 'paragraph',
        text: 'Podemos atualizar estes Termos. Cada versão tem um identificador; as alterações materiais exigem que aceites a nova versão antes de continuares a usar o serviço. A versão que aceitaste é registada com a data.',
      },
      {type: 'heading', text: '15. Contacto'},
      {type: 'paragraph', text: 'Questões sobre estes Termos: [CONTACT_EMAIL].'},
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
        text: 'O responsável pelo tratamento é [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Contacto: [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. Em resumo'},
      {
        type: 'list',
        items: [
          'recolhemos apenas os dados necessários para calcular os teus objetivos, gerar planos e gerir a tua conta;',
          'os dados de saúde só são tratados com o teu consentimento explícito;',
          'não vendemos os teus dados e não usamos análises nem publicidade;',
          'podes exportar ou eliminar os teus dados a qualquer momento.',
        ],
      },
      {type: 'heading', text: '3. O que recolhemos'},
      {
        type: 'list',
        items: [
          'Conta: endereço de email, palavra-passe (guardada com hash pelo nosso prestador de autenticação), idioma e tokens de sessão.',
          'Perfil: sexo, idade, altura, peso inicial, objetivo, país, hábitos de exercício e suplementos; e, apenas se decidires fornecê-los, o teu nome e as restrições alimentares e observações em texto livre.',
          'Bioimpedância: as medições que registas — peso, gordura corporal, água, metabolismo basal, gordura visceral, IMC, músculo, proteína, massa óssea, idade corporal e peso ideal.',
          'Planos: a semana gerada, os cálculos utilizados, a variação de prato que escolhes e os artigos que marcas como comprados.',
          'Consentimentos: que documentos e versões aceitaste, em que idioma e quando.',
          'Faturação (subscritores): identificador de cliente, estado da subscrição e faturas, tratados pelo prestador de pagamentos.',
          'Registos técnicos: rota, estado da resposta e código de erro. Não registamos corpos de pedidos, tokens nem dados de saúde.',
        ],
      },
      {type: 'heading', text: '4. Dados de saúde'},
      {
        type: 'paragraph',
        text: 'As medições de bioimpedância, as restrições alimentares e as observações podem revelar informações sobre a tua saúde, incluindo alergias, intolerâncias ou práticas religiosas. Tratamo-las como dados de categoria especial e só as tratamos com o teu consentimento explícito, que dás separadamente no registo e podes retirar a qualquer momento. Sem esse consentimento não podemos gerar planos.',
      },
      {type: 'heading', text: '5. Porque tratamos os dados e com que fundamento'},
      {
        type: 'list',
        items: [
          'Para criar e proteger a tua conta e enviar os emails necessários para iniciares sessão — execução de um contrato.',
          'Para calcular os teus objetivos e gerar planos — execução de um contrato, acrescida do teu consentimento explícito para os dados de saúde.',
          'Para manter o registo dos teus consentimentos — obrigação legal (responsabilização).',
          'Para processar pagamentos e conservar registos fiscais — contrato e obrigação legal.',
          'Para proteger o serviço, através de registos de segurança e prevenção de abusos — interesse legítimo.',
        ],
      },
      {type: 'heading', text: '6. Com quem partilhamos'},
      {
        type: 'paragraph',
        text: 'Recorremos a prestadores de serviços que tratam dados em nosso nome:',
      },
      {
        type: 'list',
        items: [
          'Supabase — base de dados e autenticação, alojada na União Europeia.',
          'O alojamento da nossa API — servidor de aplicações, na União Europeia.',
          'Google (API Gemini) — gera o plano a partir das informações descritas abaixo.',
          'O nosso prestador de email — entrega os códigos de acesso e de recuperação.',
          'O nosso prestador de pagamentos — processa pagamentos e faturas.',
        ],
      },
      {
        type: 'paragraph',
        text: 'As informações enviadas ao modelo de IA incluem o teu sexo, idade, altura, peso, objetivo, hábitos de exercício, suplementos, a última medição de bioimpedância, as tuas restrições alimentares e observações, e o teu país e idioma. Não incluem o teu nome, endereço de email ou identificador de conta. Não vendemos os teus dados nem os partilhamos para publicidade.',
      },
      {type: 'heading', text: '7. Transferências internacionais'},
      {
        type: 'paragraph',
        text: 'A nossa base de dados e a nossa API estão alojadas na União Europeia. Alguns prestadores, em especial o prestador de IA, podem tratar dados fora do Espaço Económico Europeu; quando isso acontece, recorremos às garantias exigidas por lei, como as cláusulas contratuais-tipo ou uma decisão de adequação. [TRANSFER_NOTE]',
      },
      {type: 'heading', text: '8. Durante quanto tempo conservamos'},
      {
        type: 'paragraph',
        text: 'Conservamos a conta, o perfil, as medições, os planos e os consentimentos até eliminares a conta. As contas inativas são eliminadas após [RETENTION_PERIOD]. Os registos de faturação são conservados pelo período exigido pela lei fiscal. Os registos técnicos são conservados por um período curto e não contêm dados pessoais.',
      },
      {type: 'heading', text: '9. Segurança'},
      {
        type: 'paragraph',
        text: 'Os dados são cifrados em trânsito. A base de dados é privada, não está exposta à API pública do nosso prestador e só é acessível através do nosso servidor de aplicações. Os tokens de acesso são de curta duração e verificados criptograficamente. Os segredos ficam fora do código da aplicação.',
      },
      {type: 'heading', text: '10. Os teus direitos'},
      {
        type: 'list',
        items: [
          'Acesso e portabilidade: descarrega uma cópia dos teus dados nas Definições.',
          'Retificação: corrige o teu perfil e as tuas medições no ecrã Dados.',
          'Eliminação: elimina a tua conta nas Definições; a eliminação remove os teus dados da nossa base de dados.',
          'Retirada do consentimento: retira o consentimento para dados de saúde nas Definições; a geração de planos pára.',
          'Limitação e oposição: contacta-nos através de [CONTACT_EMAIL].',
          'Reclamação: podes reclamar junto da autoridade de controlo nacional — em Portugal, a CNPD; no Brasil, a ANPD. [COMPLAINT_AUTHORITY]',
        ],
      },
      {
        type: 'paragraph',
        text: 'Respondemos aos pedidos dentro dos prazos legais: um mês no âmbito do RGPD e 15 dias no âmbito da LGPD.',
      },
      {type: 'heading', text: '11. Cookies e armazenamento local'},
      {
        type: 'paragraph',
        text: 'Utilizamos apenas armazenamento estritamente necessário: a sessão que te mantém autenticado e uma cópia local dos teus dados para leitura offline. Não usamos análises, cookies publicitários nem píxeis de rastreamento, razão pela qual não vês um banner de cookies.',
      },
      {type: 'heading', text: '12. Crianças'},
      {
        type: 'paragraph',
        text: 'O serviço destina-se a adultos. Não recolhemos conscientemente dados de menores de 18 anos.',
      },
      {type: 'heading', text: '13. Alterações'},
      {
        type: 'paragraph',
        text: 'Podemos atualizar esta política. Cada versão tem um identificador; as alterações materiais exigem a tua aceitação antes de continuares a usar o serviço.',
      },
      {type: 'heading', text: '14. Contacto'},
      {type: 'paragraph', text: 'Questões e pedidos de privacidade: [CONTACT_EMAIL].'},
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
        text: 'Este consentimento abrange o tratamento dos teus dados de saúde pelo Nutribio.',
      },
      {type: 'heading', text: 'Que dados'},
      {
        type: 'list',
        items: [
          'medições de bioimpedância: peso, gordura corporal, água, metabolismo basal, gordura visceral, IMC, músculo, proteína, massa óssea, idade corporal e peso ideal;',
          'o teu objetivo e os teus hábitos de exercício;',
          'as tuas restrições alimentares e observações gerais, que podem revelar alergias, intolerâncias ou práticas religiosas;',
          'os planos alimentares gerados a partir destas informações.',
        ],
      },
      {type: 'heading', text: 'Porquê'},
      {
        type: 'paragraph',
        text: 'Para calcular os teus objetivos energéticos e de macronutrientes, gerar planos alimentares semanais adaptados ao teu corpo e às tuas restrições, e mostrar a tua evolução ao longo do tempo.',
      },
      {type: 'heading', text: 'Quem recebe'},
      {
        type: 'paragraph',
        text: 'A nossa base de dados e o nosso servidor de aplicações, na União Europeia, e o Google Gemini, que gera o plano. As informações enviadas ao modelo de IA não incluem o teu nome, endereço de email ou identificador de conta.',
      },
      {type: 'heading', text: 'O que acontece se recusares'},
      {
        type: 'paragraph',
        text: 'O fornecimento de dados de saúde é opcional, mas o serviço não consegue calcular objetivos nem gerar planos sem eles. Se retirares este consentimento, deixamos de gerar planos e podes ainda exportar ou eliminar os teus dados.',
      },
      {type: 'heading', text: 'A tua declaração'},
      {
        type: 'paragraph',
        text: 'Li a Política de Privacidade e consinto, de forma livre, informada e explícita, no tratamento dos meus dados de saúde para as finalidades descritas acima. Compreendo que posso retirar este consentimento a qualquer momento nas Definições e que a retirada não afeta a licitude do tratamento realizado antes dela.',
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
        text: 'O Nutribio é uma ferramenta de apoio para adultos saudáveis. Não é um dispositivo médico, não diagnostica, trata ou previne qualquer doença e não substitui a orientação de um médico ou de um nutricionista credenciado.',
      },
      {type: 'heading', text: 'Quando não deves usar os planos'},
      {
        type: 'paragraph',
        text: 'Não uses os planos como única fonte de alimentação se estiveres grávida ou a amamentar, se tiveres ou tiveres tido um distúrbio alimentar, se tiveres diabetes ou doença renal, hepática, cardíaca ou da tiroide, se tomares medicação que afete o apetite ou o metabolismo, ou se estiveres a recuperar de uma cirurgia. Nestes casos, segue o plano de um profissional de saúde.',
      },
      {type: 'heading', text: 'Confirma antes de cozinhar'},
      {
        type: 'paragraph',
        text: 'Os planos são gerados por um modelo de inteligência artificial e podem conter erros: verifica os ingredientes quanto a alergénios e intolerâncias e confirma que o prato é adequado para ti. Os valores de calorias e macronutrientes são estimativas.',
      },
      {type: 'heading', text: 'Quando procurar ajuda'},
      {
        type: 'paragraph',
        text: 'Se te sentires mal, com tonturas, invulgarmente cansado ou com qualquer sintoma que te preocupe, deixa de seguir o plano e procura aconselhamento médico. Numa emergência, contacta o número de emergência local.',
      },
    ],
  },
};

export default ptPT;
