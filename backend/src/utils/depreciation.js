// File: backend/src/utils/depreciation.js
/**
 * Menghitung depresiasi garis lurus (Straight-Line Depreciation)
 * dan sisa nilai buku (current book value) sebuah aset.
 * 
 * @param {number} cost - Harga perolehan/pembelian awal
 * @param {number} salvagePercent - Persentase nilai sisa/residu (misal 5 untuk 5%)
 * @param {number} usefulYears - Masa manfaat ekonomis dalam tahun (misal 4 tahun)
 * @param {string|Date} purchaseDate - Tanggal perolehan aset
 * @returns {object} { annualDepreciation, accumulatedDepreciation, currentBookValue, salvageValue, ageYears }
 */
export function computeStraightLineDepreciation(cost, salvagePercent, usefulYears, purchaseDate) {
  const numCost = Number(cost) || 0;
  const numSalvagePercent = Number(salvagePercent) || 0;
  const numUsefulYears = Math.max(Number(usefulYears) || 1, 1);
  
  const salvageValue = numCost * (numSalvagePercent / 100);
  const annualDepreciation = (numCost - salvageValue) / numUsefulYears;
  
  const now = new Date();
  const start = new Date(purchaseDate);
  const ageYears = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
  const effectiveAge = Math.min(Math.max(ageYears, 0), numUsefulYears);
  
  const accumulated = annualDepreciation * effectiveAge;
  const currentBookValue = Math.max(numCost - accumulated, salvageValue);
  
  return {
    cost: Math.round(numCost),
    salvageValue: Math.round(salvageValue),
    annualDepreciation: Math.round(annualDepreciation),
    accumulatedDepreciation: Math.round(accumulated),
    currentBookValue: Math.round(currentBookValue),
    effectiveAgeYears: Number(effectiveAge.toFixed(2)),
    depreciationRateAnnualPercent: Number(((annualDepreciation / numCost) * 100).toFixed(2)) || 0
  };
}
