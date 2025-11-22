"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

export default function HomePage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("http://localhost:8000/health");
        if (!res.ok) {
          throw new Error(`Error en la API: ${res.status}`);
        }
        const json: HealthResponse = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message ?? "Error desconocido");
      }
    }

    fetchHealth();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="p-8 rounded-xl bg-slate-900 shadow-lg border border-slate-800 max-w-md w-full space-y-4">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Railway Monitor
          </h1>
          <p className="text-sm text-slate-400">
            Comprobación de conexión entre Frontend y Backend.
          </p>
        </header>

        <section className="text-sm">
          {!data && !error && (
            <p className="text-slate-400">Consultando backend...</p>
          )}
          {error && <p className="text-red-400">Error: {error}</p>}
          {data && (
            <div className="space-y-1">
              <p>
                <span className="font-mono text-emerald-400">status</span>:{" "}
                {data.status}
              </p>
              <p>
                <span className="font-mono text-emerald-400">service</span>:{" "}
                {data.service}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


