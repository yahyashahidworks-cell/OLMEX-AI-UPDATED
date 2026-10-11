import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: 'Gemini is not configured. Add GEMINI_API_KEY in Vercel Environment Variables.' }, { status: 503 });
    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }); }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    if (!messages.length || messages.some((m: any) => !m || !['user','assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim())) return NextResponse.json({ error: 'Send a valid conversation.' }, { status: 400 });
    if (messages.reduce((n: number, m: any) => n + m.content.length, 0) > 30000) return NextResponse.json({ error: 'This conversation is too long. Start a new chat.' }, { status: 413 });
    const modelName = (typeof body.model === 'string' && ['gemini-2.5-flash','gemini-2.5-pro'].includes(body.model)) ? body.model : (process.env.GEMINI_MODEL || 'gemini-2.5-flash');
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: 'You are Olmex AI, a helpful, accurate and friendly AI assistant. Be clear and honest; never claim to have performed actions you did not perform.' });
    const history = messages.slice(0, -1).map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    // Gemini requires history to begin with a user message and alternate user/model roles.
    while (history.length && history[0].role !== 'user') history.shift();
    const cleaned: typeof history = [];
    for (const item of history) { if (cleaned.length && cleaned[cleaned.length - 1].role === item.role) cleaned[cleaned.length - 1] = item; else cleaned.push(item); }
    const chat = model.startChat({ history: cleaned });
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    return NextResponse.json({ text: result.response.text(), model: modelName });
  } catch (e: any) {
    const msg = String(e?.message || 'Request failed');
    const status = /429|quota|rate.?limit|resource_exhausted/i.test(msg) ? 429 : /not found|invalid.*model/i.test(msg) ? 400 : 500;
    return NextResponse.json({ error: status === 429 ? 'Gemini rate limit or quota reached. Wait and try again, or check Google AI Studio usage limits.' : status === 400 ? 'The configured Gemini model is unavailable. Check GEMINI_MODEL in Vercel.' : 'Gemini could not complete this request. Check server logs and API configuration.' }, { status });
  }
}
