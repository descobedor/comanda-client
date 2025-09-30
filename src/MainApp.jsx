import { useEffect, useRef, useState } from "react";
import { FaConciergeBell, FaFileInvoiceDollar, FaTimesCircle } from "react-icons/fa";
import { useUuid } from "./UuidContext";
import "./App.css";
import ShareQR from "./ShareQR";

const WS_BASE = "wss://signaling-server-z9az.onrender.com";
const APP_URL = "https://comanda-client.vercel.app";


function MainApp() {
  const { uuid, setUuid } = useUuid();
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [closedByWaiter, setClosedByWaiter] = useState(false);

  const [pendingStack, setPendingStack] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [everConnected, setEverConnected] = useState(false);
  

  const canOrder = pendingStack.length === 0 && !closedByWaiter;
  const canCancel = pendingStack.length > 0 && !closedByWaiter;


  useEffect(() => {
    if (!uuid) return;

    const cleanId = uuid.split("/").pop();
    const socket = new WebSocket(`${WS_BASE}/${cleanId}`);
    ws.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setError(null);
      setClosedByWaiter(false);
      setEverConnected(true); 
    };

    socket.onerror = () => {
      setError("No se pudo conectar a la mesa. Verifica el código.");
      setConnected(false);
    };

    socket.onclose = (event) => {
  setConnected(false);

  if (event.reason === "Mesa cerrada por camarero") {
    setClosedByWaiter(true);
    setLastAction(t(lang, "tableClosed"));
    setUuid(null); // 👈 limpiar uuid localStorage

  } else if (event.reason === "Mesa cerrada por falta de camarero") {
    setClosedByWaiter(true);
    setLastAction(t(lang, "waiterClosed"));
    setUuid(null);

  } else if (event.reason === "Mesa no existe o fue cerrada") {
    setClosedByWaiter(true);
    setLastAction("⚠️ " + event.reason);
    setUuid(null); // 👈 limpiar uuid también

  } else {
    setLastAction(t(lang, "disconnected"));
  }
};


    socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "history") {
    if (msg.data.length > 0) {
      const last = msg.data[msg.data.length - 1];
      setLastAction(renderIcon(last.action, last.status));
    }
    const pendingIds = msg.data
      .filter((m) => m.status === "pending")
      .map((m) => m.id);
    setPendingStack(pendingIds);

  } else if (msg.type === "message") {
    setLastAction(renderIcon(msg.data.action, msg.data.status));
    setPendingStack((prev) => [...prev, msg.data.id]);

  } else if (msg.type === "confirmation") {
    setLastAction(renderIcon(msg.data.action, "confirmed"));
    setPendingStack((prev) => prev.filter((id) => id !== msg.data.id));

  } else if (msg.type === "cancellation") {
    setLastAction(renderIcon(msg.data.action, "cancelled"));
    setPendingStack((prev) => prev.filter((id) => id !== msg.data.id));
  }
};


    return () => socket.close();
  }, [uuid]);

  const sendOrder = (action) => {
    if (ws.current && ws.current.readyState === 1) {
      const payload = { type: "message", data: { action } };
      ws.current.send(JSON.stringify(payload));
      setLastAction(renderIcon(action, "pending"));
    }
  };

  const cancelLast = () => {
    if (!pendingStack.length || !ws.current || ws.current.readyState !== 1) return;
    const lastId = pendingStack[pendingStack.length - 1];
    ws.current.send(JSON.stringify({ type: "cancellation", id: lastId, origin: "client" }));
    setLastAction("❌ Cancelado por ti");
  };

  const handleJoin = () => {
    const id = prompt("Introduce el UUID de la mesa:");
    if (id) {
      const cleanId = id.split("/").pop();
      setUuid(cleanId.trim());
    }
  };

  const renderIcon = (action, status) => {
  let icon;
  if (action === "service") icon = <FaConciergeBell />;
  if (action === "bill") icon = <FaFileInvoiceDollar />;
  if (action === "cancel") icon = <FaTimesCircle />;

  let label = "";
  if (action === "service") label = "Servicio del restaurante";
  if (action === "bill") label = "Cuenta";
  if (action === "cancel") label = "Cancelado";

  let color = "#333";
  if (status === "pending") color = "#ffc107";
  if (status === "confirmed") color = "#28a745";
  if (status === "cancelled") color = "#dc3545";

  let labelStatus = status;
  if (status == "confirmed") labelStatus = "realizado";
  if (status == "cancelled") labelStatus = "cancelado";

  return (
    <div className={`last-action ${status}`}>
      <h3>Última acción</h3>
      <div className="icon" style={{ color, fontSize: "48px" }}>
        {icon}
      </div>
      <p style={{ color }}>{label} — {status}</p>
    </div>
  );
};


  return (
    <div className="appA-container">
      {!uuid && (
        <button className="join-btn" onClick={handleJoin}>
          📷 Escanear / Introducir Mesa
        </button>
      )}

      {error && <div className="error-banner">{error}</div>}
      {closedByWaiter && (
        <div className="closed-banner">🔒 Esta mesa fue cerrada por el servicio del restaurante</div>
      )}

      {uuid && connected && (
        <div className="buttons-container">
          <button
            className="btn blue"
            disabled={!canOrder}
            onClick={() => sendOrder("service")}
          >
            <FaConciergeBell size={40} />
            <span>Servicio</span>
          </button>

          <button
            className="btn green"
            disabled={!canOrder}
            onClick={() => sendOrder("bill")}
          >
            <FaFileInvoiceDollar size={40} />
            <span>Cuenta</span>
          </button>

          <button
            className="btn red"
            disabled={!canCancel}
            onClick={cancelLast}
          >
            <FaTimesCircle size={40} />
            <span>Cancelar</span>
          </button>
        </div>
      )}

            {lastAction || (
        <div className="last-action">
            <h3>Acción</h3>
            <p>Sin acciones aún</p>
        </div>
        )}


      {uuid && (
        <div className="qr-share">
          <h3>Comparte esta mesa</h3>

        <ShareQR 
            value={`${APP_URL}/join/${uuid}`}
            size={200} 
            bgColor="#ffffff"
            fgColor="#000000"
            includeMargin={true}
            />
          
    
        </div>
      )}
    </div>
  );
}

export default MainApp;
