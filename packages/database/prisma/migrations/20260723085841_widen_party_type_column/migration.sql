-- Bug real corrigido (ENG-0125): "external_organization" tem 21 caracteres,
-- excedendo VARCHAR(20) definido em 20260723085026_customer_domain. O erro
-- de banco ("value too long for type character varying(20)") foi engolido
-- silenciosamente por um bug separado em CreatePartyHandler (não verificava
-- o Result de save()) — corrigido junto no código da Application Layer.
ALTER TABLE "parties" ALTER COLUMN "party_type" TYPE VARCHAR(30);
