import { AiError } from '../types'
import { MAX_OUTPUT_TOKENS } from '../defaults'
import {
  mergeConsecutive,
  providerHttpError,
  toNetworkError,
  type ProviderArgs,
} from './shared'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface OpenAiResponse {
  choices?: { message?: { content?: string } }[]
}

/**
 * Call OpenAI (or OpenRouter) Chat Completions endpoint with the caller's own key.
 * If the key begins with `sk-or-` or `OPENAI_BASE_URL` is configured, it automatically
 * targets OpenRouter while retaining full OpenAI API compatibility.
 * Returns the raw assistant text (handoff parsing happens in `generateReply`).
 */
export async function generateOpenAi(args: ProviderArgs): Promise<string> {
  const { apiKey, model, systemPrompt, messages, timeoutMs } = args
  const isRadox = apiKey.startsWith('cc_rad')
  const isOpenRouter = !isRadox && (apiKey.startsWith('sk-or-') || model.includes('/'))
  const endpoint = process.env.OPENAI_BASE_URL
    ? `${process.env.OPENAI_BASE_URL.replace(/\/+$/, '')}/chat/completions`
    : isRadox
      ? 'https://radoxai.com/v1/chat/completions'
      : isOpenRouter
        ? OPENROUTER_URL
        : OPENAI_URL

  let targetModel = model
  if (isOpenRouter) {
    if (model.includes('gemini') && !model.includes('/')) {
      targetModel = 'google/gemini-2.0-flash-exp:free'
    } else if (model.startsWith('claude-')) {
      targetModel = `anthropic/${model}`
    } else if (model.startsWith('gpt-')) {
      targetModel = `openai/${model}`
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  if (isOpenRouter) {
    headers['HTTP-Referer'] = 'https://wacrm.vercel.app'
    headers['X-Title'] = 'WACRM WhatsApp CRM'
  }

  let res: Response
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...mergeConsecutive(messages),
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (err) {
    throw toNetworkError(err)
  }

  if (!res.ok) {
    const providerName = isRadox ? 'Radox AI' : isOpenRouter ? 'OpenRouter' : 'OpenAI'
    throw await providerHttpError(providerName, res)
  }

  const data = (await res.json().catch(() => null)) as OpenAiResponse | null
  const text = data?.choices?.[0]?.message?.content
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new AiError('OpenAI returned an empty response.', {
      code: 'empty_response',
    })
  }
  return text
}
