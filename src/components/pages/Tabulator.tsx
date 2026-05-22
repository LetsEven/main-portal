"use client";

import { useState, useEffect } from "react";

const fmt = (n: number) =>
  "$" +
  Number(n).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtN = (n: number) => Number(n).toLocaleString("es-MX");

interface CalcTxParams {
  consumo: number;
  restPct: number;
  cliPct: number;
  provPct: number;
  provFixed: number;
  propinaPct: number;
  iva?: number;
}

function calcTx({
  consumo,
  restPct,
  cliPct,
  provPct,
  provFixed,
  propinaPct,
  iva = 16,
}: CalcTxParams) {
  const IVA_R = iva / 100;
  const propina = (consumo * propinaPct) / 100;
  const total = consumo + propina;
  const comXqBruta = (total * (restPct + cliPct)) / 100;
  const ivaXq = comXqBruta * IVA_R;
  const comXqTotal = comXqBruta + ivaXq;
  const restPart = total * (restPct / 100) * (1 + IVA_R);
  const cliPart = total * (cliPct / 100) * (1 + IVA_R);
  const cobrado = total + cliPart;
  const comProvBruta = cobrado * (provPct / 100);
  const ivaProv = (comProvBruta + provFixed) * IVA_R;
  const comProvTotal = comProvBruta + provFixed + ivaProv;
  const ingresoXq = comXqTotal - comProvTotal;
  const ingresoRest = total - restPart;
  return {
    propina,
    total,
    comXqBruta,
    ivaXq,
    comXqTotal,
    restPart,
    cliPart,
    cobrado,
    comProvBruta,
    provFixed,
    ivaProv,
    comProvTotal,
    ingresoXq,
    ingresoRest,
  };
}

interface StepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  decimals?: number;
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  suffix = "%",
  decimals = 1,
}: StepperProps) {
  const display = decimals === 0 ? String(value) : value.toFixed(decimals);
  const [raw, setRaw] = useState<string | null>(null);

  const nudge = (dir: number) => {
    const next = parseFloat((value + dir * step).toFixed(8));
    onChange(Math.min(max, Math.max(min, next)));
  };

  const commit = (str: string) => {
    const v = parseFloat(str);
    if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
    setRaw(null);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 5 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <button
          onClick={() => nudge(-1)}
          style={{
            width: 36,
            height: 36,
            border: "none",
            borderRight: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
            fontSize: 18,
            color: "#6b7280",
            lineHeight: 1,
          }}
        >
          −
        </button>
        <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="number"
            value={raw !== null ? raw : display}
            min={min}
            max={max}
            step={step}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#111",
              height: 36,
              background: "transparent",
              paddingRight: suffix ? 26 : 8,
            }}
          />
          {suffix && (
            <span
              style={{
                position: "absolute",
                right: 8,
                fontSize: 12,
                color: "#9ca3af",
                pointerEvents: "none",
              }}
            >
              {suffix}
            </span>
          )}
        </div>
        <button
          onClick={() => nudge(1)}
          style={{
            width: 36,
            height: 36,
            border: "none",
            borderLeft: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
            fontSize: 18,
            color: "#6b7280",
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface RowProps {
  label: string;
  pct?: string;
  value: string;
  bold?: boolean;
  green?: boolean;
  highlight?: "yellow" | "green";
  indent?: boolean;
}

function Row({ label, pct, value, bold, green, highlight, indent }: RowProps) {
  const bg =
    highlight === "yellow"
      ? "#fef9c3"
      : highlight === "green"
        ? "#f0fdfa"
        : "transparent";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 8px",
        borderRadius: 6,
        background: bg,
        marginBottom: 1,
        paddingLeft: indent ? 22 : 8,
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: bold ? 13 : 12,
          fontWeight: bold ? 700 : 400,
          color: bold ? (green ? "#0d9488" : "#1f2937") : "#6b7280",
        }}
      >
        {label}
      </span>
      {pct !== undefined && (
        <span
          style={{
            fontSize: 11,
            color: "#9ca3af",
            minWidth: 44,
            textAlign: "right",
            marginRight: 12,
          }}
        >
          {pct}
        </span>
      )}
      <span
        style={{
          fontSize: bold ? 13 : 12,
          fontWeight: bold ? 700 : 500,
          color: green ? "#0d9488" : "#1f2937",
          minWidth: 80,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  color: "green" | "blue" | "amber" | "gray";
}

function MetricCard({ label, value, color }: MetricCardProps) {
  const map: Record<string, [string, string]> = {
    green: ["#f0fdfa", "#0d9488"],
    blue: ["#eff6ff", "#1d4ed8"],
    amber: ["#fffbeb", "#d97706"],
    gray: ["#f9fafb", "#374151"],
  };
  const [bg, text] = map[color] || map.gray;
  return (
    <div
      style={{
        background: bg,
        borderRadius: 12,
        padding: "14px 12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: text }}>{value}</div>
    </div>
  );
}

const SUB: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  margin: "16px 0 8px",
  paddingLeft: 8,
};

function TabSingle() {
  const LS_KEY = "xquisito_single";
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {};
    } catch {
      return {};
    }
  })();
  const [consumo, setConsumo] = useState<number>(saved.consumo ?? 500);
  const [restPct, setRestPct] = useState<number>(saved.restPct ?? 2.0);
  const [cliPct, setCliPct] = useState<number>(saved.cliPct ?? 2.0);
  const [provPct, setProvPct] = useState<number>(saved.provPct ?? 2.6);
  const [provFixed, setProvFixed] = useState<number>(saved.provFixed ?? 0.5);
  const [propinaPct, setPropinaPct] = useState<number>(saved.propinaPct ?? 0.0);
  const [iva, setIva] = useState<number>(saved.iva ?? 16);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          consumo,
          restPct,
          cliPct,
          provPct,
          provFixed,
          propinaPct,
          iva,
        }),
      );
    } catch {}
  }, [consumo, restPct, cliPct, provPct, provFixed, propinaPct, iva]);

  const r = calcTx({
    consumo,
    restPct,
    cliPct,
    provPct,
    provFixed,
    propinaPct,
    iva,
  });
  const margen = r.cobrado > 0 ? (r.ingresoXq / r.cobrado) * 100 : 0;

  return (
    <div
      className="single-wrap"
      style={{
        display: "grid",
        gridTemplateColumns: "min(300px, 100%) 1fr",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "1.25rem",
        }}
      >
        <p style={SUB}>Consumo</p>
        <Stepper
          label="Consumo en restaurante (incl. IVA producto)"
          value={consumo}
          onChange={setConsumo}
          min={1}
          max={99999}
          step={1}
          suffix="$"
          decimals={2}
        />
        <Stepper
          label="Propina (%)"
          value={propinaPct}
          onChange={setPropinaPct}
          min={0}
          max={30}
          step={0.5}
          suffix="%"
          decimals={1}
        />
        <p style={SUB}>Comisión Xquisito</p>
        <Stepper
          label="% Pagado por restaurante"
          value={restPct}
          onChange={setRestPct}
          min={0}
          max={15}
          step={0.1}
          suffix="%"
          decimals={1}
        />
        <Stepper
          label="% Pagado por cliente"
          value={cliPct}
          onChange={setCliPct}
          min={0}
          max={15}
          step={0.1}
          suffix="%"
          decimals={1}
        />
        <p style={SUB}>Proveedor de pago</p>
        <Stepper
          label="Comisión proveedor (%)"
          value={provPct}
          onChange={setProvPct}
          min={0}
          max={10}
          step={0.1}
          suffix="%"
          decimals={1}
        />
        <Stepper
          label="Monto fijo x transacción ($)"
          value={provFixed}
          onChange={setProvFixed}
          min={0}
          max={10}
          step={0.1}
          suffix="$"
          decimals={2}
        />
        <Stepper
          label="IVA sobre comisiones (%)"
          value={iva}
          onChange={setIva}
          min={0}
          max={30}
          step={1}
          suffix="%"
          decimals={0}
        />
      </div>

      <div>
        <div
          className="metrics-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MetricCard
            label="Ingreso Xquisito"
            value={fmt(r.ingresoXq)}
            color="green"
          />
          <MetricCard
            label="Cobrado al cliente"
            value={fmt(r.cobrado)}
            color="blue"
          />
          <MetricCard
            label="Recibe restaurante"
            value={fmt(r.ingresoRest)}
            color="gray"
          />
          <MetricCard
            label="Margen Xquisito"
            value={margen.toFixed(2) + "%"}
            color="amber"
          />
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
              padding: "0 8px",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Concepto
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                minWidth: 44,
                textAlign: "right",
                marginRight: 12,
              }}
            >
              %
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                minWidth: 80,
                textAlign: "right",
              }}
            >
              Monto
            </span>
          </div>

          <Row
            label="Consumo en restaurante (incl. IVA x producto)"
            value={fmt(consumo)}
          />
          <Row
            label="Propina"
            pct={propinaPct.toFixed(1) + "%"}
            value={fmt(r.propina)}
          />
          <Row label="Total" value={fmt(r.total)} bold />

          <div style={{ height: 8 }} />
          <Row
            label="Comisión Xquisito"
            pct={(restPct + cliPct).toFixed(1) + "%"}
            value={fmt(r.comXqBruta)}
          />
          <Row
            label="IVA sobre comisión Xquisito"
            pct={iva + "%"}
            value={fmt(r.ivaXq)}
          />
          <Row
            label="Comisión Xquisito Total"
            value={fmt(r.comXqTotal)}
            bold
            highlight="yellow"
          />
          <Row
            label="> Pagado por restaurante"
            pct={restPct.toFixed(1) + "%"}
            value={fmt(r.restPart)}
            indent
          />
          <Row
            label="> Pagado por cliente"
            pct={cliPct.toFixed(1) + "%"}
            value={fmt(r.cliPart)}
            indent
          />

          <div style={{ height: 6 }} />
          <Row label="Total cobrado al cliente" value={fmt(r.cobrado)} bold />

          <div style={{ height: 8 }} />
          <Row
            label="Comisión proveedor"
            pct={provPct.toFixed(1) + "%"}
            value={fmt(r.comProvBruta)}
          />
          <Row
            label="Monto fijo x transacción"
            pct={"$" + provFixed.toFixed(2)}
            value={fmt(r.provFixed)}
          />
          <Row
            label="IVA sobre comisión proveedor"
            pct={iva + "%"}
            value={fmt(r.ivaProv)}
          />
          <Row
            label="Total comisión proveedor"
            value={fmt(r.comProvTotal)}
            bold
          />

          <div style={{ height: 8 }} />
          <Row
            label="Ingreso Total Xquisito"
            value={fmt(r.ingresoXq)}
            bold
            green
            highlight="green"
          />
          <Row
            label="Ingreso Total Restaurante"
            value={fmt(r.ingresoRest)}
            bold
          />
        </div>
      </div>
    </div>
  );
}

interface Scenario {
  name: string;
  consumo: number;
  restPct: number;
  cliPct: number;
  provPct: number;
  provFixed: number;
  propinaPct: number;
  txMesa: number;
  mesas: number;
  dias: number;
  adopcion: number;
  rests: number;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    name: "Base",
    consumo: 500,
    restPct: 2,
    cliPct: 2,
    provPct: 2.6,
    provFixed: 0.5,
    propinaPct: 0,
    txMesa: 4,
    mesas: 29,
    dias: 31,
    adopcion: 100,
    rests: 1,
  },
  {
    name: "Ticket alto",
    consumo: 1200,
    restPct: 2,
    cliPct: 2,
    provPct: 2.6,
    provFixed: 0.5,
    propinaPct: 10,
    txMesa: 4,
    mesas: 15,
    dias: 31,
    adopcion: 100,
    rests: 1,
  },
];

interface ScenarioCardProps {
  sc: Scenario;
  idx: number;
  onUpdate: (idx: number, sc: Scenario) => void;
  onDelete: (idx: number) => void;
  isBest: boolean;
  canDelete: boolean;
}

function ScenarioCard({
  sc,
  idx,
  onUpdate,
  onDelete,
  isBest,
  canDelete,
}: ScenarioCardProps) {
  const [volOpen, setVolOpen] = useState(false);
  const [comOpen, setComOpen] = useState(false);
  const up = (k: keyof Scenario, v: string | number) =>
    onUpdate(idx, { ...sc, [k]: v });

  const txMensual = Math.round(
    sc.txMesa * sc.mesas * sc.dias * (sc.adopcion / 100),
  );
  const txTotal = txMensual * sc.rests;
  const txDiaTotal = txTotal / sc.dias;
  const volMensual = txTotal * sc.consumo;

  const r = calcTx(sc);
  const monthly = r.ingresoXq * txTotal;
  const daily = r.ingresoXq * txDiaTotal;

  const field = (
    label: string,
    key: keyof Scenario,
    step: number,
    min: number,
    max: number,
    dec: number,
  ) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 7,
        fontSize: 12,
      }}
    >
      <span style={{ color: "#6b7280", minWidth: 118 }}>{label}</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          overflow: "hidden",
          flex: 1,
        }}
      >
        <button
          onClick={() =>
            up(
              key,
              Math.max(
                min,
                parseFloat(((sc[key] as number) - step).toFixed(8)),
              ),
            )
          }
          style={{
            width: 26,
            height: 28,
            border: "none",
            borderRight: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          −
        </button>
        <input
          type="number"
          value={
            dec > 0 ? (sc[key] as number).toFixed(dec) : (sc[key] as number)
          }
          min={min}
          max={max}
          step={step}
          onChange={(e) => up(key, parseFloat(e.target.value) || 0)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            textAlign: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "#111",
            height: 28,
            background: "transparent",
          }}
        />
        <button
          onClick={() =>
            up(
              key,
              Math.min(
                max,
                parseFloat(((sc[key] as number) + step).toFixed(8)),
              ),
            )
          }
          style={{
            width: 26,
            height: 28,
            border: "none",
            borderLeft: "1px solid #e5e7eb",
            background: "#f9fafb",
            cursor: "pointer",
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: "#fff",
        border: isBest ? "2px solid #0d9488" : "1px solid #e5e7eb",
        borderRadius: 16,
        padding: "1.25rem",
        position: "relative",
      }}
    >
      {isBest && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 14,
            background: "#0d9488",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "0 0 6px 6px",
            letterSpacing: "0.4px",
          }}
        >
          MEJOR
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
        }}
      >
        <input
          value={sc.name}
          onChange={(e) => up("name", e.target.value)}
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#111",
          }}
        />
        {canDelete && (
          <button
            onClick={() => onDelete(idx)}
            style={{
              background: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 5,
              padding: "2px 7px",
              fontSize: 11,
              cursor: "pointer",
              color: "#9ca3af",
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
          marginBottom: 14,
        }}
      >
        {(
          [
            ["Ticket prom.", fmt(sc.consumo)],
            ["# Sucursales", sc.rests],
            ["% Adopción", sc.adopcion + "%"],
          ] as [string, string | number][]
        ).map(([l, v]) => (
          <div
            key={l}
            style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: "8px 6px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                marginBottom: 4,
              }}
            >
              {l}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setVolOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "7px 10px",
          cursor: "pointer",
          marginTop: 10,
          marginBottom: volOpen ? 8 : 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Volumen
        </span>
        <span
          style={{
            fontSize: 14,
            color: "#9ca3af",
            display: "inline-block",
            transition: "transform 0.2s",
            transform: volOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>
      {volOpen && (
        <div style={{ marginBottom: 8 }}>
          {field("Ticket ($)", "consumo", 10, 1, 99999, 2)}
          {field("Propina (%)", "propinaPct", 0.5, 0, 30, 1)}
          {field("Tx x mesa", "txMesa", 1, 1, 100, 0)}
          {field("# Mesas", "mesas", 1, 1, 500, 0)}
          {field("# Días abiertos", "dias", 1, 1, 31, 0)}
          {field("% Adopción", "adopcion", 5, 0, 100, 0)}
          {field("# Sucursales", "rests", 1, 1, 500, 0)}
        </div>
      )}

      <button
        onClick={() => setComOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "7px 10px",
          cursor: "pointer",
          marginTop: 10,
          marginBottom: comOpen ? 8 : 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Comisiones
        </span>
        <span
          style={{
            fontSize: 14,
            color: "#9ca3af",
            transition: "transform 0.2s",
            display: "inline-block",
            transform: comOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>
      {comOpen && (
        <div style={{ marginBottom: 8 }}>
          {field("% Restaurante", "restPct", 0.1, 0, 15, 1)}
          {field("% Cliente", "cliPct", 0.1, 0, 15, 1)}
          {field("% Proveedor", "provPct", 0.1, 0, 10, 1)}
          {field("Fijo prov. ($)", "provFixed", 0.1, 0, 10, 2)}
        </div>
      )}

      <div
        style={{ borderTop: "1px solid #f0f0f0", marginTop: 4, paddingTop: 10 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 4,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            Concepto
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              textAlign: "right",
            }}
          >
            / Día
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              textAlign: "right",
            }}
          >
            / Mes
          </span>
        </div>
        {(
          [
            [
              "# Transacciones",
              parseFloat(txDiaTotal.toFixed(1)).toLocaleString("es-MX"),
              fmtN(txTotal),
              false,
            ],
            [
              "Volumen bruto",
              fmt(txDiaTotal * sc.consumo),
              fmt(volMensual * sc.rests),
              false,
            ],
            [
              "Total cobrado",
              fmt(r.cobrado * txDiaTotal),
              fmt(r.cobrado * txTotal),
              false,
            ],
            [
              "Com. proveedor",
              fmt(r.comProvTotal * txDiaTotal),
              fmt(r.comProvTotal * txTotal),
              false,
            ],
            ["Ingreso Xquisito", fmt(daily), fmt(monthly), true],
          ] as [string, string, string, boolean][]
        ).map(([l, vd, vm, hi], i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 4,
              padding: "5px 0",
              borderBottom: "1px solid #f9f9f9",
            }}
          >
            <span style={{ fontSize: 12, color: "#6b7280" }}>{l}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: hi ? 700 : 500,
                color: hi ? "#0d9488" : "#111",
                textAlign: "right",
              }}
            >
              {vd}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: hi ? 700 : 500,
                color: hi ? "#0d9488" : "#111",
                textAlign: "right",
              }}
            >
              {vm}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabScenarios() {
  const LS_KEY = "xquisito_scenarios";
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      return saved && Array.isArray(saved) && saved.length > 0
        ? saved
        : DEFAULT_SCENARIOS;
    } catch {
      return DEFAULT_SCENARIOS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(scenarios));
    } catch {}
  }, [scenarios]);

  const getMonthly = (sc: Scenario) => {
    const txM = Math.round(
      sc.txMesa * sc.mesas * sc.dias * (sc.adopcion / 100),
    );
    return calcTx(sc).ingresoXq * txM * sc.rests;
  };
  const bestIdx = scenarios.reduce(
    (best, sc, i) => (getMonthly(sc) > getMonthly(scenarios[best]) ? i : best),
    0,
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
        gap: 14,
      }}
    >
      {scenarios.map((sc, i) => (
        <ScenarioCard
          key={i}
          sc={sc}
          idx={i}
          onUpdate={(idx, sc) =>
            setScenarios((p) => p.map((s, j) => (j === idx ? sc : s)))
          }
          onDelete={(idx) => setScenarios((p) => p.filter((_, j) => j !== idx))}
          isBest={i === bestIdx}
          canDelete={scenarios.length > 1}
        />
      ))}
      {scenarios.length < 4 && (
        <button
          onClick={() =>
            setScenarios((p) => [
              ...p,
              {
                name: "Nuevo",
                consumo: 500,
                restPct: 2,
                cliPct: 2,
                provPct: 2.6,
                provFixed: 0.5,
                propinaPct: 0,
                txMesa: 4,
                mesas: 10,
                dias: 31,
                adopcion: 100,
                rests: 1,
              },
            ])
          }
          style={{
            background: "none",
            border: "2px dashed #e5e7eb",
            borderRadius: 16,
            padding: "2rem 1rem",
            fontSize: 13,
            cursor: "pointer",
            color: "#9ca3af",
            minHeight: 140,
          }}
        >
          + Agregar escenario
        </button>
      )}
    </div>
  );
}

interface MiniBarProps {
  label: string;
  value: number;
  max: number;
}

function MiniBar({ label, value, max }: MiniBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 3,
        }}
      >
        <span style={{ color: "#6b7280" }}>{label}</span>
        <span style={{ fontWeight: 700, color: "#0d9488" }}>{fmt(value)}</span>
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 4, height: 6 }}>
        <div
          style={{
            background: "#0d9488",
            width: pct + "%",
            height: "100%",
            borderRadius: 4,
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}

function TabProjection() {
  const LS_KEY = "xquisito_projection";
  const savedP = (() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {};
    } catch {
      return {};
    }
  })();
  const [ticket, setTicket] = useState<number>(savedP.ticket ?? 500);
  const [txMesa, setTxMesa] = useState<number>(savedP.txMesa ?? 4);
  const [mesas, setMesas] = useState<number>(savedP.mesas ?? 29);
  const [dias, setDias] = useState<number>(savedP.dias ?? 31);
  const [adopcion, setAdopcion] = useState<number>(savedP.adopcion ?? 100);
  const [rests, setRests] = useState<number>(savedP.rests ?? 1);
  const [propinaPct, setPropinaPct] = useState<number>(
    savedP.propinaPct ?? 0.0,
  );
  const [restPct, setRestPct] = useState<number>(savedP.restPct ?? 2.0);
  const [cliPct, setCliPct] = useState<number>(savedP.cliPct ?? 2.0);
  const [provPct, setProvPct] = useState<number>(savedP.provPct ?? 2.6);
  const [provFixed, setProvFixed] = useState<number>(savedP.provFixed ?? 0.5);
  const [iva, setIva] = useState<number>(savedP.iva ?? 16);
  const [volOpen, setVolOpen] = useState(true);
  const [comOpen, setComOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          ticket,
          txMesa,
          mesas,
          dias,
          adopcion,
          rests,
          propinaPct,
          restPct,
          cliPct,
          provPct,
          provFixed,
          iva,
        }),
      );
    } catch {}
  }, [
    ticket,
    txMesa,
    mesas,
    dias,
    adopcion,
    rests,
    propinaPct,
    restPct,
    cliPct,
    provPct,
    provFixed,
    iva,
  ]);

  const r = calcTx({
    consumo: ticket,
    restPct,
    cliPct,
    provPct,
    provFixed,
    propinaPct,
    iva,
  });

  const txMensual = Math.round(txMesa * mesas * dias * (adopcion / 100));
  const txTotal = txMensual * rests;
  const txDiaTotal = txTotal / dias;
  const volMensual = txTotal * ticket;
  const volDia = txDiaTotal * ticket;
  const monthly = r.ingresoXq * txTotal;
  const daily = r.ingresoXq * txDiaTotal;

  const CollapseBtn = ({
    label,
    open,
    onToggle,
  }: {
    label: string;
    open: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "7px 10px",
        cursor: "pointer",
        marginBottom: open ? 8 : 0,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          color: "#9ca3af",
          display: "inline-block",
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        ▾
      </span>
    </button>
  );

  const milestones = [1, 5, 10, 25, 50, 100, 250, 500].map((n) => ({
    label: n === 1 ? "1 sucursal" : n + " sucursales",
    value: r.ingresoXq * txMensual * n,
  }));
  const maxM = milestones[milestones.length - 1].value;

  return (
    <div
      className="proj-wrap"
      style={{
        display: "grid",
        gridTemplateColumns: "min(300px,100%) 1fr",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "1.25rem",
        }}
      >
        <CollapseBtn
          label="Volumen"
          open={volOpen}
          onToggle={() => setVolOpen((o) => !o)}
        />
        {volOpen && (
          <div style={{ marginBottom: 12 }}>
            <Stepper
              label="Ticket promedio ($)"
              value={ticket}
              onChange={setTicket}
              min={1}
              max={99999}
              step={10}
              suffix="$"
              decimals={2}
            />
            <Stepper
              label="Propina (%)"
              value={propinaPct}
              onChange={setPropinaPct}
              min={0}
              max={30}
              step={0.5}
              suffix="%"
              decimals={1}
            />
            <Stepper
              label="Tx x mesa"
              value={txMesa}
              onChange={setTxMesa}
              min={1}
              max={100}
              step={1}
              suffix=""
              decimals={0}
            />
            <Stepper
              label="# Mesas"
              value={mesas}
              onChange={setMesas}
              min={1}
              max={500}
              step={1}
              suffix=""
              decimals={0}
            />
            <Stepper
              label="# Días abiertos"
              value={dias}
              onChange={setDias}
              min={1}
              max={31}
              step={1}
              suffix=""
              decimals={0}
            />
            <Stepper
              label="% Adopción"
              value={adopcion}
              onChange={setAdopcion}
              min={0}
              max={100}
              step={5}
              suffix="%"
              decimals={0}
            />
            <Stepper
              label="# Sucursales"
              value={rests}
              onChange={setRests}
              min={1}
              max={500}
              step={1}
              suffix=""
              decimals={0}
            />
          </div>
        )}

        <CollapseBtn
          label="Comisiones"
          open={comOpen}
          onToggle={() => setComOpen((o) => !o)}
        />
        {comOpen && (
          <div style={{ marginBottom: 12 }}>
            <Stepper
              label="% Xquisito — restaurante"
              value={restPct}
              onChange={setRestPct}
              min={0}
              max={15}
              step={0.1}
              suffix="%"
              decimals={1}
            />
            <Stepper
              label="% Xquisito — cliente"
              value={cliPct}
              onChange={setCliPct}
              min={0}
              max={15}
              step={0.1}
              suffix="%"
              decimals={1}
            />
            <Stepper
              label="Comisión proveedor (%)"
              value={provPct}
              onChange={setProvPct}
              min={0}
              max={10}
              step={0.1}
              suffix="%"
              decimals={1}
            />
            <Stepper
              label="Monto fijo x tx ($)"
              value={provFixed}
              onChange={setProvFixed}
              min={0}
              max={10}
              step={0.1}
              suffix="$"
              decimals={2}
            />
          </div>
        )}

        <Stepper
          label="IVA sobre comisiones (%)"
          value={iva}
          onChange={setIva}
          min={0}
          max={30}
          step={1}
          suffix="%"
          decimals={0}
        />
      </div>

      <div>
        <div
          className="proj-chips"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {(
            [
              ["Ticket prom.", fmt(ticket)],
              ["# Sucursales", rests],
              ["% Adopción", adopcion + "%"],
              ["Tx / mes", fmtN(txTotal)],
            ] as [string, string | number][]
          ).map(([l, v]) => (
            <div
              key={l}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  marginBottom: 4,
                }}
              >
                {l}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        <div
          className="proj-metrics"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MetricCard label="Ingreso / día" value={fmt(daily)} color="green" />
          <MetricCard
            label="Ingreso / semana"
            value={fmt(daily * 7)}
            color="green"
          />
          <MetricCard label="Ingreso / mes" value={fmt(monthly)} color="blue" />
          <MetricCard
            label="Ingreso / año"
            value={fmt(monthly * 12)}
            color="amber"
          />
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "1.25rem",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 4,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}
            >
              Concepto
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                textAlign: "right",
              }}
            >
              / Día
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                textAlign: "right",
              }}
            >
              / Mes
            </span>
          </div>
          {(
            [
              [
                "# Transacciones",
                parseFloat(txDiaTotal.toFixed(1)).toLocaleString("es-MX"),
                fmtN(txTotal),
                false,
              ],
              ["Volumen bruto", fmt(volDia), fmt(volMensual), false],
              [
                "Total cobrado",
                fmt(r.cobrado * txDiaTotal),
                fmt(r.cobrado * txTotal),
                false,
              ],
              [
                "Com. proveedor",
                fmt(r.comProvTotal * txDiaTotal),
                fmt(r.comProvTotal * txTotal),
                false,
              ],
              ["Ingreso Xquisito", fmt(daily), fmt(monthly), true],
            ] as [string, string, string, boolean][]
          ).map(([l, vd, vm, hi], i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 4,
                padding: "6px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ fontSize: 12, color: "#6b7280" }}>{l}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: hi ? 700 : 500,
                  color: hi ? "#0d9488" : "#111",
                  textAlign: "right",
                }}
              >
                {vd}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: hi ? 700 : 500,
                  color: hi ? "#0d9488" : "#111",
                  textAlign: "right",
                }}
              >
                {vm}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "1.25rem",
          }}
        >
          <p style={{ ...SUB, margin: "0 0 12px" }}>
            Escala — ingreso mensual por # sucursales ({txMesa} tx/mesa ·{" "}
            {mesas} mesas · {dias} días · {adopcion}% adopción · ticket{" "}
            {fmt(ticket)})
          </p>
          {milestones.map(({ label, value }) => (
            <MiniBar key={label} label={label} value={value} max={maxM} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Calculator() {
  const [tab, setTab] = useState("single");
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    try {
      if (tab === "single") localStorage.removeItem("xquisito_single");
      if (tab === "scenarios") localStorage.removeItem("xquisito_scenarios");
      if (tab === "projection") localStorage.removeItem("xquisito_projection");
    } catch {}
    setResetKey((k) => k + 1);
  };

  const TABS = [
    { id: "single", label: "Por transacción" },
    { id: "scenarios", label: "Escenarios" },
    { id: "projection", label: "Proyección" },
  ];

  return (
    <div
      style={{
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        background: "#f9fafb",
        minHeight: "100%",
      }}
    >
      <style>{`
        @media(max-width:640px){
          .single-wrap{grid-template-columns:1fr!important}
          .metrics-4{grid-template-columns:1fr 1fr!important}
          .proj-wrap{grid-template-columns:1fr!important}
          .proj-chips{grid-template-columns:1fr 1fr!important}
          .proj-metrics{grid-template-columns:1fr 1fr!important}
        }
      `}</style>
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 12px",
          height: 52,
          position: "sticky",
          top: 0,
          zIndex: 10,
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#f3f4f6",
            borderRadius: 10,
            padding: 3,
            flex: 1,
            maxWidth: 420,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "6px 4px",
                fontSize: 12,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                background: tab === t.id ? "#fff" : "transparent",
                color: tab === t.id ? "#111" : "#6b7280",
                fontWeight: tab === t.id ? 600 : 400,
                boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleReset}
          style={{
            fontSize: 20,
            color: "#9ca3af",
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
            flexShrink: 0,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ↺
        </button>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>
        {tab === "single" && <TabSingle key={"single-" + resetKey} />}
        {tab === "scenarios" && <TabScenarios key={"scenarios-" + resetKey} />}
        {tab === "projection" && (
          <TabProjection key={"projection-" + resetKey} />
        )}
      </div>
    </div>
  );
}
