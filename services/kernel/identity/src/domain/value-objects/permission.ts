import { ValueObject, Result, ValidationError } from "@novaris/shared-kernel";

interface PermissionProps extends Record<string, unknown> {
  code: string;
}

const PERMISSION_CODE_PATTERN = /^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/;

/**
 * Value Object para uma permissão granular, formato `<domínio>.<recurso>.<ação>`
 * (ex.: `crm.leads.read`, `financial.invoice.delete` — BOM.md). Reclassificado
 * de candidato a Aggregate Root para Value Object em
 * IDENTITY_TECHNICAL_BLUEPRINT.md § 3 (Missão ENG-0002.2).
 */
export class Permission extends ValueObject<PermissionProps> {
  private constructor(props: PermissionProps) {
    super(props);
  }

  static create(code: string): Result<Permission, ValidationError> {
    if (!PERMISSION_CODE_PATTERN.test(code)) {
      return Result.fail(
        new ValidationError(
          `código de permissão inválido: "${code}" — formato esperado <domínio>.<recurso>.<ação>`,
        ),
      );
    }
    return Result.ok(new Permission({ code }));
  }

  get code(): string {
    return this.props.code;
  }
}
