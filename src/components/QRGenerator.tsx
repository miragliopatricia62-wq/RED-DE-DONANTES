/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { generateSafeQR } from "../lib/qrHelper";
import { 
  QrCode, 
  Download, 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  Heart, 
  CornerDownRight,
  Info
} from "lucide-react";

interface QRGeneratorProps {
  appUrl?: string;
  onClose?: () => void;
}

export default function QRGenerator({ appUrl, onClose }: QRGeneratorProps) {
  // Autodetectar la URL de la app en ejecución de manera dinámica e inteligente
  const defaultUrl = appUrl || (typeof window !== "undefined" ? window.location.href : "https://red-donantes.net");
  const [targetUrl, setTargetUrl] = useState(defaultUrl);
  const [qrSize, setQrSize] = useState<number>(300);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [medicalCenter, setMedicalCenter] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrPrintDataUrl, setQrPrintDataUrl] = useState<string>("");

  // Ajustar la URL cuando cambie la prop
  useEffect(() => {
    if (!appUrl && typeof window !== "undefined") {
      setTargetUrl(window.location.href);
    }
  }, [appUrl]);

  // Generar el código QR local de forma 100% offline (sin llamadas CORS o 403 externas)
  useEffect(() => {
    const generateQRCodes = async () => {
      // Generar QR principal de pantalla
      const dataUrl = await generateSafeQR(targetUrl, qrSize, "#991b1b");
      setQrDataUrl(dataUrl);

      // Generar QR de alta calidad para el afiche impreso
      const printDataUrl = await generateSafeQR(targetUrl, 380, "#000000");
      setQrPrintDataUrl(printDataUrl);
    };

    generateQRCodes();
  }, [targetUrl, qrSize]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar enlace:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Red de Donantes Conectados",
          text: "¡Únete a la Red de Donantes Conectados de Sangre Altruista de forma 100% segura y cívica!",
          url: targetUrl,
        });
      } catch (err) {
        console.log("No se completó la acción de compartir", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `QR_Red_Donantes_${qrSize}x${qrSize}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al descargar QR:", err);
      alert("Hubo un problema descargando el código.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintFlyer = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-xl p-6 space-y-6 max-w-2xl mx-auto animate-fade-in print:hidden">
      
      {/* CABECERA */}
      <div className="flex justify-between items-start border-b border-rose-50 pb-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-rose-600" />
            <span>Generador de Código QR Oficial</span>
          </h3>
          <p className="text-xs text-slate-500">
            Crea el código QR dinámico de tu nodo y comparte el acceso móvil de forma 150% offline y segura.
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* PANEL DE CONFIGURACIÓN (LADO IZQUIERDO) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* INPUT URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Enlace de Destino (URL)</label>
            <div className="flex gap-2">
              <input 
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="flex-grow border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 text-slate-600"
                placeholder="https://"
              />
              <button
                onClick={handleCopyLink}
                title="Copiar enlace"
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 flex items-center justify-center cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              * Por defecto hemos capturado la dirección actual donde está alojada la aplicación móvil.
            </p>
          </div>

          {/* AJUSTES ADICIONALES */}
          <div className="grid grid-cols-2 gap-3 pb-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tamaño de imagen</label>
              <select
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none text-slate-600 bg-white"
              >
                <option value={200}>Pequeño (200x200)</option>
                <option value={300}>Mediano (300x300)</option>
                <option value={400}>Grande (400x400)</option>
                <option value={500}>Alta Calidad (500x500)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Centro Policlínico / Hospital</label>
              <input 
                type="text"
                value={medicalCenter}
                onChange={(e) => setMedicalCenter(e.target.value)}
                placeholder="Ej. Hospital Central"
                className="w-full border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none text-slate-600"
              />
            </div>
          </div>

          {/* INFORMACIÓN DE USO */}
          <div className="bg-rose-50/40 rounded-xl p-3 border border-rose-100/50 flex gap-2 text-rose-900 text-xs">
            <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">¿Cómo utilizar este QR?</span>
              <p className="text-slate-650 leading-normal text-[11px]">
                Imprime o comparte este enlace para colocarlo en la entrada del banco de sangre, farmacias o folletos municipales. Los vecinos solo deberán enfocar el QR con la cámara de su celular para ingresar al registro de inmediato.
              </p>
            </div>
          </div>

        </div>

        {/* CÓDIGO QR PRE-VISUALIZACIÓN (LADO DERECHO) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-100 p-4">
          <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200/80 inline-block min-h-[160px] min-w-[160px] flex items-center justify-center">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Código QR de la App" 
                className="w-[140px] h-[140px] mx-auto object-contain"
              />
            ) : (
              <div className="text-xs text-rose-500 animate-pulse font-medium">Generando QR...</div>
            )}
          </div>
          <div className="space-y-1.5 w-full">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Ficha Generada</p>
            
            {/* ACCIONES DEL QR */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadQR}
                disabled={isDownloading || !qrDataUrl}
                className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? "Descargando..." : "Descargar PNG"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShare}
                  className="py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Compartir</span>
                </button>
                <button
                  onClick={handlePrintFlyer}
                  className="py-1.5 px-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* VISTA PREVIO DEL AFICHE ANTES DE IMPRIMIR */}
      <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Previsualización del Afiche de Cartelera</span>
          </span>
          <button 
            onClick={handlePrintFlyer}
            className="text-rose-600 hover:text-rose-700 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
          >
            <span>Imprimir en A4 / Carta</span>
            <CornerDownRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Al presionar "Imprimir", el navegador ocultará toda esta página y enviará a la impresora solo un cartel institucional limpio diseñado especialmente para bancos de sangre municipales.
        </p>
      </div>

      {/* AFICHE DE IMPRESIÓN EXCLUSIVO (OCULTO EN PANTALLA, ACTIVO EN IMPRESIÓN) */}
      <div className="hidden print:block print-container text-center space-y-8 bg-white text-black">
        {/* Cabecera */}
        <div className="border-b-4 border-rose-600 pb-6">
          <div className="w-24 h-24 bg-rose-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4">
            <Heart className="w-14 h-14 fill-white text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 uppercase">
            Red de Donantes Conectados
          </h1>
          <p className="text-sm font-semibold tracking-widest text-slate-500 uppercase mt-2">
            Registro Altruista y Voluntario de Sangre Comunitario
          </p>
          {medicalCenter && (
            <div className="mt-4 px-6 py-2 bg-rose-50 border border-rose-200 text-rose-800 text-lg font-black rounded-xl inline-block uppercase">
              Centro Asociado: {medicalCenter}
            </div>
          )}
        </div>

        {/* Mensaje de Invitación */}
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-black text-slate-800">
            ¿Quieres ayudar a salvar vidas en tu comunidad?
          </h2>
          <p className="text-slate-650 text-sm leading-relaxed">
            Escanea el código QR de abajo con la cámara de tu celular para ingresar inmediatamente al portal móvil de nuestra red. Podrás registrarte de manera 100% segura, anónima y voluntaria para cuando nuestro centro médico necesite donaciones directas.
          </p>
        </div>

        {/* QR CODE GIGANTE PARA ESCANEAR */}
        <div className="py-6 flex flex-col items-center">
          <div className="border-[12px] border-slate-100 rounded-3xl p-6 shadow-xs inline-block bg-white">
            {qrPrintDataUrl ? (
              <img 
                src={qrPrintDataUrl}
                alt="Código QR Institucional"
                className="w-[280px] h-[280px] object-contain"
              />
            ) : (
              <div className="text-sm text-slate-500">Cargando código QR offline...</div>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mt-4 block">
            Código QR de Ingreso Libre y Directo
          </span>
        </div>

        {/* Pasos / Instrucciones muy sencillas */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-left py-4 border-t border-b border-slate-100">
          <div className="space-y-1">
            <span className="font-extrabold text-lg text-rose-600 block">Paso 1</span>
            <span className="font-bold text-slate-800 text-xs block">Escanea el QR</span>
            <p className="text-[10px] text-slate-500">Apunta con la cámara de tu teléfono para abrir el enlace directo.</p>
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-lg text-rose-600 block">Paso 2</span>
            <span className="font-bold text-slate-800 text-xs block">Verifica Aptitud</span>
            <p className="text-[10px] text-slate-500">Responde el test prevencional de 1 minuto sobre tu salud actual.</p>
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-lg text-rose-600 block">Paso 3</span>
            <span className="font-bold text-slate-800 text-xs block">Unirte a la Red</span>
            <p className="text-[10px] text-slate-500">Inscríbete libremente. Tu teléfono y datos se cifran con absoluta reserva.</p>
          </div>
        </div>

        {/* Notas y pie de página de salud pública */}
        <div className="pt-4 space-y-1 text-[11px] text-slate-400">
          <p className="font-bold">✓ Cumplimiento con Leyes Sanitarias y Derecho al Olvido.</p>
          <p>La Red de Donantes Conectados es un proyecto cívico sin intermediarios comerciales.</p>
        </div>
      </div>

    </div>
  );
}
