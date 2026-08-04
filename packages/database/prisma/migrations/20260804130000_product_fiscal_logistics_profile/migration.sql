-- ENG-0166: perfil fiscal-logistico do Product, todos os campos opcionais
-- (nao afeta nenhum Product/tenant existente). Extraido do schema real do
-- projeto Winnet (cliente industria+ecommerce da Elite Negocios), decisao
-- direta do CTO. Sem FK para parent_product_id -- mesma convencao ja usada
-- em toda tabela de Business Domain (referencia por id, sem FK, exceto
-- users/roles).

-- AlterTable
ALTER TABLE "products" ADD COLUMN "ncm" VARCHAR(8);
ALTER TABLE "products" ADD COLUMN "cfop" VARCHAR(4);
ALTER TABLE "products" ADD COLUMN "unit" VARCHAR(20);
ALTER TABLE "products" ADD COLUMN "weight_kg" DECIMAL(10,3);
ALTER TABLE "products" ADD COLUMN "length_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN "width_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN "height_cm" DECIMAL(10,2);
ALTER TABLE "products" ADD COLUMN "parent_product_id" UUID;
ALTER TABLE "products" ADD COLUMN "variant_label" VARCHAR(100);
ALTER TABLE "products" ADD COLUMN "external_id" VARCHAR(100);

-- CreateIndex
CREATE INDEX "products_parent_product_id_idx" ON "products"("parent_product_id");
