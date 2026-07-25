"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "./card";

interface StatusDonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * StatusDonut — breakdown de status compartilhado do design system NOVARIS
 * (`ENG-0148`), construído sobre Recharts (não Tailwind/shadcn — `apps/web`
 * usa CSS puro + tokens `--nov-*`, ver `ENG-0147`). Só resume contagens já
 * calculadas pelo chamador a partir de dados reais já buscados via API —
 * nunca busca ou infere dado próprio.
 */
export function StatusDonut({ title, data }: { title: string; data: StatusDonutSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Card padding={20}>
      <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: "var(--nov-s100)" }}>{title}</h3>

      {total === 0 ? (
        <p style={{ fontSize: 12.5, color: "var(--nov-s500)", margin: 0 }}>Sem dados suficientes ainda.</p>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 108, height: 108, flexShrink: 0, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={34} outerRadius={52} paddingAngle={2} stroke="none" isAnimationActive={false}>
                  {data.map((slice) => (
                    <Cell key={slice.label} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--ff-display)", color: "var(--nov-s50)", lineHeight: 1 }}>{total}</span>
              <span style={{ fontSize: 9, color: "var(--nov-s500)", marginTop: 2 }}>total</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {data.map((slice) => (
              <div key={slice.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: slice.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "var(--nov-s300)" }}>{slice.label}</span>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--nov-s100)" }}>
                  {slice.value} <span style={{ color: "var(--nov-s500)", fontWeight: 400 }}>({total > 0 ? Math.round((slice.value / total) * 100) : 0}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
