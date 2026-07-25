/**
 * Wordmark NOVARIS + moldura de cantos ("bracket corners") — motivo visual
 * recorrente no brandkit real (`NOVARIS_Brand_Identity_v1.0.html`, topo de
 * cada peça de conteúdo). Reutilizado aqui como cabeçalho de toda tela
 * autenticada.
 */
export function BrandMark({ label }: { label?: string }) {
  return (
    <div style={{ position: "relative", padding: "16px 0", borderBottom: `1px solid ${"var(--nov-border)"}` }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderLeft: "2px solid var(--nov-b600)",
          borderTop: "2px solid var(--nov-b600)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 10,
          height: 10,
          borderRight: "2px solid var(--nov-b600)",
          borderTop: "2px solid var(--nov-b600)",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px" }}>
        <span
          style={{
            fontFamily: "var(--ff-display)",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.15em",
            color: "var(--nov-s100)",
          }}
        >
          NOVARIS
        </span>
        {label && (
          <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--nov-s500)", textTransform: "uppercase" }}>{label}</span>
        )}
      </div>
    </div>
  );
}
