import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   JOYRIDE LOGISTICS LLC — SOFTER BRAND THEME
   ═══════════════════════════════════════════ */
const B = {
  red: "#C13B40",
  redLight: "#d4585d",
  redDark: "#9e2f33",
  redGlow: "rgba(193,59,64,0.15)",
  redSub: "rgba(193,59,64,0.08)",
  /* Softer backgrounds — layered grays, not pure black */
  bg: "#1c1f26",
  header: "#14161c",
  card: "#252830",
  cardHover: "#2e313b",
  surface: "#2a2d36",
  /* Borders */
  bdr: "rgba(255,255,255,0.06)",
  bdrL: "rgba(255,255,255,0.10)",
  /* Text */
  white: "#f0f1f4",
  text: "#d0d2d8",
  muted: "#8e919c",
  dim: "#6b6e78",
  subtle: "#555862",
  /* Semantic */
  green: "#66bb6a",
  greenL: "#a5d6a7",
  greenBg: "rgba(102,187,106,0.10)",
  gold: "#ffd54f",
  goldDim: "#d4a53a",
  goldBg: "rgba(255,213,79,0.10)",
  bkp: "#ba68c8",
  bkpL: "#ce93d8",
  bkpBg: "rgba(186,104,200,0.10)",
  cancelRed: "#ef5350",
  cancelBg: "rgba(239,83,80,0.10)",
  /* Button */
  grad: "linear-gradient(135deg, #C13B40 0%, #363535 60%, #C13B40 100%)",
};

const NUM_DRIVERS = 20;
const NUM_TRUCKS = 10;
const DRIVERS = Array.from({ length: NUM_DRIVERS }, (_, i) => ({ id: i + 1, label: `Driver ${i + 1}` }));
const TRUCKS_INIT = Array.from({ length: NUM_TRUCKS }, (_, i) => ({
  id: i + 1,
  label: `Truck ${i + 1}`,
  primaryDriver: i * 2 + 1,
  secondaryDriver: i * 2 + 2,
}));

/* ─── Joyride Logo (actual PNG — white on transparent, needs dark bg) ─── */
const LOGO_SRC = "data:image/png;base64,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";

const JoyrideLogo = ({ height = 40 }) => (
  <img src={LOGO_SRC} alt="Joyride Logistics LLC" style={{ height, objectFit: "contain", display: "block" }} />
);

/* ─── Icons ─── */
const TruckSVG = ({ color = B.red, size = 40 }) => (
  <svg width={size} height={size * 0.64} viewBox="0 0 100 70" fill="none">
    <rect x="0" y="15" width="60" height="40" rx="5" fill={color} />
    <rect x="60" y="25" width="32" height="30" rx="5" fill={color} opacity="0.85" />
    <rect x="65" y="29" width="22" height="14" rx="3" fill="rgba(255,255,255,0.3)" />
    <circle cx="20" cy="58" r="8" fill="#222" /><circle cx="20" cy="58" r="4" fill="#444" />
    <circle cx="76" cy="58" r="8" fill="#222" /><circle cx="76" cy="58" r="4" fill="#444" />
    <rect x="92" y="32" width="5" height="4" rx="1" fill={B.gold} />
  </svg>
);

const PersonSVG = ({ color = B.red, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="11" r="7" fill={color} />
    <path d="M8 34 C8 24 32 24 32 34" fill={color} />
  </svg>
);

/* ─── Block Node ─── */
const BlockNode = ({ label, driverLabel, highlight, cancelled, onCancel, onAssign, assigning, availableBackups, backupAssigned, onRemoveBackup }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 80, position: "relative" }}>
    <div
      onClick={onCancel}
      style={{
        width: "100%",
        background: cancelled ? B.cancelBg : highlight ? B.redSub : B.surface,
        border: cancelled ? `2px solid ${B.cancelRed}` : highlight ? `2px solid rgba(193,59,64,0.4)` : `1px solid ${B.bdrL}`,
        borderRadius: 10, padding: "10px 6px", textAlign: "center", cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: cancelled ? B.cancelRed : highlight ? B.redLight : B.text }}>
        {label}
      </div>
      <div style={{
        fontSize: 11, marginTop: 4, fontWeight: 600,
        color: cancelled ? B.cancelRed : backupAssigned ? B.bkpL : highlight ? B.white : B.muted,
        textDecoration: cancelled && !backupAssigned ? "line-through" : "none",
      }}>
        {backupAssigned ? `D${backupAssigned}` : driverLabel}
        {backupAssigned && <span style={{ fontSize: 8, color: B.bkpL, marginLeft: 3 }}>(BKP)</span>}
      </div>
    </div>

    {cancelled && !backupAssigned && (
      <button
        onClick={(e) => { e.stopPropagation(); onAssign(); }}
        style={{
          marginTop: 5, backgroundImage: B.grad, backgroundSize: "200% auto",
          color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 9, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase",
          letterSpacing: 0.5, transition: "background-position 0.4s", whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = "right center")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = "left center")}
      >
        Assign Backup
      </button>
    )}

    {backupAssigned && (
      <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 9, color: B.bkpL, fontWeight: 600 }}>Backup</span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemoveBackup(); }}
          style={{ background: "rgba(239,83,80,0.15)", color: "#ef9a9a", border: "1px solid rgba(239,83,80,0.3)", borderRadius: 4, padding: "1px 5px", fontSize: 8, cursor: "pointer", lineHeight: "14px" }}
        >
          ✕
        </button>
      </div>
    )}

    {assigning && (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 4,
          background: B.card, border: `1.5px solid ${B.bkp}`, borderRadius: 10, padding: 8, zIndex: 100, minWidth: 160,
          boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: B.bkpL, marginBottom: 5, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Select Backup
        </div>
        {availableBackups.length === 0 ? (
          <div style={{ fontSize: 11, color: B.dim, textAlign: "center", padding: 6 }}>No available drivers</div>
        ) : (
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {availableBackups.map((d) => (
              <div
                key={d.id}
                onClick={d.onSelect}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 6,
                  cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "background 0.15s",
                  background: "transparent", marginBottom: 2, color: B.text,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = B.bkpBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <PersonSVG size={14} color={B.bkp} />
                <span>{d.label}</span>
                <span style={{ fontSize: 9, color: B.dim, marginLeft: "auto" }}>(T{d.homeTruck})</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => onAssign()}
          style={{ width: "100%", marginTop: 5, background: B.surface, color: B.muted, border: `1px solid ${B.bdr}`, borderRadius: 6, padding: "4px 0", fontSize: 9, cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    )}
  </div>
);

/* ═══ Main Component ═══ */
export default function JoyrideLogisticsDiagram() {
  const containerRef = useRef(null);
  const driverRefs = useRef({});
  const truckRefs = useRef({});
  const blockGroupRefs = useRef({});

  const [positions, setPositions] = useState(null);
  const [cancelledBlocks, setCancelledBlocks] = useState({});
  const [blockBackups, setBlockBackups] = useState({});
  const [assigningBlock, setAssigningBlock] = useState(null);
  const [hoveredDriver, setHoveredDriver] = useState(null);
  const [hoveredTruck, setHoveredTruck] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const blockKey = (truckId, blockNum) => `${truckId}-${blockNum}`;

  const getOriginalDriver = (truckId, blockNum) => {
    const truck = TRUCKS_INIT.find((t) => t.id === truckId);
    return blockNum % 2 === 1 ? truck.primaryDriver : truck.secondaryDriver;
  };

  const getEffectiveDriver = (truckId, blockNum) => {
    const key = blockKey(truckId, blockNum);
    if (blockBackups[key]) return blockBackups[key];
    return getOriginalDriver(truckId, blockNum);
  };

  const isDriverCalledOff = (driverId) => {
    for (const [key, cancelled] of Object.entries(cancelledBlocks)) {
      if (!cancelled) continue;
      const [tid, bnum] = key.split("-").map(Number);
      if (getOriginalDriver(tid, bnum) === driverId && !blockBackups[key]) return true;
    }
    return false;
  };

  const isDriverBackup = (driverId) => Object.values(blockBackups).includes(driverId);

  const getDriverBackupBlocks = (driverId) => {
    const blocks = [];
    for (const [key, bid] of Object.entries(blockBackups)) {
      if (bid === driverId) {
        const [tid, bnum] = key.split("-").map(Number);
        blocks.push({ truckId: tid, blockNum: bnum });
      }
    }
    return blocks;
  };

  const getAvailableForBlock = (truckId, blockNum) => {
    const usedAsBackup = new Set(Object.values(blockBackups));
    const truck = TRUCKS_INIT.find((t) => t.id === truckId);
    return DRIVERS.filter((d) => {
      if (usedAsBackup.has(d.id)) return false;
      if (d.id === truck.primaryDriver || d.id === truck.secondaryDriver) return false;
      for (const bk of Object.keys(cancelledBlocks)) {
        if (!cancelledBlocks[bk]) continue;
        const [tid, bn] = bk.split("-").map(Number);
        if (getOriginalDriver(tid, bn) === d.id && !blockBackups[bk]) return false;
      }
      return true;
    }).map((d) => {
      const homeTruck = TRUCKS_INIT.find((t) => t.primaryDriver === d.id || t.secondaryDriver === d.id);
      return { ...d, homeTruck: homeTruck?.id };
    });
  };

  const toggleBlockCancel = (truckId, blockNum) => {
    const key = blockKey(truckId, blockNum);
    setCancelledBlocks((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        setBlockBackups((bb) => { const n = { ...bb }; delete n[key]; return n; });
      } else {
        next[key] = true;
      }
      return next;
    });
    setAssigningBlock(null);
  };

  const assignBlockBackup = (truckId, blockNum, driverId) => {
    const key = blockKey(truckId, blockNum);
    setBlockBackups((prev) => ({ ...prev, [key]: driverId }));
    setAssigningBlock(null);
  };

  const removeBlockBackup = (truckId, blockNum) => {
    const key = blockKey(truckId, blockNum);
    setBlockBackups((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const resetAll = () => {
    setCancelledBlocks({});
    setBlockBackups({});
    setAssigningBlock(null);
    setSelectedTruck(null);
  };

  /* ─── Position measurement ─── */
  const measurePositions = useCallback(() => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const ox = cr.left, oy = cr.top;
    const dp = {}, tp = {}, bp = {};
    for (const [id, el] of Object.entries(driverRefs.current)) {
      if (el) { const r = el.getBoundingClientRect(); dp[id] = { x: r.right - ox, y: r.top + r.height / 2 - oy }; }
    }
    for (const [id, el] of Object.entries(truckRefs.current)) {
      if (el) { const r = el.getBoundingClientRect(); tp[id] = { left: { x: r.left - ox, y: r.top + r.height / 2 - oy }, right: { x: r.right - ox, y: r.top + r.height / 2 - oy } }; }
    }
    for (const [id, el] of Object.entries(blockGroupRefs.current)) {
      if (el) { const r = el.getBoundingClientRect(); bp[id] = { x: r.left - ox, y: r.top + r.height / 2 - oy }; }
    }
    setPositions({ drivers: dp, trucks: tp, blocks: bp });
  }, []);

  useEffect(() => {
    const t = setTimeout(measurePositions, 120);
    window.addEventListener("resize", measurePositions);
    return () => { clearTimeout(t); window.removeEventListener("resize", measurePositions); };
  }, [measurePositions]);

  useEffect(() => {
    const t = setTimeout(measurePositions, 60);
    return () => clearTimeout(t);
  }, [cancelledBlocks, blockBackups, assigningBlock, measurePositions]);

  /* ─── Line helpers ─── */
  const getLineColor = (driverId, truckId) => {
    if (isDriverCalledOff(driverId)) return B.cancelRed;
    if (Object.entries(blockBackups).some(([k, v]) => v === driverId && k.startsWith(`${truckId}-`))) return B.bkp;
    const truck = TRUCKS_INIT.find((t) => t.id === truckId);
    if (hoveredDriver === driverId || hoveredTruck === truckId) return B.red;
    if (truck?.primaryDriver === driverId) return B.green;
    return B.gold;
  };

  const getLineOpacity = (driverId) => {
    if (isDriverCalledOff(driverId)) return 0.15;
    if (hoveredDriver && hoveredDriver !== driverId) return 0.05;
    if (hoveredTruck && !TRUCKS_INIT.find((t) => t.id === hoveredTruck && (t.primaryDriver === driverId || t.secondaryDriver === driverId))) return 0.05;
    return 0.45;
  };

  const getLineWidth = (driverId) => (hoveredDriver === driverId ? 2.5 : 1.2);

  const connections = [];
  for (const truck of TRUCKS_INIT) {
    connections.push({ driverId: truck.primaryDriver, truckId: truck.id, type: "primary" });
    connections.push({ driverId: truck.secondaryDriver, truckId: truck.id, type: "secondary" });
  }
  const backupConnectionsAdded = new Set();
  for (const [key, driverId] of Object.entries(blockBackups)) {
    const [tid] = key.split("-").map(Number);
    const connKey = `${driverId}-${tid}`;
    if (!backupConnectionsAdded.has(connKey)) {
      connections.push({ driverId, truckId: tid, type: "backup" });
      backupConnectionsAdded.add(connKey);
    }
  }

  const cancelCount = Object.keys(cancelledBlocks).length;
  const backupCount = Object.keys(blockBackups).length;

  const HEADER_H = 36;
  const SLOT_H = 88;
  const DRIVER_H = SLOT_H / 2;
  const ROW = { boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif", background: B.bg, minHeight: "100vh", color: B.text }}>

      {/* ═══ Header ═══ */}
      <div style={{
        background: B.header, padding: "14px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `2px solid ${B.red}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <JoyrideLogo height={36} />
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: B.muted, letterSpacing: 0.5 }}>Fleet Operations</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {cancelCount > 0 && (
            <div style={{ fontSize: 12, color: "#ef9a9a", fontWeight: 500 }}>
              {cancelCount} block{cancelCount > 1 ? "s" : ""} cancelled
              {backupCount > 0 && ` · ${backupCount} backup${backupCount > 1 ? "s" : ""}`}
            </div>
          )}
          {(cancelCount > 0 || backupCount > 0) && (
            <button onClick={resetAll} style={{
              backgroundImage: B.grad, backgroundSize: "200% auto",
              color: "#fff", border: "none", borderRadius: 4, padding: "7px 18px",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase",
              letterSpacing: 1, transition: "background-position 0.4s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = "right center")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = "left center")}
            >Reset All</button>
          )}
        </div>
      </div>

      {/* ═══ Legend ═══ */}
      <div style={{
        display: "flex", gap: 20, padding: "10px 28px",
        background: B.card, borderBottom: `1px solid ${B.bdr}`,
        fontSize: 12, flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, color: B.redLight, textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}>Legend</span>
        {[
          { color: B.green, label: "Primary Driver", type: "line" },
          { color: B.gold, label: "Secondary Driver", type: "line" },
          { color: B.bkp, label: "Backup Assigned", type: "line" },
          { color: B.cancelRed, label: "Cancelled Block", type: "dot" },
        ].map((item) => (
          <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, color: B.muted }}>
            <span style={{
              width: item.type === "dot" ? 10 : 20, height: item.type === "dot" ? 10 : 2.5,
              background: item.color, display: "inline-block",
              borderRadius: item.type === "dot" ? 2 : 1,
            }} />
            {item.label}
          </span>
        ))}
        <span style={{ color: B.dim, marginLeft: "auto", fontStyle: "italic", fontSize: 11 }}>
          Click a block to cancel · Assign backup from dropdown
        </span>
      </div>

      {/* ═══ Main Diagram ═══ */}
      <div ref={containerRef} style={{ position: "relative", display: "flex", padding: "24px 20px", gap: 0, background: B.bg }}>

        {/* SVG lines */}
        {positions && (
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
            <defs>
              {[B.green, B.gold, B.red, B.cancelRed, B.bkp].map((c, i) => (
                <marker key={i} id={`a-${c.replace("#","")}`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                  <path d="M0,0 L6,2 L0,4" fill={c} opacity="0.6" />
                </marker>
              ))}
            </defs>
            {connections.map(({ driverId, truckId, type }) => {
              const dp = positions.drivers[driverId];
              const tp = positions.trucks[truckId];
              if (!dp || !tp) return null;
              const color = getLineColor(driverId, truckId);
              const midX = (dp.x + tp.left.x) / 2;
              return (
                <path key={`${type}-d${driverId}-t${truckId}`}
                  d={`M${dp.x},${dp.y} C${midX},${dp.y} ${midX},${tp.left.y} ${tp.left.x},${tp.left.y}`}
                  stroke={color} strokeWidth={type === "backup" ? 2.5 : getLineWidth(driverId)} fill="none"
                  opacity={getLineOpacity(driverId)}
                  strokeDasharray={isDriverCalledOff(driverId) ? "4,4" : type === "backup" ? "6,3" : "none"}
                  markerEnd={`url(#a-${color.replace("#","")})`}
                />
              );
            })}
            {TRUCKS_INIT.map((truck) => {
              const tp = positions.trucks[truck.id];
              const bp = positions.blocks[truck.id];
              if (!tp || !bp) return null;
              const isHl = hoveredTruck === truck.id || selectedTruck === truck.id;
              return (
                <line key={`tb-${truck.id}`}
                  x1={tp.right.x} y1={tp.right.y} x2={bp.x} y2={bp.y}
                  stroke={isHl ? B.red : "rgba(255,255,255,0.08)"} strokeWidth={isHl ? 2 : 1}
                  opacity={isHl ? 0.7 : 0.3} strokeDasharray="6,3"
                />
              );
            })}
          </svg>
        )}

        {/* ── Drivers Column ── */}
        <div style={{ flex: "0 0 155px", display: "flex", flexDirection: "column", zIndex: 2, paddingRight: 8 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: B.redLight, textAlign: "center",
            textTransform: "uppercase", letterSpacing: 1.5, height: HEADER_H,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderBottom: `1px solid ${B.bdr}`, boxSizing: "border-box",
          }}>
            20 Drivers
          </div>
          {DRIVERS.map((d) => {
            const truck = TRUCKS_INIT.find((t) => t.primaryDriver === d.id || t.secondaryDriver === d.id);
            const isPrimary = truck?.primaryDriver === d.id;
            const calledOff = isDriverCalledOff(d.id);
            const isBkp = isDriverBackup(d.id);
            const isHov = hoveredDriver === d.id;
            const bkpBlocks = getDriverBackupBlocks(d.id);
            return (
              <div key={d.id} ref={(el) => (driverRefs.current[d.id] = el)}
                onMouseEnter={() => setHoveredDriver(d.id)} onMouseLeave={() => setHoveredDriver(null)}
                style={{
                  ...ROW, display: "flex", alignItems: "center", gap: 6, padding: "0 10px",
                  height: DRIVER_H, borderRadius: 8,
                  background: calledOff ? B.cancelBg : isBkp ? B.bkpBg : isHov ? B.redSub : "transparent",
                  border: calledOff ? `1.5px solid rgba(239,83,80,0.4)` : isBkp ? `1.5px solid rgba(186,104,200,0.3)` : isHov ? `1.5px solid rgba(193,59,64,0.3)` : `1.5px solid transparent`,
                  transition: "all 0.2s ease", opacity: calledOff ? 0.5 : 1,
                }}
              >
                <PersonSVG size={16} color={calledOff ? B.cancelRed : isBkp ? B.bkp : isHov ? B.red : isPrimary ? B.green : B.gold} />
                <span style={{ fontSize: 12, fontWeight: 600, flex: 1, textDecoration: calledOff ? "line-through" : "none", color: calledOff ? B.muted : B.text }}>
                  {d.label}
                </span>
                {isBkp && <span style={{ fontSize: 8, color: B.bkpL, fontWeight: 700 }}>BKP</span>}
                {bkpBlocks.length > 0 && (
                  <span style={{ fontSize: 8, color: B.bkpL }}>T{bkpBlocks[0].truckId}B{bkpBlocks[0].blockNum}</span>
                )}
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: calledOff ? B.cancelRed : isBkp ? B.bkp : isPrimary ? B.green : B.gold,
                }} />
              </div>
            );
          })}
        </div>

        {/* ── Trucks Column ── */}
        <div style={{ flex: "0 0 190px", display: "flex", flexDirection: "column", zIndex: 3, paddingLeft: 40, paddingRight: 40 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: B.redLight, textAlign: "center",
            textTransform: "uppercase", letterSpacing: 1.5, height: HEADER_H,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderBottom: `1px solid ${B.bdr}`, boxSizing: "border-box",
          }}>
            10 Trucks
          </div>
          {TRUCKS_INIT.map((truck) => {
            const isHov = hoveredTruck === truck.id;
            const isSel = selectedTruck === truck.id;
            const hasCancelledBlock = [1,2,3,4].some((bn) => cancelledBlocks[blockKey(truck.id, bn)]);
            return (
              <div key={truck.id} ref={(el) => (truckRefs.current[truck.id] = el)}
                onMouseEnter={() => setHoveredTruck(truck.id)} onMouseLeave={() => setHoveredTruck(null)}
                onClick={() => setSelectedTruck(isSel ? null : truck.id)}
                style={{
                  ...ROW, display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "6px 8px", height: SLOT_H, borderRadius: 12, cursor: "pointer",
                  justifyContent: "center",
                  background: isSel ? B.redSub : isHov ? B.cardHover : hasCancelledBlock ? B.cancelBg : B.card,
                  border: isSel ? `1.5px solid rgba(193,59,64,0.4)` : isHov ? `1.5px solid rgba(193,59,64,0.25)` : hasCancelledBlock ? `1.5px solid rgba(239,83,80,0.2)` : `1.5px solid ${B.bdr}`,
                  transition: "all 0.2s ease",
                }}
              >
                <TruckSVG size={34} color={hasCancelledBlock ? B.cancelRed : isSel || isHov ? B.red : B.redLight} />
                <span style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: B.white }}>{truck.label}</span>
                <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 9, color: B.green, fontWeight: 600 }}>P: D{truck.primaryDriver}</span>
                  <span style={{ fontSize: 9, color: B.gold, fontWeight: 600 }}>S: D{truck.secondaryDriver}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Blocks Column ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 4, paddingLeft: 20 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: B.redLight, textAlign: "center",
            textTransform: "uppercase", letterSpacing: 1.5, height: HEADER_H,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderBottom: `1px solid ${B.bdr}`, boxSizing: "border-box",
          }}>
            1 Load = 4 Blocks per Truck
          </div>
          {TRUCKS_INIT.map((truck) => {
            const isHl = hoveredTruck === truck.id || selectedTruck === truck.id;
            return (
              <div key={truck.id} ref={(el) => (blockGroupRefs.current[truck.id] = el)}
                style={{ ...ROW, display: "flex", gap: 8, alignItems: "center", height: SLOT_H }}
              >
                {[1, 2, 3, 4].map((bn) => {
                  const key = blockKey(truck.id, bn);
                  const origDriver = getOriginalDriver(truck.id, bn);
                  const isCancelled = !!cancelledBlocks[key];
                  const backup = blockBackups[key];
                  const isAssigning = assigningBlock === key;
                  const available = isAssigning ? getAvailableForBlock(truck.id, bn) : [];
                  return (
                    <BlockNode
                      key={bn}
                      label={`B${bn}`}
                      driverLabel={`D${origDriver}`}
                      highlight={isHl}
                      cancelled={isCancelled}
                      backupAssigned={backup}
                      assigning={isAssigning}
                      availableBackups={available.map((d) => ({ ...d, onSelect: () => assignBlockBackup(truck.id, bn, d.id) }))}
                      onCancel={() => toggleBlockCancel(truck.id, bn)}
                      onAssign={() => setAssigningBlock(isAssigning ? null : key)}
                      onRemoveBackup={() => removeBlockBackup(truck.id, bn)}
                    />
                  );
                })}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginLeft: 8, fontSize: 9, color: B.dim, whiteSpace: "nowrap" }}>
                  <span style={{ color: B.green }}>P: D{truck.primaryDriver} → B1, B3</span>
                  <span style={{ color: B.gold }}>S: D{truck.secondaryDriver} → B2, B4</span>
                  <span style={{ color: B.subtle }}>10hr rest between</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Rotation Detail ═══ */}
      {selectedTruck && (() => {
        const truck = TRUCKS_INIT.find((t) => t.id === selectedTruck);
        const timeline = [];
        for (let bn = 1; bn <= 4; bn++) {
          const key = blockKey(truck.id, bn);
          const origDriver = getOriginalDriver(truck.id, bn);
          const effDriver = blockBackups[key] || origDriver;
          const isCancelled = !!cancelledBlocks[key];
          const isPrimary = bn % 2 === 1;
          timeline.push({
            label: `Block ${bn}`, driver: `Driver ${effDriver}`,
            type: isCancelled && !blockBackups[key] ? "cancelled" : isPrimary ? "primary" : "secondary",
            isBackup: !!blockBackups[key],
          });
          if (bn < 4) timeline.push({ label: "10hr Rest", type: "break" });
        }
        return (
          <div style={{
            margin: "0 20px 16px", background: B.card,
            border: `1px solid rgba(193,59,64,0.2)`, borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <TruckSVG color={B.red} size={34} />
              <div>
                <h4 style={{ margin: 0, color: B.white, fontSize: 14, fontWeight: 700 }}>
                  Truck {selectedTruck} — Rotation Schedule
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: B.muted }}>
                  Drivers alternate blocks with mandatory 10-hour rest. Click blocks above to simulate cancellations.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
              {timeline.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, textAlign: "center",
                    background: step.type === "break" ? B.goldBg : step.type === "cancelled" ? B.cancelBg : step.type === "primary" ? B.greenBg : B.goldBg,
                    color: step.type === "break" ? B.gold : step.type === "cancelled" ? B.cancelRed : step.isBackup ? B.bkpL : step.type === "primary" ? B.greenL : B.gold,
                    border: step.type === "break" ? `1px dashed rgba(255,213,79,0.3)` : step.type === "cancelled" ? `1px solid rgba(239,83,80,0.3)` : step.type === "primary" ? `1px solid rgba(102,187,106,0.3)` : `1px solid rgba(255,213,79,0.3)`,
                  }}>
                    <div>{step.label}</div>
                    {step.driver && (
                      <div style={{ fontSize: 9, opacity: 0.85, marginTop: 2 }}>
                        {step.driver}{step.isBackup ? " (BKP)" : ""}{step.type === "cancelled" ? " OPEN" : ""}
                      </div>
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <svg width="20" height="8" viewBox="0 0 20 8" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="4" x2="13" y2="4" stroke={B.subtle} strokeWidth="1" />
                      <path d="M12,1 L18,4 L12,7" fill={B.subtle} />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ═══ Footer ═══ */}
      <div style={{
        padding: "12px 28px", borderTop: `1px solid ${B.bdr}`, background: B.header,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, fontSize: 11, color: B.subtle,
      }}>
        <span style={{ color: B.red, fontWeight: 700 }}>JOYRIDE LOGISTICS, LLC</span>
        <span>·</span><span>joyridelogistics.com</span><span>·</span><span>Fleet Operations Overview</span>
      </div>
    </div>
  );
}
