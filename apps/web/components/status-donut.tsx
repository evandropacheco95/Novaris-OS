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
 * (`ENG-0148`), construído sobre Recharts. Migrado para Tailwind em
 * `ENG-0157` (o SVG do Recharts continua recebendo cor via prop `fill`, não
 * classes). Só resume contagens já calculadas pelo chamador a partir de
 * dados reais já buscados via API — nunca busca ou infere dado próprio.
 */
export function StatusDonut({ title, data }: { title: string; data: StatusDonutSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Card padding={20}>
      <h3 className="mb-4 mt-0 text-[13px] font-bold text-nov-s100">{title}</h3>

      {total === 0 ? (
        <p className="m-0 text-[12.5px] text-nov-s500">Sem dados suficientes ainda.</p>
      ) : (
        <div className="flex items-center gap-5">
          <div className="relative h-[108px] w-[108px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius={34} outerRadius={52} paddingAngle={2} stroke="none" isAnimationActive={false}>
                  {data.map((slice) => (
                    <Cell key={slice.label} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-nov-display text-xl font-bold leading-none text-nov-s50">{total}</span>
              <span className="mt-0.5 text-[9px] text-nov-s500">total</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            {data.map((slice) => (
              <div key={slice.label} className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: slice.color }} />
                  <span className="text-[12.5px] text-nov-s300">{slice.label}</span>
                </div>
                <span className="text-[12.5px] font-semibold text-nov-s100">
                  {slice.value} <span className="font-normal text-nov-s500">({total > 0 ? Math.round((slice.value / total) * 100) : 0}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
