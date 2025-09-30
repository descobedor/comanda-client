import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUuid } from "./UuidContext";

function JoinPage() {
  const { uuid } = useParams();
  const { setUuid } = useUuid();
  const navigate = useNavigate();

  useEffect(() => {
    if (uuid) {
      const cleanId = uuid.split("/").pop(); // ✅ limpiar siempre
      setUuid(cleanId);
      navigate("/"); // volver al main
    }
  }, [uuid, setUuid, navigate]);

  return <p>Conectando a la mesa {uuid}...</p>;
}

export default JoinPage;
