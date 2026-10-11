# Olmex AI — Vercel app (no Supabase)

Olmex AI is a Next.js workspace with Gemini chat, browser-saved conversations, Projects, Memory, theme controls, export/delete data, and an optional stateless developer API. It does not use Supabase or any database.

## Deploy on Vercel
1. Extract the ZIP and upload the contents of `olmex-vercel` to a GitHub repository.
2. Import the repository in Vercel and deploy using the default Next.js settings.
3. In Vercel → Project → Settings → Environment Variables, add `GEMINI_API_KEY` with your secret from https://aistudio.google.com/apikey. Never use a `NEXT_PUBLIC_` prefix for this key.
4. Optional: add `GEMINI_MODEL=gemini-2.5-flash` and `OLMEX_API_SECRET` (a long, random secret). `OLMEX_API_SECRET` signs developer API keys; if omitted, the Gemini key is used for signing.
5. Redeploy after adding environment variables.

## What works and limitations
- Gemini chat through a server-side API route; supports Gemini 2.5 Flash and Pro if available to your Google project.
- Chat search, create/delete chats, local conversation persistence, theme, project creation, memory add/delete, JSON export, and clear local data.
- The profile/signup UI is a **browser-only local profile**, not secure authentication. Passwords/accounts are not protected against someone with access to the browser profile and do not sync across devices. Do not use it for sensitive data.
- Chats, projects, memories and API-key list are saved in that browser only; clearing browser storage loses them.
- Developer API key creation is server-signed and `/api/v1/chat` accepts a valid key in `Authorization: Bearer <key>`. Without a database, keys cannot be centrally revoked; deleting/revoking in the UI only hides/revokes locally, and keys expire after one year. Rotate `OLMEX_API_SECRET` to invalidate all keys.
- Claude, web search, file uploads, billing, team accounts and multi-agent execution are not connected.
- This code was revised to remove Supabase, but dependency installation timed out in this environment, so a complete production build could not be verified here. Test the Vercel build and check logs before sharing publicly. Add rate limiting and abuse controls before public launch.

## API example
```bash
curl https://YOUR-VERCEL-DOMAIN/api/v1/chat \
  -H "Authorization: Bearer YOUR_OLMEX_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello Olmex"}]}'
```
