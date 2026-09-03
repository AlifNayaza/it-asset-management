// File: backend/src/utils/qrGenerator.js
import QRCode from 'qrcode';

/**
 * Generate QR code as Base64 Data URL
 * @param {string} text - The content encoded into QR (e.g. asset_tag or JSON)
 * @returns {Promise<string>} Base64 Data URL (image/png)
 */
export async function generateQRCodeDataUrl(text) {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR Code:', err);
    throw err;
  }
}

/**
 * Generate QR code for label printing including visual badge format
 * @param {object} asset
 */
export async function generateAssetLabelData(asset) {
  const qrData = asset.asset_tag;
  const qrImage = await generateQRCodeDataUrl(qrData);

  return {
    assetTag: asset.asset_tag,
    serialNumber: asset.serial_number,
    modelName: asset.model_name,
    categoryName: asset.category_name || asset.category?.name || 'IT Asset',
    qrImage,
    generatedAt: new Date().toISOString()
  };
}
