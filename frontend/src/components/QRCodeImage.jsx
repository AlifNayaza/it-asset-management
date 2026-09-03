// File: frontend/src/components/QRCodeImage.jsx
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeImage({ value, size = 120, className = '' }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2, // High DPI for crisp printing
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error('QR Generate Error:', err);
      });
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 animate-pulse rounded flex items-center justify-center text-[10px] text-slate-400 font-mono ${className}`}
      >
        QR
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={value}
      style={{ width: size, height: size }}
      className={`object-contain ${className}`}
    />
  );
}
