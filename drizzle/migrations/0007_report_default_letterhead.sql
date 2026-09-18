UPDATE public.report_templates
SET logo_path = 'templates/cevons-letterhead-logo.png',
    header_text = 'CEVON''S Environmental Services Inc.',
    subheader_text = 'Georgetown, Guyana - waste management and environmental services',
    footer_text = E'CEVON''S Environmental Services Inc. - Lot 1 Mandela Avenue, Georgetown, Guyana\n+592 218 1455 - info@cevons.com - cevons.com',
    accent_color = '#EA6A00',
    heading_color = '#0B2545'
WHERE is_default = true;