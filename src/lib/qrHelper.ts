/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Genera un código QR en formato Data URL de forma segura y tolerante a fallos.
 * Resuelve problemas de interopabilidad CommonJS / ESM con la librería `qrcode` en entornos Vite de forma dinámica.
 */
export async function generateSafeQR(
  text: string,
  width: number = 300,
  darkColor: string = "#000000",
  lightColor: string = "#ffffff"
): Promise<string> {
  try {
    if (!text) {
      return "";
    }

    // Importar dinámicamente qrcode para evitar fallos de carga estática en el bundle principal
    const qrModule = await import("qrcode");
    let qrLib: any = qrModule;

    if (!qrLib) {
      console.warn("La librería QRCode no está definida.");
      return "";
    }

    // Resolver interop de módulo por defecto (ESM / CommonJS)
    if (qrLib.default) {
      qrLib = qrLib.default;
    }

    // Caso estándar: toDataURL existe en el objeto resuelto
    if (typeof qrLib.toDataURL === "function") {
      return await qrLib.toDataURL(text, {
        width,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor
        }
      });
    }

    // Caso alternativo: qrLib en sí es la función
    if (typeof qrLib === "function") {
      return await (qrLib as any).toDataURL(text, {
        width,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor
        }
      });
    }

    console.warn("La API toDataURL no pudo ser encontrada en la librería QRCode.");
    return "";
  } catch (error) {
    console.error("Error capturado al generar el código QR localmente:", error);
    return "";
  }
}
