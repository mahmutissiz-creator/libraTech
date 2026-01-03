import React from 'react';
import QRCode from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  label: string;
  subLabel?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, label, subLabel, size = 128 }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm break-inside-avoid">
      <QRCode value={value} size={size} level="H" renderAs="svg" />
      <div className="mt-2 text-center">
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
      </div>
    </div>
  );
};