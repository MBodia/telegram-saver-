import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}

async function main() {
  const { data: items, error } = await supabase
    .from('saved_items')
    .select('id, title, summary, description, full_text')
    .is('embedding', null)

  if (error) {
    console.error('Помилка отримання елементів:', error.message)
    process.exit(1)
  }

  const total = items?.length ?? 0
  console.log(`Знайдено ${total} елементів без embedding`)

  if (total === 0) {
    console.log('Нічого оброблювати — всі елементи вже мають embedding')
    return
  }

  for (let i = 0; i < items!.length; i++) {
    const item = items![i]

    const text = [
      item.title,
      item.summary,
      item.description,
      item.full_text?.slice(0, 2000),
    ]
      .filter(Boolean)
      .join(' ')

    if (!text.trim()) {
      console.log(`Пропущено ${i + 1}/${total} — немає тексту (id: ${item.id})`)
      continue
    }

    try {
      const embedding = await generateEmbedding(text)

      const { error: updateError } = await supabase
        .from('saved_items')
        .update({ embedding })
        .eq('id', item.id)

      if (updateError) {
        console.error(`Помилка збереження для ${item.id}:`, updateError.message)
      } else {
        console.log(`Оброблено ${i + 1}/${total} (id: ${item.id})`)
      }
    } catch (err) {
      console.error(`Помилка генерації для ${item.id}:`, err)
    }

    // Затримка щоб не перевищити rate limit OpenAI
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\nГотово! Оброблено ${total} елементів.`)
}

main()
