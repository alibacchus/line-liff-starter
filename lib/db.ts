import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUserLanguage(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('language')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.error('getUserLanguage error:', error);
    return null;
  }
  return data?.language ?? null;
}

export async function updateLanguage(userId: string, lang: string) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, language: lang },
      { onConflict: 'user_id' }
    );
  if (error) console.error('updateLanguage error:', error);
}

export async function saveAnswer(userId: string, key: string, answer: number) {
  const { error } = await supabase
    .from('responses')
    .insert({ user_id: userId, question: key, answer });
  if (error) console.error('saveAnswer error:', error);
}
