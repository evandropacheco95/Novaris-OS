import { SetMetadata } from "@nestjs/common";

export const REQUIRED_FEATURE_KEY = "requiredFeature";

/**
 * Marca um método (não uma classe inteira — diferente de `@RequireDomain`,
 * `ADR-0056`) como dependente de uma `FeatureFlag` ligada para a Organization
 * do usuário autenticado. Verificado por `FeatureGuard` contra
 * `FeatureFlag.findByOrganizationAndKey`. Sem catálogo fechado de chaves
 * (mesma disciplina de `ADR-0038`) — convenção adotada: `<domínio-técnico>.<capability>`
 * (ex.: `"ai-runtime.text-to-sql"`).
 */
export const RequireFeature = (key: string) => SetMetadata(REQUIRED_FEATURE_KEY, key);
