// Español — textos legales (roadmap item 5, fase 5.2).
// Traducción del texto-fuente en-GB; la estructura de bloques debe coincidir
// (verificada por `npm run i18n:check`).

import type {LegalCatalog} from './types';

const es: LegalCatalog = {
  terms: {
    id: 'terms',
    title: 'Términos de Uso',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Quiénes somos'},
      {
        type: 'paragraph',
        text: 'Nutribio («Nutribio», «nosotros») está operado por [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Puedes contactarnos en [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. El servicio'},
      {
        type: 'paragraph',
        text: 'Nutribio crea planes de comidas semanales a partir de la información que facilitas —perfil, objetivo y restricciones alimentarias— y, si los registras, de las mediciones de bioimpedancia. Los cálculos nutricionales son deterministas; los platos, las raciones y la lista de la compra los genera un modelo de inteligencia artificial (Google Gemini) a partir de esos cálculos.',
      },
      {
        type: 'paragraph',
        text: 'Nutribio es una herramienta de apoyo para adultos sanos. No es un producto sanitario y no ofrece asesoramiento médico ni nutricional: consulta el Aviso de salud.',
      },
      {type: 'heading', text: '3. Quién puede usarlo'},
      {
        type: 'paragraph',
        text: 'Debes tener al menos 18 años y capacidad legal para celebrar un contrato. No puedes usar Nutribio en nombre de otra persona sin su permiso.',
      },
      {type: 'heading', text: '4. Tu cuenta'},
      {
        type: 'paragraph',
        text: 'Creas una cuenta con una dirección de correo electrónico y una contraseña. Debes facilitar información veraz, mantener la contraseña en confidencialidad y avisarnos de inmediato si sospechas de un acceso no autorizado. Eres responsable de la actividad realizada con tu cuenta.',
      },
      {type: 'heading', text: '5. Uso aceptable'},
      {type: 'paragraph', text: 'Te comprometes a no:'},
      {
        type: 'list',
        items: [
          'hacer un uso indebido del servicio ni intentar acceder a los datos de otros usuarios;',
          'copiar, extraer de forma automatizada, aplicar ingeniería inversa o revender el servicio;',
          'usar el servicio para infringir la ley o derechos de terceros;',
          'intentar manipular el modelo de IA, eludir límites o evitar el límite de generaciones gratuitas;',
          'subir contenidos ilícitos o sobre los que no tengas derechos.',
        ],
      },
      {type: 'heading', text: '6. Contenido generado por IA'},
      {
        type: 'paragraph',
        text: 'Los planes los genera un modelo y pueden contener errores o aproximaciones: los valores de calorías y macronutrientes son estimaciones, las raciones pueden variar y la disponibilidad de los productos depende de tu país y de tu supermercado. Debes comprobar los ingredientes y los alérgenos, sobre todo si tienes alguna alergia o intolerancia. La lista de la compra es una sugerencia que abarca todas las variaciones de la semana: compra solo lo que vayas a cocinar.',
      },
      {type: 'heading', text: '7. Planes, precios y suscripción'},
      {
        type: 'paragraph',
        text: 'Cada cuenta tiene una generación de plan gratuita. A partir de ahí, para generar un plan se necesita una suscripción mensual activa. No existe plan anual. Los precios, las monedas (EUR o BRL según tu país) y los impuestos se muestran en el pago antes de que pagues.',
      },
      {
        type: 'paragraph',
        text: 'La suscripción se renueva automáticamente cada mes hasta que la canceles. Puedes cancelarla en cualquier momento en el portal de facturación; la cancelación surte efecto al final del periodo pagado en curso y mantienes el acceso hasta entonces. Podemos cambiar el precio con un preaviso mínimo de 30 días; si no aceptas el cambio, puedes cancelar antes de que se aplique.',
      },
      {
        type: 'paragraph',
        text: 'Los pagos los procesa nuestro proveedor de pagos, que actúa como vendedor (merchant of record) de la transacción. Los datos de tu tarjeta nunca llegan a nuestros servidores.',
      },
      {type: 'heading', text: '8. Derecho de desistimiento'},
      {
        type: 'paragraph',
        text: 'Si eres consumidor en la Unión Europea, tienes 14 días para desistir de un contrato de contenido digital. Al pedirnos que empecemos el servicio de inmediato, reconoces que pierdes ese derecho una vez entregado el contenido (es decir, una vez generado el plan). Si eres consumidor en Brasil, el artículo 49 del Código de Defensa del Consumidor te da 7 días para desistir de una compra realizada fuera de un establecimiento físico.',
      },
      {type: 'paragraph', text: 'Para ejercer estos derechos, escribe a [CONTACT_EMAIL].'},
      {type: 'heading', text: '9. Propiedad intelectual'},
      {
        type: 'paragraph',
        text: 'La aplicación, sus textos y su diseño nos pertenecen o pertenecen a nuestros licenciantes. Tus datos son tuyos. Los planes generados para ti son para uso personal; puedes compartirlos, pero no venderlos ni usarlos comercialmente.',
      },
      {type: 'heading', text: '10. Disponibilidad y cambios'},
      {
        type: 'paragraph',
        text: 'Prestamos el servicio con la mayor diligencia y podemos interrumpirlo por mantenimiento o mejoras. Podemos modificar o retirar funcionalidades; si un cambio te afecta de forma relevante, te avisaremos con antelación razonable.',
      },
      {type: 'heading', text: '11. Responsabilidad'},
      {
        type: 'paragraph',
        text: 'En la medida permitida por la ley, no somos responsables de daños indirectos ni de resultados de salud derivados de seguir un plan. Nada en estos Términos limita los derechos que la legislación de consumo te reconoce y que no pueden renunciarse.',
      },
      {type: 'heading', text: '12. Suspensión y terminación'},
      {
        type: 'paragraph',
        text: 'Puedes eliminar tu cuenta en cualquier momento en Ajustes. Podemos suspender o cancelar una cuenta que infrinja estos Términos, que se use de forma fraudulenta o que ponga en riesgo el servicio o a otros usuarios. Eliminar la cuenta borra tus datos tal como se describe en la Política de Privacidad.',
      },
      {type: 'heading', text: '13. Ley aplicable y conflictos'},
      {
        type: 'paragraph',
        text: 'Estos Términos se rigen por la ley de Portugal. Si eres consumidor, también puedes invocar las normas imperativas de consumo de tu país de residencia y acudir a los tribunales competentes de ese país.',
      },
      {type: 'heading', text: '14. Cambios en estos Términos'},
      {
        type: 'paragraph',
        text: 'Podemos actualizar estos Términos. Cada versión tiene un identificador; los cambios materiales exigen que aceptes la nueva versión antes de seguir usando el servicio. La versión que aceptaste se registra con la fecha.',
      },
      {type: 'heading', text: '15. Contacto'},
      {type: 'paragraph', text: 'Preguntas sobre estos Términos: [CONTACT_EMAIL].'},
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Política de Privacidad',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {type: 'heading', text: '1. Quién es responsable'},
      {
        type: 'paragraph',
        text: 'El responsable del tratamiento es [CONTROLLER_NAME], [CONTROLLER_ADDRESS]. Contacto: [CONTACT_EMAIL].',
      },
      {type: 'heading', text: '2. En resumen'},
      {
        type: 'list',
        items: [
          'solo recogemos los datos necesarios para calcular tus objetivos, generar planes y gestionar tu cuenta;',
          'los datos de salud solo se tratan con tu consentimiento explícito;',
          'no vendemos tus datos y no usamos analítica ni publicidad;',
          'puedes exportar o eliminar tus datos en cualquier momento.',
        ],
      },
      {type: 'heading', text: '3. Qué recogemos'},
      {
        type: 'list',
        items: [
          'Cuenta: dirección de correo electrónico, contraseña (guardada con hash por nuestro proveedor de autenticación), idioma y tokens de sesión.',
          'Perfil: sexo, edad, altura, peso inicial, objetivo, país, hábitos de ejercicio y suplementos; y, solo si decides facilitarlos, tu nombre y tus restricciones alimentarias y observaciones en texto libre.',
          'Bioimpedancia: las mediciones que registras —peso, grasa corporal, agua, metabolismo basal, grasa visceral, IMC, músculo, proteína, masa ósea, edad corporal y peso ideal—.',
          'Planes: la semana generada, los cálculos utilizados, la variación de plato que eliges y los artículos que marcas como comprados.',
          'Consentimientos: qué documentos y versiones aceptaste, en qué idioma y cuándo.',
          'Facturación (suscriptores): identificador de cliente, estado de la suscripción y facturas, gestionados por el proveedor de pagos.',
          'Registros técnicos: ruta, estado de la respuesta y código de error. No registramos cuerpos de peticiones, tokens ni datos de salud.',
        ],
      },
      {type: 'heading', text: '4. Datos de salud'},
      {
        type: 'paragraph',
        text: 'Las mediciones de bioimpedancia, las restricciones alimentarias y las observaciones pueden revelar información sobre tu salud, incluidas alergias, intolerancias o prácticas religiosas. Las tratamos como datos de categoría especial y solo las tratamos con tu consentimiento explícito, que das por separado al registrarte y puedes retirar en cualquier momento. Sin ese consentimiento no podemos generar planes.',
      },
      {type: 'heading', text: '5. Por qué los tratamos y con qué base'},
      {
        type: 'list',
        items: [
          'Para crear y proteger tu cuenta y enviarte los correos necesarios para iniciar sesión: ejecución de un contrato.',
          'Para calcular tus objetivos y generar planes: ejecución de un contrato, más tu consentimiento explícito para los datos de salud.',
          'Para mantener el registro de tus consentimientos: obligación legal (responsabilidad proactiva).',
          'Para procesar pagos y conservar registros fiscales: contrato y obligación legal.',
          'Para proteger el servicio, mediante registros de seguridad y prevención de abusos: nuestro interés legítimo.',
        ],
      },
      {type: 'heading', text: '6. Con quién los compartimos'},
      {
        type: 'paragraph',
        text: 'Usamos proveedores de servicios que tratan datos por cuenta nuestra:',
      },
      {
        type: 'list',
        items: [
          'Supabase: base de datos y autenticación, alojada en la Unión Europea.',
          'El alojamiento de nuestra API: servidor de aplicaciones, en la Unión Europea.',
          'Google (API Gemini): genera el plan a partir de la información descrita abajo.',
          'Nuestro proveedor de correo: entrega los códigos de acceso y recuperación.',
          'Nuestro proveedor de pagos: procesa pagos y facturas.',
        ],
      },
      {
        type: 'paragraph',
        text: 'La información enviada al modelo de IA incluye tu sexo, edad, altura, peso, objetivo, hábitos de ejercicio, suplementos, la última medición de bioimpedancia, tus restricciones alimentarias y observaciones, y tu país e idioma. No incluye tu nombre, dirección de correo electrónico ni identificador de cuenta. No vendemos tus datos ni los compartimos con fines publicitarios.',
      },
      {type: 'heading', text: '7. Transferencias internacionales'},
      {
        type: 'paragraph',
        text: 'Nuestra base de datos y nuestra API están alojadas en la Unión Europea. Algunos proveedores, en particular el proveedor de IA, pueden tratar datos fuera del Espacio Económico Europeo; cuando ocurre, aplicamos las garantías exigidas por la ley, como las cláusulas contractuales tipo o una decisión de adecuación. [TRANSFER_NOTE]',
      },
      {type: 'heading', text: '8. Cuánto tiempo los conservamos'},
      {
        type: 'paragraph',
        text: 'Conservamos tu cuenta, perfil, mediciones, planes y consentimientos hasta que elimines la cuenta. Las cuentas inactivas se eliminan tras [RETENTION_PERIOD]. Los registros de facturación se conservan durante el periodo exigido por la normativa fiscal. Los registros técnicos se conservan poco tiempo y no contienen datos personales.',
      },
      {type: 'heading', text: '9. Seguridad'},
      {
        type: 'paragraph',
        text: 'Los datos se cifran en tránsito. La base de datos es privada, no está expuesta a la API pública de nuestro proveedor y solo es accesible a través de nuestro servidor de aplicaciones. Los tokens de acceso son de corta duración y se verifican criptográficamente. Los secretos se guardan fuera del código de la aplicación.',
      },
      {type: 'heading', text: '10. Tus derechos'},
      {
        type: 'list',
        items: [
          'Acceso y portabilidad: descarga una copia de tus datos en Ajustes.',
          'Rectificación: corrige tu perfil y tus mediciones en la pantalla Datos.',
          'Supresión: elimina tu cuenta en Ajustes; la eliminación borra tus datos de nuestra base de datos.',
          'Retirada del consentimiento: retira el consentimiento para datos de salud en Ajustes; la generación de planes se detiene.',
          'Limitación y oposición: escríbenos a [CONTACT_EMAIL].',
          'Reclamación: puedes reclamar ante tu autoridad de control nacional —en Portugal, la CNPD; en España, la AEPD; en Brasil, la ANPD—. [COMPLAINT_AUTHORITY]',
        ],
      },
      {
        type: 'paragraph',
        text: 'Respondemos a las solicitudes dentro de los plazos legales: un mes según el RGPD y 15 días según la LGPD.',
      },
      {type: 'heading', text: '11. Cookies y almacenamiento local'},
      {
        type: 'paragraph',
        text: 'Solo usamos almacenamiento estrictamente necesario: la sesión que te mantiene conectado y una copia local de tus datos para leerlos sin conexión. No usamos analítica, cookies publicitarias ni píxeles de seguimiento, por eso no ves un banner de cookies.',
      },
      {type: 'heading', text: '12. Menores'},
      {
        type: 'paragraph',
        text: 'El servicio es para adultos. No recogemos conscientemente datos de menores de 18 años.',
      },
      {type: 'heading', text: '13. Cambios'},
      {
        type: 'paragraph',
        text: 'Podemos actualizar esta política. Cada versión tiene un identificador; los cambios materiales exigen tu aceptación antes de seguir usando el servicio.',
      },
      {type: 'heading', text: '14. Contacto'},
      {type: 'paragraph', text: 'Preguntas y solicitudes de privacidad: [CONTACT_EMAIL].'},
    ],
  },
  health_data: {
    id: 'health_data',
    title: 'Consentimiento para datos de salud',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Este consentimiento cubre el tratamiento de tus datos de salud por Nutribio.',
      },
      {type: 'heading', text: 'Qué datos'},
      {
        type: 'list',
        items: [
          'mediciones de bioimpedancia: peso, grasa corporal, agua, metabolismo basal, grasa visceral, IMC, músculo, proteína, masa ósea, edad corporal y peso ideal;',
          'tu objetivo y tus hábitos de ejercicio;',
          'tus restricciones alimentarias y observaciones generales, que pueden revelar alergias, intolerancias o prácticas religiosas;',
          'los planes de comidas generados a partir de esta información.',
        ],
      },
      {type: 'heading', text: 'Por qué'},
      {
        type: 'paragraph',
        text: 'Para calcular tus objetivos de energía y macronutrientes, generar planes de comidas semanales adaptados a tu cuerpo y a tus restricciones, y mostrar tu evolución a lo largo del tiempo.',
      },
      {type: 'heading', text: 'Quién los recibe'},
      {
        type: 'paragraph',
        text: 'Nuestra base de datos y nuestro servidor de aplicaciones, en la Unión Europea, y Google Gemini, que genera el plan. La información enviada al modelo de IA no incluye tu nombre, dirección de correo electrónico ni identificador de cuenta.',
      },
      {type: 'heading', text: 'Qué ocurre si te niegas'},
      {
        type: 'paragraph',
        text: 'Facilitar datos de salud es opcional, pero el servicio no puede calcular objetivos ni generar planes sin ellos. Si retiras este consentimiento, dejamos de generar planes y puedes seguir exportando o eliminando tus datos.',
      },
      {type: 'heading', text: 'Tu declaración'},
      {
        type: 'paragraph',
        text: 'He leído la Política de Privacidad y consiento libre, informada y explícitamente el tratamiento de mis datos de salud para las finalidades descritas arriba. Entiendo que puedo retirar este consentimiento en cualquier momento en Ajustes y que la retirada no afecta a la licitud del tratamiento realizado antes de ella.',
      },
    ],
  },
  health_disclaimer: {
    id: 'health_disclaimer',
    title: 'Aviso de salud',
    version: 'v1',
    updatedAt: '2026-11-06',
    blocks: [
      {
        type: 'paragraph',
        text: 'Nutribio es una herramienta de apoyo para adultos sanos. No es un producto sanitario, no diagnostica, trata ni previene ninguna enfermedad y no sustituye la orientación de un médico o de un nutricionista colegiado.',
      },
      {type: 'heading', text: 'Cuándo no debes usar los planes'},
      {
        type: 'paragraph',
        text: 'No uses los planes como única fuente de alimentación si estás embarazada o en periodo de lactancia, si tienes o has tenido un trastorno alimentario, si tienes diabetes o una enfermedad renal, hepática, cardiaca o tiroidea, si tomas medicación que afecte al apetito o al metabolismo, o si te estás recuperando de una operación. En esos casos, sigue el plan de un profesional sanitario.',
      },
      {type: 'heading', text: 'Comprueba antes de cocinar'},
      {
        type: 'paragraph',
        text: 'Los planes los genera un modelo de inteligencia artificial y pueden contener errores: comprueba los ingredientes en busca de alérgenos e intolerancias y confirma que el plato es adecuado para ti. Los valores de calorías y macronutrientes son estimaciones.',
      },
      {type: 'heading', text: 'Cuándo buscar ayuda'},
      {
        type: 'paragraph',
        text: 'Si te encuentras mal, con mareos, cansancio inusual o cualquier síntoma que te preocupe, deja de seguir el plan y busca consejo médico. En una emergencia, llama al número de emergencias local.',
      },
    ],
  },
};

export default es;
