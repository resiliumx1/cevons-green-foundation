# AI chat assistant — credit cost review

## What we found (measured, this billing period Aug 24 – Sep 14)

- Both assistants (public "Cev" chat + admin helper) run through the Lovable AI Gateway, so each message uses workspace AI credits.
- Actual usage: **117 messages, 0.36 credits total** (~0.003 credits/message).
- Free AI allowance: **4 credits/month** on every plan — current usage is under 10% of it. Effective cost today: **$0**.

## Recommendation

Do nothing now — the assistant is effectively free at current volume. Revisit only if chat traffic grows substantially.

## Options if volume grows (pick later, no work now)

1. **Switch model to a cheaper Lovable one** (Gemini Flash Lite class): same setup, ~cheaper per message, no new accounts. Small edit to the assistant's model setting.
2. **DeepSeek with your own API key**: chat stops using Lovable credits entirely; you pay DeepSeek directly (very low rates). Requires you to create a DeepSeek account and provide an API key, stored securely server-side. Involves rewiring the assistant's backend call and re-testing guardrails (no price quoting, correct branch info, link routing).

## If you want either change now

Say which option and it will be implemented with the existing rate limits, message caps, and guardrail prompt kept intact, then tested end-to-end (a real chat exchange verified before done).

## Technical details

- Code: `supabase/functions/ai-assistant/index.ts` — model + gateway URL are the only lines that change for either option; rate limits (15/session, 30/IP per hour), 1,500-char input cap and 700-token reply cap stay.
- DeepSeek option adds a server-side secret (their API key) and swaps the gateway endpoint; behaviour and UI unchanged.
- No impact on GA4 tracking, email notifications, or any other feature.
