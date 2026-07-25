import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AbstractSpecification } from "./abstract-specification.js";
import { AndSpecification } from "./and-specification.js";
import { OrSpecification } from "./or-specification.js";
import { NotSpecification } from "./not-specification.js";
import type { Specification } from "./specification.js";

interface Candidate {
  age: number;
  active: boolean;
}

class IsAdultSpecification extends AbstractSpecification<Candidate> {
  isSatisfiedBy(candidate: Candidate): boolean {
    return candidate.age >= 18;
  }
}

class IsActiveSpecification extends AbstractSpecification<Candidate> {
  isSatisfiedBy(candidate: Candidate): boolean {
    return candidate.active;
  }
}

describe("Specification Pattern — smoke test de importação circular", () => {
  it("AbstractSpecification, AndSpecification, OrSpecification e NotSpecification carregam sem erro de TDZ", () => {
    assert.equal(typeof AbstractSpecification, "function");
    assert.equal(typeof AndSpecification, "function");
    assert.equal(typeof OrSpecification, "function");
    assert.equal(typeof NotSpecification, "function");
  });
});

describe("Specification simples", () => {
  it("isSatisfiedBy retorna true para candidato que satisfaz a regra", () => {
    const spec = new IsAdultSpecification();
    assert.equal(spec.isSatisfiedBy({ age: 20, active: true }), true);
  });

  it("isSatisfiedBy retorna false para candidato que não satisfaz a regra", () => {
    const spec = new IsAdultSpecification();
    assert.equal(spec.isSatisfiedBy({ age: 10, active: true }), false);
  });
});

describe("AndSpecification", () => {
  it("satisfeita quando ambos os lados são satisfeitos", () => {
    const spec = new IsAdultSpecification().and(new IsActiveSpecification());
    assert.equal(spec.isSatisfiedBy({ age: 20, active: true }), true);
  });

  it("não satisfeita quando um dos lados falha", () => {
    const spec = new IsAdultSpecification().and(new IsActiveSpecification());
    assert.equal(spec.isSatisfiedBy({ age: 20, active: false }), false);
    assert.equal(spec.isSatisfiedBy({ age: 10, active: true }), false);
  });

  it("pode ser construída diretamente via AndSpecification", () => {
    const spec: Specification<Candidate> = new AndSpecification(
      new IsAdultSpecification(),
      new IsActiveSpecification(),
    );
    assert.equal(spec.isSatisfiedBy({ age: 20, active: true }), true);
  });
});

describe("OrSpecification", () => {
  it("satisfeita quando ao menos um dos lados é satisfeito", () => {
    const spec = new IsAdultSpecification().or(new IsActiveSpecification());
    assert.equal(spec.isSatisfiedBy({ age: 10, active: true }), true);
    assert.equal(spec.isSatisfiedBy({ age: 20, active: false }), true);
  });

  it("não satisfeita quando nenhum dos lados é satisfeito", () => {
    const spec = new IsAdultSpecification().or(new IsActiveSpecification());
    assert.equal(spec.isSatisfiedBy({ age: 10, active: false }), false);
  });

  it("pode ser construída diretamente via OrSpecification", () => {
    const spec: Specification<Candidate> = new OrSpecification(
      new IsAdultSpecification(),
      new IsActiveSpecification(),
    );
    assert.equal(spec.isSatisfiedBy({ age: 10, active: true }), true);
  });
});

describe("NotSpecification", () => {
  it("inverte o resultado da Specification composta", () => {
    const spec = new IsAdultSpecification().not();
    assert.equal(spec.isSatisfiedBy({ age: 10, active: true }), true);
    assert.equal(spec.isSatisfiedBy({ age: 20, active: true }), false);
  });

  it("pode ser construída diretamente via NotSpecification", () => {
    const spec: Specification<Candidate> = new NotSpecification(new IsAdultSpecification());
    assert.equal(spec.isSatisfiedBy({ age: 10, active: true }), true);
  });
});

describe("Composição de Specifications", () => {
  it("composição fluente encadeada: (A and B) or (not A)", () => {
    const isAdult = new IsAdultSpecification();
    const isActive = new IsActiveSpecification();
    const spec = isAdult.and(isActive).or(isAdult.not());

    assert.equal(spec.isSatisfiedBy({ age: 20, active: true }), true);
    assert.equal(spec.isSatisfiedBy({ age: 10, active: false }), true);
    assert.equal(spec.isSatisfiedBy({ age: 20, active: false }), false);
  });

  it("dupla negação equivale à Specification original", () => {
    const isAdult = new IsAdultSpecification();
    const doubleNegated = isAdult.not().not();
    assert.equal(doubleNegated.isSatisfiedBy({ age: 20, active: true }), true);
    assert.equal(doubleNegated.isSatisfiedBy({ age: 10, active: true }), false);
  });

  it("composições retornam uma nova Specification, sem mutar as originais", () => {
    const isAdult = new IsAdultSpecification();
    const isActive = new IsActiveSpecification();
    const combined = isAdult.and(isActive);

    assert.notEqual(combined, isAdult);
    assert.equal(isAdult.isSatisfiedBy({ age: 20, active: false }), true);
  });
});
