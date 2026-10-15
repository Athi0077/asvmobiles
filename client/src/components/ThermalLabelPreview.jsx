import React from 'react';
import BarcodeRenderer from './BarcodeRenderer';

/**
 * ThermalLabelPreview
 * Renders a high-fidelity thermal label matching the user's uploaded phone sticker:
 * [ TRENDING MOBILES ]
 * MODEL : VIVO X300 ,5G
 * RAM : 12GB   ROM : 256GB
 * FULL KIT: YES
 * WARRANTY: 27/12/2026
 * RATE : 58,499-/-
 */
const ThermalLabelPreview = ({
  shopTitle = 'TRENDING MOBILES',
  shopSubtitle = '',
  headerStyle = 'badge', // 'badge' | 'bold' | 'underlined' | 'none'
  fields = [],
  showBarcode = false,
  barcodeValue = '',
  widthMm = 50,
  heightMm = 40,
  isPrintMode = false,
  fontSizeScale = 'normal', // 'compact' | 'normal' | 'large'
  borderStyle = 'rounded', // 'rounded' | 'square' | 'none'
}) => {
  // Group fields into rows: full-width fields get their own row;
  // consecutive half-width fields are paired together (2 per row).
  const rows = [];
  let tempHalf = null;

  fields.forEach((field) => {
    if (field.isHalfWidth) {
      if (tempHalf) {
        rows.push([tempHalf, field]);
        tempHalf = null;
      } else {
        tempHalf = field;
      }
    } else {
      if (tempHalf) {
        rows.push([tempHalf]);
        tempHalf = null;
      }
      rows.push([field]);
    }
  });

  if (tempHalf) {
    rows.push([tempHalf]);
  }

  // Determine dynamic font sizing based on scale & label dimensions
  const getHeaderClasses = () => {
    if (fontSizeScale === 'compact') return 'text-[10px] tracking-wider py-0.5 px-2';
    if (fontSizeScale === 'large') return 'text-[13px] tracking-wider py-1 px-3';
    return 'text-[11px] tracking-wider py-0.5 px-2.5';
  };

  const getRowFontSize = () => {
    if (fontSizeScale === 'compact') return isPrintMode ? 'text-[7.5pt]' : 'text-[9px]';
    if (fontSizeScale === 'large') return isPrintMode ? 'text-[10pt]' : 'text-[12px]';
    return isPrintMode ? 'text-[8.5pt]' : 'text-[10.5px]';
  };

  const getRateFontSize = () => {
    if (fontSizeScale === 'compact') return isPrintMode ? 'text-[9pt]' : 'text-[10.5px]';
    if (fontSizeScale === 'large') return isPrintMode ? 'text-[11.5pt]' : 'text-[14px]';
    return isPrintMode ? 'text-[10pt]' : 'text-[12px]';
  };

  const borderClass = isPrintMode
    ? 'border border-transparent'
    : borderStyle === 'rounded'
    ? 'border border-gray-300 rounded-2xl shadow-sm'
    : borderStyle === 'square'
    ? 'border border-gray-300 rounded-none shadow-sm'
    : 'border-0';

  return (
    <div
      className={`label-sticker-surface bg-white text-black font-mono select-none flex flex-col justify-between overflow-hidden ${borderClass}`}
      style={{
        width: isPrintMode ? `${widthMm}mm` : '100%',
        maxWidth: isPrintMode ? `${widthMm}mm` : undefined,
        minHeight: isPrintMode ? `${heightMm}mm` : undefined,
        height: isPrintMode ? `${heightMm}mm` : 'auto',
        boxSizing: 'border-box',
        padding: isPrintMode ? '2mm 2.5mm' : '10px 12px',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        color: '#000000',
      }}
    >
      {/* Top Header / Brand Name */}
      {headerStyle !== 'none' && shopTitle && (
        <div className="text-center w-full mb-1">
          {headerStyle === 'badge' ? (
            <div 
              className="inline-block font-extrabold uppercase rounded-[4px] px-2 py-[2px] shadow-sm tracking-wider leading-tight"
              style={{
                backgroundColor: '#000000',
                color: '#ffffff',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}
            >
              <span className={getHeaderClasses()}>{shopTitle}</span>
            </div>
          ) : headerStyle === 'bold' ? (
            <div className="font-black text-gray-950 uppercase tracking-wide leading-tight border-b-2 border-black pb-0.5">
              <span className={getHeaderClasses()}>{shopTitle}</span>
            </div>
          ) : (
            <div className="font-bold text-gray-900 uppercase border-b border-dashed border-gray-400 pb-0.5">
              <span className={getHeaderClasses()}>{shopTitle}</span>
            </div>
          )}

          {shopSubtitle && (
            <p className="text-[8px] tracking-tight uppercase text-gray-700 mt-0.5 font-bold">
              {shopSubtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Dynamic Field List */}
      <div className={`space-y-[2.5px] leading-tight my-auto ${getRowFontSize()}`}>
        {rows.map((row, rowIdx) => {
          if (row.length === 2) {
            // Two fields side-by-side (e.g. RAM : 12GB   ROM : 256GB)
            const [f1, f2] = row;
            return (
              <div key={rowIdx} className="flex justify-between items-center gap-1 font-bold">
                {/* Field 1 */}
                <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                  <span className="font-extrabold tracking-tight uppercase">{f1.label}:</span>
                  <span className="font-medium truncate">{f1.value || '—'}</span>
                </div>
                {/* Field 2 */}
                <div className="flex items-center gap-1 min-w-0 flex-1 justify-end truncate">
                  <span className="font-extrabold tracking-tight uppercase">{f2.label}:</span>
                  <span className="font-medium truncate">{f2.value || '—'}</span>
                </div>
              </div>
            );
          }

          // Single full-width field
          const f = row[0];
          const isHighlighted = f.isHighlighted || f.label.toUpperCase().includes('RATE') || f.label.toUpperCase().includes('PRICE');

          if (isHighlighted) {
            return (
              <div
                key={rowIdx}
                className={`flex items-center justify-between font-black border-b border-black pt-0.5 pb-[1px] ${getRateFontSize()}`}
              >
                <span className="tracking-tight uppercase">{f.label} :</span>
                <span className="font-black tracking-wide text-right">
                  {f.value || '—'}
                </span>
              </div>
            );
          }

          return (
            <div key={rowIdx} className="flex items-center gap-1.5 font-bold">
              <span className="font-extrabold tracking-tight uppercase whitespace-nowrap">
                {f.label}:
              </span>
              <span className="font-medium truncate tracking-tight">
                {f.value || '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Optional Barcode */}
      {showBarcode && barcodeValue && (
        <div className="mt-1 pt-0.5 border-t border-dashed border-gray-400 flex justify-center">
          <BarcodeRenderer
            value={barcodeValue}
            height={isPrintMode ? 22 : 24}
            showText={true}
          />
        </div>
      )}
    </div>
  );
};

export default ThermalLabelPreview;
