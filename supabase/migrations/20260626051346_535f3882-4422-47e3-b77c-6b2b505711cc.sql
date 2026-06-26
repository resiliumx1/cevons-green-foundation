UPDATE public.media_items
SET title   = REPLACE(title,   'CEVON''S', 'CEVONS'),
    summary = REPLACE(summary, 'CEVON''S', 'CEVONS'),
    body    = REPLACE(body,    'CEVON''S', 'CEVONS'),
    outlet  = REPLACE(outlet,  'CEVON''S', 'CEVONS')
WHERE title   LIKE '%CEVON''S%'
   OR summary LIKE '%CEVON''S%'
   OR body    LIKE '%CEVON''S%'
   OR outlet  LIKE '%CEVON''S%';