/** Marca um objeto como possuidor de número de versão (ex.: controle de concorrência otimista). */
export interface Versionable {
  readonly version: number;
}
