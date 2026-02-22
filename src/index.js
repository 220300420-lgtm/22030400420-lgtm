/**
 * Cloudflare Worker — CenBot proxy para Groq API
 * Adaptia Consultoría
 *
 * Variables de entorno requeridas (configura en Cloudflare Dashboard > Worker > Settings > Variables):
 *   GROQ_API_KEY  →  tu clave de API de Groq (console.groq.com)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    if (!env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: 'GROQ_API_KEY no configurada en el Worker' } }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    let messages;
    try {
      const body = await request.json();
      messages = body.messages;
      if (!Array.isArray(messages) || messages.length === 0) throw new Error('messages inválido');
    } catch {
      return new Response(
        JSON.stringify({ error: { message: 'Cuerpo de la solicitud inválido' } }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await groqResponse.json();

    return new Response(JSON.stringify(data), {
      status: groqResponse.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  },
};
