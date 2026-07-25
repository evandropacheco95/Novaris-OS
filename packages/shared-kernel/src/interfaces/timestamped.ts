/** Marca um objeto como possuidor de marcas temporais de criação/atualização. */
export interface Timestamped {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
