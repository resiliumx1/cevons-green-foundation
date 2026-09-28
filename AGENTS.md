# Project architecture rules

- Load published site-image replacements in the root route before SSR so originals never flash before saved photos; keep draft URLs gated by verified preview tokens.