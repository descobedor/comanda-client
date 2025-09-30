import { createContext, useContext, useState, useEffect } from "react";

const UuidContext = createContext();

export const UuidProvider = ({ children }) => {
  const [uuid, setUuidState] = useState(null);

  // Al montar, cargar uuid desde localStorage si existe
  useEffect(() => {
    const saved = localStorage.getItem("uuid");
    if (saved) setUuidState(saved);
  }, []);

  // Función para setear y guardar/eliminar en localStorage
  const setUuid = (val) => {
    setUuidState(val);
    if (val) {
      localStorage.setItem("uuid", val);
    } else {
      localStorage.removeItem("uuid");
    }
  };

  return (
    <UuidContext.Provider value={{ uuid, setUuid }}>
      {children}
    </UuidContext.Provider>
  );
};

export const useUuid = () => useContext(UuidContext);
