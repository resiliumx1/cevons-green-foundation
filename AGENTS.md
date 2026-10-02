# Project architecture rules

- Load published site-image replacements in the root route before SSR so originals never flash before saved photos; keep draft URLs gated by verified preview tokens.- Database-triggered calls (CES drain, push fan-out) authenticate with a DB-generated key in private.app_keys, verified server-side via check_ces_drain_token; the vault and service-role key are not used for this. Why: the vault was empty and silently blocked delivery.
