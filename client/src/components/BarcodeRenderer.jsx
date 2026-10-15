import React from 'react';

/**
 * Lightweight Code128-B SVG Barcode generator
 * Pure JavaScript, zero external dependencies, perfect sharp lines for thermal printers.
 */
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

const encodeCode128B = (text) => {
  const safeText = (text || '000000').replace(/[^\x20-\x7E]/g, '');
  if (!safeText) return null;

  // Start B is code 104
  const codes = [104];
  let checkSum = 104;

  for (let i = 0; i < safeText.length; i++) {
    const code = safeText.charCodeAt(i) - 32;
    codes.push(code);
    checkSum += code * (i + 1);
  }

  codes.push(checkSum % 103);
  codes.push(106); // Stop code

  // Convert codes to bar pattern string (alternating black bar and white space widths)
  let pattern = '';
  for (const c of codes) {
    pattern += CODE128_PATTERNS[c] || '111111';
  }

  return pattern;
};

const BarcodeRenderer = ({ value = '', height = 28, showText = true, className = '' }) => {
  const pattern = encodeCode128B(value || 'ITEM123');

  if (!pattern) return null;

  // Generate SVG rects for black bars
  const rects = [];
  let currentX = 0;
  const barUnitWidth = 1.35; // px per unit width

  for (let i = 0; i < pattern.length; i++) {
    const width = parseInt(pattern[i], 10) * barUnitWidth;
    const isBar = i % 2 === 0;
    if (isBar) {
      rects.push(
        <rect
          key={i}
          x={currentX}
          y={0}
          width={width}
          height={height}
          fill="#000000"
        />
      );
    }
    currentX += width;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={currentX}
        height={height}
        viewBox={`0 0 ${currentX} ${height}`}
        className="max-w-full block"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {rects}
      </svg>
      {showText && (
        <span className="text-[9px] font-mono tracking-widest text-black mt-0.5 uppercase">
          {value}
        </span>
      )}
    </div>
  );
};

export default BarcodeRenderer;
