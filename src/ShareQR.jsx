import { useEffect, useState } from "react";
import QRCode from "qrcode";

function ShareQR({ value, size = 200 }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(
        value,
        { width: size, margin: 1, color: { dark: "#000", light: "#fff" } },
        (err, url) => {
          if (!err) setSrc(url);
        }
      );
    }
  }, [value, size]);

  if (!value) return null;

  return <img src={src} alt="QR Code" style={{ width: size, height: size }} />;
}

export default ShareQR;
