// lib/questions.ts

export type Question = {
  ja: string
  en: string
}

// 日本語／英語での設問文を 15 問分定義
export const questions: Question[] = [
  { ja: 'Q1: あなたの年齢を教えてください。',                           en: 'Q1: What is your age?' },
  { ja: 'Q2: あなたの性別を教えてください。',                           en: 'Q2: What is your gender?' },
  { ja: 'Q3: あなたの職業を教えてください。',                           en: 'Q3: What is your occupation?' },
  { ja: 'Q4: 普段の活動量はどの程度ですか？',                           en: 'Q4: How active are you on a typical day?' },
  { ja: 'Q5: 趣味や好きな過ごし方は何ですか？',                         en: 'Q5: What are your hobbies or favorite pastimes?' },
  { ja: 'Q6: 旅行に行く頻度はどのくらいですか？',                       en: 'Q6: How often do you travel?' },
  { ja: 'Q7: 1年間で新しいスキルを学んだことはありますか？',             en: 'Q7: Have you learned any new skills this year?' },
  { ja: 'Q8: 週に何回運動をしますか？',                                 en: 'Q8: How many times a week do you exercise?' },
  { ja: 'Q9: 好きな音楽ジャンルは何ですか？',                           en: 'Q9: What is your favorite music genre?' },
  { ja: 'Q10: よく利用する SNS はどれですか？',                         en: 'Q10: Which social media platform do you use most often?' },
  { ja: 'Q11: 最近観た映画やドラマは何ですか？',                         en: 'Q11: What movie or TV show did you watch recently?' },
  { ja: 'Q12: 持っている資格や特技があれば教えてください。',             en: 'Q12: Please tell us any certifications or special skills you have.' },
  { ja: 'Q13: 理想の休日の過ごし方は？',                               en: 'Q13: How do you ideally spend a day off?' },
  { ja: 'Q14: 今後挑戦したいことや目標は何ですか？',                     en: 'Q14: What do you want to challenge or achieve next?' },
  { ja: 'Q15: ご意見・ご要望があればお聞かせください。',                 en: 'Q15: Any comments or requests?' },
]
