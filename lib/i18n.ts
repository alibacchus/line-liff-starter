// ──────────── lib/i18n.ts ────────────

export const LANGS = ['ja', 'en', 'zh', 'fr', 'es'] as const;
export type Lang = typeof LANGS[number];

export const Q: Record<Lang, Record<string, string>> = {
  ja: {
    q1:  '大勢でわいわい騒ぐのが好きだ。',
    q2:  'じっとしているのが嫌いだ。',
    q3:  '人と話すと元気になれる。',
    q4:  '予定はぎっしり詰まっている方が好ましい。',
    q5:  '新しいことにすぐ挑戦したいタイプだ。',
    q6:  '細かい作業は苦にならない。',
    q7:  '物事は計画的に進めたい。',
    q8:  '周囲の空気に敏感だ。',
    q9:  '自分の世界に没頭するのが好きだ。',
    q10: '想像することが得意だ。',
    q11: '感情を表現するのに抵抗がない。',
    q12: 'データや数字を重視する方だ。',
    q13: '変化よりも安定を好む。',
    q14: '人の気持ちを察するのが得意だ。',
    q15: '美や芸術にはあまり関心がない。',
  },
  en: {
    q1:  'I like partying in a big group.',
    q2:  'I do not like to stay still.',
    q3:  'Talking to people energizes me.',
    q4:  'I prefer having a packed schedule.',
    q5:  'I am the type to try new things quickly.',
    q6:  "I don't mind detailed tasks.",
    q7:  'I like to plan things systematically.',
    q8:  'I am sensitive to the atmosphere around me.',
    q9:  'I like immersing myself in my own world.',
    q10: 'I am good at imagining things.',
    q11: 'I have no hesitation expressing my emotions.',
    q12: 'I value data and numbers.',
    q13: 'I prefer stability over change.',
    q14: 'I am good at empathizing with others.',
    q15: 'I am not very interested in art or beauty.',
  },
  zh: {
    q1:  '我喜欢和一大群人热闹。',
    q2:  '我不喜欢静止不动。',
    q3:  '与人交谈让我充满活力。',
    q4:  '我喜欢安排充实的日程。',
    q5:  '我是那种会立刻挑战新事物的人。',
    q6:  '我不介意做细致的工作。',
    q7:  '我喜欢按计划推进事情。',
    q8:  '我对周围的氛围很敏感。',
    q9:  '我喜欢沉浸在自己的世界中。',
    q10: '我擅长想象事物。',
    q11: '我毫不犹豫地表达我的情感。',
    q12: '我重视数据和数字。',
    q13: '我更喜欢稳定而非变化。',
    q14: '我擅长体察他人感受。',
    q15: '我对美和艺术不太感兴趣。',
  },
  fr: {
    q1:  "J'aime faire la fête en groupe.",
    q2:  "Je n'aime pas rester immobile.",
    q3:  'Parler aux gens me dynamise.',
    q4:  "Je préfère un emploi du temps bien rempli.",
    q5:  'Je suis du genre à relever de nouveaux défis rapidement.',
    q6:  'Les tâches minutieuses ne me dérangent pas.',
    q7:  "J'aime planifier les choses méthodiquement.",
    q8:  "Je suis sensible à l'atmosphère qui m'entoure.",
    q9:  "J'aime me plonger dans mon propre monde.",
    q10: 'Je suis doué pour imaginer des choses.',
    q11: "Je n'ai aucune hésitation à exprimer mes émotions.",
    q12: 'Je valorise les données et les chiffres.',
    q13: 'Je préfère la stabilité au changement.',
    q14: 'Je suis doué pour percevoir les sentiments des autres.',
    q15: "L'art et la beauté ne m'intéressent pas beaucoup.",
  },
  es: {
    q1:  'Me gusta animarme con mucha gente.',
    q2:  'No me gusta quedarme quieto.',
    q3:  'Hablar con la gente me da energía.',
    q4:  'Prefiero tener una agenda muy ocupada.',
    q5:  'Soy del tipo que quiere probar cosas nuevas de inmediato.',
    q6:  'No me molestan las tareas detalladas.',
    q7:  'Me gusta planificar las cosas metódicamente.',
    q8:  'Soy sensible al ambiente que me rodea.',
    q9:  'Me gusta sumergirme en mi propio mundo.',
    q10: 'Soy bueno imaginando cosas.',
    q11: 'No tengo reparos en expresar mis emociones.',
    q12: 'Valoro los datos y los números.',
    q13: 'Prefiero la estabilidad al cambio.',
    q14: 'Soy bueno percibiendo los sentimientos de los demás.',
    q15: 'No me interesa mucho el arte o la belleza.',
  },
};

export const OPT: Record<Lang, { label: string; data: number }[]> = {
  ja: [
    { label: 'とてもそう思う', data: 5 },
    { label: 'ややそう思う',   data: 4 },
    { label: 'どちらともいえない', data: 3 },
    { label: 'あまりそう思わない', data: 2 },
    { label: 'まったくそう思わない', data: 1 },
  ],
  en: [
    { label: 'Strongly agree', data: 5 },
    { label: 'Agree',          data: 4 },
    { label: 'Neutral',        data: 3 },
    { label: 'Disagree',       data: 2 },
    { label: 'Strongly disagree', data: 1 },
  ],
  zh: [
    { label: '非常同意', data: 5 },
    { label: '同意',   data: 4 },
    { label: '中立',   data: 3 },
    { label: '不同意', data: 2 },
    { label: '非常不同意', data: 1 },
  ],
  fr: [
    { label: "Tout à fait d'accord", data: 5 },
    { label: 'Plutôt d’accord',      data: 4 },
    { label: 'Neutre',               data: 3 },
    { label: 'Plutôt pas d’accord',  data: 2 },
    { label: 'Pas du tout d’accord', data: 1 },
  ],
  es: [
    { label: 'Totalmente de acuerdo', data: 5 },
    { label: 'De acuerdo',           data: 4 },
    { label: 'Neutral',              data: 3 },
    { label: 'En desacuerdo',        data: 2 },
    { label: 'Totalmente en desacuerdo', data: 1 },
  ],
};

export const CONSENT: Record<Lang, {
  prompt:   string;
  yes:      string;
  no:       string;
  thankYou: string;
}> = {
  ja: {
    prompt:   'これから15問の質問をします。よろしいですか？',
    yes:      'はい',
    no:       'いいえ',
    thankYou: 'ご利用ありがとうございました。またいつでもどうぞ！',
  },
  en: {
    prompt:   'We will ask you 15 questions. Is that OK?',
    yes:      'Yes',
    no:       'No',
    thankYou: 'Thank you for your time. Feel free to come back anytime!',
  },
  zh: {
    prompt:   '我们将询问您15个问题，可以吗？',
    yes:      '是',
    no:       '否',
    thankYou: '感谢您的参与，随时欢迎再次使用！',
  },
  fr: {
    prompt:   'Nous allons vous poser 15 questions. Ça vous va ?',
    yes:      'Oui',
    no:       'Non',
    thankYou: 'Merci pour votre participation. Revenez quand vous voulez !',
  },
  es: {
    prompt:   'Vamos a hacerle 15 preguntas. ¿Está bien?',
    yes:      'Sí',
    no:       'No',
    thankYou: 'Gracias por su tiempo. ¡Vuelva cuando quiera!',
  },
};
