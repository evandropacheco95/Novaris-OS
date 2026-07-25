import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Product } from "../aggregates/product/product.js";

/** Contrato de persistência do Aggregate `Product` (`ADR-0043`). */
export interface ProductRepository extends ReadRepository<Product>, WriteRepository<Product> {}
