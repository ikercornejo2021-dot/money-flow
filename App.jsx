import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "iker_cornejo_wallet";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { balance: 0, totalIncome: 0, txCount: 0 };
    return JSON.parse(raw);
  } catch {
    return { balance: 0, totalIncome: 0, txCount: 0 };
  }
}

function saveToDisk(balance, totalIncome, txCount) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, totalIncome, txCount }));
  } catch {}
}

const SENDERS = [
  { name: "Carlos M.", avatar: "CM", color: "#00ff88" },
  { name: "Spotify Inc.", avatar: "SP", color: "#1DB954" },
  { name: "PayPal", avatar: "PP", color: "#003087" },
  { name: "Amazon", avatar: "AMZ", color: "#FF9900" },
  { name: "Ana Torres", avatar: "AT", color: "#ff6b9d" },
  { name: "Freelance Co.", avatar: "FC", color: "#7c3aed" },
  { name: "Google LLC", avatar: "GL", color: "#4285F4" },
  { name: "Luis Ríos", avatar: "LR", color: "#f59e0b" },
  { name: "Transferencia", avatar: "TR", color: "#06b6d4" },
  { name: "Marketplace", avatar: "MK", color: "#10b981" },
];

const CONCEPTS = [
  "Pago por servicios",
  "Transferencia recibida",
  "Comisión mensual",
  "Depósito directo",
  "Venta completada",
  "Reembolso procesado",
  "Bono de rendimiento",
  "Ingreso por consultoría",
  "Pago de factura",
  "Dividendo recibido",
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function generateTransaction(id) {
  const sender = SENDERS[Math.floor(Math.random() * SENDERS.length)];
  const concept = CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)];
  const amount = parseFloat(randomBetween(12, 2800).toFixed(2));
  return { id, sender, concept, amount, timestamp: new Date(), entering: true };
}

function Particle({ x, y }) {
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#00ff88",
        pointerEvents: "none",
        animation: "particleFly 1s ease-out forwards",
        zIndex: 9999,
      }}
    />
  );
}

export default function App() {
  const saved = useRef(loadSaved());
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(saved.current.balance);
  const [displayBalance, setDisplayBalance] = useState(saved.current.balance);
  const [totalIncome, setTotalIncome] = useState(saved.current.totalIncome);
  const [displayIncome, setDisplayIncome] = useState(saved.current.totalIncome);
  const [storedTxCount, setStoredTxCount] = useState(saved.current.txCount);
  const [particles, setParticles] = useState([]);
  const [pulse, setPulse] = useState(false);
  const balanceRef = useRef(saved.current.balance);
  const incomeRef = useRef(saved.current.totalIncome);
  const txIdRef = useRef(0);
  const animFrameRef = useRef(null);
  const targetBalanceRef = useRef(saved.current.balance);
  const targetIncomeRef = useRef(saved.current.totalIncome);
  const liveBalanceRef = useRef(saved.current.balance);
  const liveTxCountRef = useRef(saved.current.txCount);

  // Smooth counter animation
  useEffect(() => {
    const animate = () => {
      const bDiff = targetBalanceRef.current - balanceRef.current;
      const iDiff = targetIncomeRef.current - incomeRef.current;

      if (Math.abs(bDiff) > 0.01) {
        balanceRef.current += bDiff * 0.08;
        setDisplayBalance(balanceRef.current);
      } else {
        balanceRef.current = targetBalanceRef.current;
        setDisplayBalance(targetBalanceRef.current);
      }

      if (Math.abs(iDiff) > 0.01) {
        incomeRef.current += iDiff * 0.08;
        setDisplayIncome(incomeRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Spawn transactions
  useEffect(() => {
    const spawnTx = () => {
      const tx = generateTransaction(txIdRef.current++);
      targetBalanceRef.current += tx.amount;
      targetIncomeRef.current += tx.amount;
      setBalance((b) => b + tx.amount);
      setTotalIncome((t) => t + tx.amount);
      liveBalanceRef.current += tx.amount;
      liveTxCountRef.current += 1;
      setStoredTxCount(liveTxCountRef.current);

      // Persist to localStorage
      saveToDisk(liveBalanceRef.current, targetIncomeRef.current, liveTxCountRef.current);

      // Pulse effect
      setPulse(true);
      setTimeout(() => setPulse(false), 600);

      // Particles
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * 200 + 50,
      }));
      setParticles((p) => [...p, ...newParticles]);
      setTimeout(() => {
        setParticles((p) =>
          p.filter((pt) => !newParticles.find((np) => np.id === pt.id))
        );
      }, 1000);

      setTransactions((prev) => {
        const updated = [tx, ...prev].slice(0, 20);
        return updated;
      });

      // Remove entering state
      setTimeout(() => {
        setTransactions((prev) =>
          prev.map((t) => (t.id === tx.id ? { ...t, entering: false } : t))
        );
      }, 600);

      // Next spawn: random 6s–90s
      const delay = randomBetween(6000, 90000);
      timeoutRef.current = setTimeout(spawnTx, delay);
    };

    const timeoutRef = { current: null };
    timeoutRef.current = setTimeout(spawnTx, 3000);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const txCount = storedTxCount;

  return (
    <div style={{ minHeight: "100vh", background: "#080b12", fontFamily: "'Courier New', monospace", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes particleFly {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(0) translateY(-80px); opacity: 0; }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px #00ff8844, 0 0 40px #00ff8822; }
          50% { box-shadow: 0 0 40px #00ff8888, 0 0 80px #00ff8844; }
        }

        @keyframes numberPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); color: #00ff88; }
          100% { transform: scale(1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes rainDrop {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        .balance-amount {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 8vw, 6rem);
          color: #00ff88;
          letter-spacing: 2px;
          line-height: 1;
          transition: color 0.2s;
        }

        .balance-amount.pulsing {
          animation: numberPop 0.5s ease-out;
        }

        .tx-row {
          animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .balance-card {
          animation: glow 3s ease-in-out infinite;
        }

        .cursor {
          animation: blink 1s step-end infinite;
          color: #00ff88;
        }

        .grid-bg {
          animation: gridPulse 4s ease-in-out infinite;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #00ff8844; border-radius: 2px; }
      `}</style>

      {/* Matrix rain background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${i * 5.2}%`,
              top: 0,
              color: "#00ff8820",
              fontSize: 10,
              fontFamily: "monospace",
              animation: `rainDrop ${randomBetween(4, 9)}s linear ${randomBetween(0, 5)}s infinite`,
              writingMode: "vertical-rl",
              letterSpacing: 4,
            }}
          >
            {Array.from({ length: 20 }, () =>
              Math.random() > 0.5
                ? Math.floor(Math.random() * 10)
                : String.fromCharCode(0x30a0 + Math.random() * 96)
            ).join("")}
          </div>
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="grid-bg"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(#00ff8806 1px, transparent 1px), linear-gradient(90deg, #00ff8806 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Scanline */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(transparent, #00ff8830, transparent)",
          animation: "scanline 6s linear infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} />
      ))}

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, animation: "fadeInUp 0.6s ease forwards" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 12px #00ff88" }} />
              <span style={{ color: "#00ff8888", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>
                SISTEMA ACTIVO
              </span>
            </div>
            <button
              onClick={() => {
                if (!confirm("¿Resetear todo el saldo acumulado?")) return;
                localStorage.removeItem(STORAGE_KEY);
                liveBalanceRef.current = 0;
                liveTxCountRef.current = 0;
                targetBalanceRef.current = 0;
                targetIncomeRef.current = 0;
                balanceRef.current = 0;
                incomeRef.current = 0;
                setBalance(0);
                setTotalIncome(0);
                setStoredTxCount(0);
                setTransactions([]);
              }}
              style={{
                background: "transparent",
                border: "1px solid #ff444422",
                color: "#ff444466",
                fontSize: 9,
                letterSpacing: 3,
                padding: "4px 10px",
                borderRadius: 2,
                cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              RESET
            </button>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#e8f5e9", letterSpacing: 6, lineHeight: 1.1 }}>
            FLUJO_DE_INGRESOS<span className="cursor">_</span>
          </h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 2, background: "#00ff8815", border: "1px solid #00ff8833", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#00ff88", fontFamily: "'Space Mono', monospace" }}>
              IC
            </div>
            <div>
              <div style={{ color: "#c8e6c9", fontSize: 12, fontFamily: "'Space Mono', monospace", fontWeight: 700, letterSpacing: 2 }}>
                IKER CORNEJO
              </div>
              <div style={{ color: "#3a5040", fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>
                TITULAR DE CUENTA
              </div>
            </div>
          </div>
        </div>

        {/* Balance cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          {/* Main balance */}
          <div
            className="balance-card"
            style={{
              gridColumn: "1 / -1",
              background: "linear-gradient(135deg, #0d1f0e 0%, #0a1a10 100%)",
              border: "1px solid #00ff8833",
              borderRadius: 4,
              padding: "24px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #00ff88, transparent)" }} />
            <div style={{ color: "#00ff8866", fontSize: 10, letterSpacing: 4, marginBottom: 8, fontFamily: "'Space Mono', monospace" }}>
              SALDO ACUMULADO
            </div>
            <div className={`balance-amount${pulse ? " pulsing" : ""}`}>
              {formatCurrency(displayBalance)}
            </div>
            <div style={{ marginTop: 8, color: "#00ff8844", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
              +{formatCurrency(displayBalance - displayIncome + displayIncome)} TOTAL
            </div>
          </div>

          {/* Total income */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #00ff8820",
            borderRadius: 4,
            padding: "16px 20px",
          }}>
            <div style={{ color: "#4ade8066", fontSize: 9, letterSpacing: 3, marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>INGRESOS HOY</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#4ade80", letterSpacing: 1 }}>
              {formatCurrency(displayIncome)}
            </div>
          </div>

          {/* Transaction count */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #00ff8820",
            borderRadius: 4,
            padding: "16px 20px",
          }}>
            <div style={{ color: "#4ade8066", fontSize: 9, letterSpacing: 3, marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>TRANSACCIONES</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#4ade80", letterSpacing: 1 }}>
              {String(txCount).padStart(3, "0")}
            </div>
          </div>
        </div>

        {/* Transaction feed */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ color: "#00ff8866", fontSize: 10, letterSpacing: 4, fontFamily: "'Space Mono', monospace" }}>
              TRANSACCIONES ENTRANTES
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 8px #00ff88", animation: "blink 1.5s ease-in-out infinite" }} />
              <span style={{ color: "#00ff8866", fontSize: 9, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>LIVE</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {transactions.map((tx, i) => (
              <div
                key={tx.id}
                className={tx.entering ? "tx-row" : ""}
                style={{
                  background: tx.entering
                    ? "linear-gradient(135deg, #0d2a1a, #0a1a10)"
                    : i === 0
                    ? "#0d1a10"
                    : "#0a0e14",
                  border: `1px solid ${tx.entering ? "#00ff8855" : i === 0 ? "#00ff8830" : "#1a2030"}`,
                  borderRadius: 4,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "background 0.8s, border-color 0.8s",
                  opacity: Math.max(0.4, 1 - i * 0.04),
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    background: tx.sender.color + "22",
                    border: `1px solid ${tx.sender.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: tx.sender.color,
                    letterSpacing: 1,
                    flexShrink: 0,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {tx.sender.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#c8e6c9", fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tx.sender.name}
                  </div>
                  <div style={{ color: "#4a6050", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Space Mono', monospace" }}>
                    {tx.concept}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: tx.entering ? 22 : 18,
                    color: tx.entering ? "#00ff88" : "#4ade80",
                    letterSpacing: 1,
                    transition: "font-size 0.4s, color 0.8s",
                    textShadow: tx.entering ? "0 0 20px #00ff88" : "none",
                  }}>
                    +{formatCurrency(tx.amount)}
                  </div>
                  <div style={{ color: "#3a5040", fontSize: 9, fontFamily: "'Space Mono', monospace", marginTop: 1 }}>
                    {tx.timestamp.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#1a3020", fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 3 }}>
                ESPERANDO CONEXIÓN<span className="cursor">_</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #0d1a10", textAlign: "center", color: "#1a3020", fontSize: 9, letterSpacing: 3, fontFamily: "'Space Mono', monospace" }}>
          MONTOS FICTICIOS — SOLO DEMO
        </div>
      </div>
    </div>
  );
}
