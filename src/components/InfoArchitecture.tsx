/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Network, 
  ArrowRight, 
  ShieldCheck, 
  QrCode, 
  UserCheck, 
  MapPin, 
  Lock, 
  FileText,
  Printer
} from "lucide-react";

export default function InfoArchitecture() {
  const [activeTab, setActiveTab] = useState<"architecture" | "flow" | "legal">("architecture");

  const printLegalDraft = () => {
    const printContent = document.getElementById("legal-draft-content")?.innerHTML;
    const originalContent = document.body.innerHTML;
    if (printContent) {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Borrador Legal - Red de Donantes Conectados</title>
              <style>
                body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                h1 { color: #b91c1c; border-bottom: 2px solid #b91c1c; padding-bottom: 10px; }
                h3 { margin-top: 20px; color: #1e293b; }
                p { margin-bottom: 15px; text-align: justify; }
                .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-xl p-6 lg:p-8 space-y-6">
      {/* Selector de Pestañas de Documentación */}
      <div className="flex flex-col sm:flex-row gap-3 border-b border-rose-100 pb-4">
        <button
          onClick={() => setActiveTab("architecture")}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            activeTab === "architecture"
              ? "bg-rose-500 text-white shadow-md shadow-rose-100"
              : "text-slate-600 hover:bg-rose-50/50 hover:text-rose-500"
          }`}
        >
          <Network className="w-4 h-4" />
          <span>1. Arquitectura de Información</span>
        </button>
        <button
          onClick={() => setActiveTab("flow")}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            activeTab === "flow"
              ? "bg-rose-500 text-white shadow-md shadow-rose-100"
              : "text-slate-600 hover:bg-rose-50/50 hover:text-rose-500"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>2. Flujo del Usuario (QR)</span>
        </button>
        <button
          onClick={() => setActiveTab("legal")}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            activeTab === "legal"
              ? "bg-rose-500 text-white shadow-md shadow-rose-100"
              : "text-slate-600 hover:bg-rose-50/50 hover:text-rose-500"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Consentimiento Legal y RGPD</span>
        </button>
      </div>

      {/* Contenido Dinámico */}
      {activeTab === "architecture" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Definición de Pantallas y Nodos</h3>
            <p className="text-sm text-slate-500 mt-1">Estructura limpia para una carga instantánea y de baja fricción al escanear desde un celular.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pantalla 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Pantalla 1</span>
                <h4 className="font-bold text-slate-800 mt-3 text-base">Inicio / Bienvenida</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Carga inmediata. Presentación empática de la campaña de donación. Accesos dinámicos en un solo clic: "Quiero Ser Donante" o "Necesito Encontrar Sangre".
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">Fricción:</span> 0% (Sin login previo requerido para navegar).
              </div>
            </div>

            {/* Pantalla 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Pantalla 2</span>
                <h4 className="font-bold text-slate-800 mt-3 text-base">Checklist & Registro</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Filtro inteligente de autoevaluación médica (edad, peso, tatuajes o cirugías menores). Formulario de admisión territorial con consentimiento legal explícito.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">Fricción:</span> Moderada (Validado antes de registrar).
              </div>
            </div>

            {/* Pantalla 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Pantalla 3</span>
                <h4 className="font-bold text-slate-800 mt-3 text-base">Buscador por Nodos</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Búsqueda directa por grupo, factor y localidad. Algoritmo de cercanía jerárquica (Ciudad → Provincia → País) para escalado internacional. Ventana de contacto protegida.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">Privacidad:</span> Máxima (Datos ocultos por defecto).
              </div>
            </div>

            {/* Pantalla 4 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Pantalla 4</span>
                <h4 className="font-bold text-slate-800 mt-3 text-base">Mi Perfil / Estado</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Gestión personal del donante. Permite actualizar la última fecha de donación o pausar la cartilla pública con un interruptor para resguardo de paz mental.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">Autonomía:</span> 100% (Derecho al olvido inmediato).
              </div>
            </div>
          </div>

          {/* Panel Escala Territorial */}
          <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-rose-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Nodos Jerárquicos para Escalabilidad Global (Multi-País)</span>
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              La base de datos está diseñada de manera modular en 3 niveles territoriales independientes. Esto permite que el motor de búsqueda indexe y amplíe el rango de búsqueda en un instante:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3 rounded-lg border border-rose-100/60">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Nodo Local (Filtro 1)</span>
                <p className="font-bold text-slate-800 mt-1">Ciudad / Localidad</p>
                <p className="text-xs text-slate-500 mt-1">Filtra donantes a menos de 10-30 km para máxima inmediatez.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-rose-100/60">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Nodo Regional (Filtro 2)</span>
                <p className="font-bold text-slate-800 mt-1">Provincia o Estado</p>
                <p className="text-xs text-slate-500 mt-1">Sugiere localidades aledañas dentro del mismo estado federado.</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-rose-100/60">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Nodo Nacional (Filtro 3)</span>
                <p className="font-bold text-slate-800 mt-1">País / Frontera</p>
                <p className="text-xs text-slate-500 mt-1">Preparado para coordinar esfuerzos con aeromedicina o casos excepcionales.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "flow" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-bold text-slate-800">El Camino del Usuario Desde la Fricción Cero</h3>
            <p className="text-sm text-slate-500 mt-1">Cómo la sencillez y la rapidez maximizan las conversiones de donantes calificados en situaciones críticas.</p>
          </div>

          <div className="relative border-l-2 border-dashed border-rose-200 ml-4 pl-6 space-y-6">
            {/* Paso 1 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-rose-50">1</span>
              <div>
                <h4 className="font-bold text-slate-800">Escaneo del Código QR Público</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Ubicado en folletos, hospitales, plazas cívicas o redes sociales. El navegador del celular del usuario se redirige sin fricción, de inmediato y sin necesidad de instalar apps pesadas en la tienda.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-rose-50">2</span>
              <div>
                <h4 className="font-bold text-slate-800">Autocomprobación Médica Inteligente</h4>
                <p className="text-xs text-slate-600 mt-1">
                  El sistema le realiza de forma interactiva 6 preguntas clave de autoexclusión. Si califica, se le invita a registrarse. Si está inhabilitado, se le agradece y se le brinda información constructiva de salud.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-rose-50">3</span>
              <div>
                <h4 className="font-bold text-slate-800">Registro Con Consentimiento Activo</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Completa datos clave, con especial hincapié en el nodo territorial (País, Provincia, Ciudad). Lee y firma los términos marcando qué datos serán expuestos en la cartilla comunitaria para resguardar su integridad privada.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-rose-50">4</span>
              <div>
                <h4 className="font-bold text-slate-800">Indexación en la Cartilla de Búsqueda</h4>
                <p className="text-xs text-slate-600 mt-1">
                  El algoritmo calcula automáticamente la disponibilidad del donante (Período de ventana según género: 3 o 4 meses). Solo los donantes efectivamente aptos y en estado "Disponible" figurarán en las listas activas.
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-rose-50">5</span>
              <div>
                <h4 className="font-bold text-slate-800">Búsqueda Crítica y Auditoría Anti-Abuso</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Cualquier ciudadano que busque donantes puede filtrar por factor e interactuar. Al presionar "Contactar Donante", se le exige una declaración bajo juramento de urgencia. Se genera un registro inmutable (Logger de Auditoría) en Firestore y se desbloquea el canal para canalizar la llamada privada.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "legal" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Borrador de Consentimiento Legal</h3>
              <p className="text-sm text-slate-500 mt-1">Cumplimiento preventivo del RGPD y de las normativas de protección de datos sanitarios.</p>
            </div>
            <button
              onClick={printLegalDraft}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Borrador</span>
            </button>
          </div>

          <div 
            id="legal-draft-content" 
            className="p-5 rounded-xl bg-slate-50 border border-slate-200 font-serif text-xs md:text-sm text-slate-700 space-y-4 max-h-[350px] overflow-y-auto leading-relaxed shadow-inner"
          >
            <h1 className="text-base font-bold text-center text-rose-800 uppercase tracking-wide">
              DOCUMENTO DE CONSENTIMIENTO INFORMADO Y POLÍTICA DE TRATAMIENTO DE DATOS SENSIBLES
            </h1>
            <p className="text-center font-sans font-bold text-[10px] text-slate-500">
              Versión 1.2 — Red de Donantes Conectados (Uso Cívico y Altruista)
            </p>

            <h3 className="font-sans font-bold text-slate-800 mt-3 text-xs uppercase">1. IDENTIDAD DE LA RED Y ALCANCE</h3>
            <p>
              La **Red de Donantes Conectados** es una iniciativa de coordinación cívica y voluntaria destinada a agilizar el nexo de urgencia entre personas necesitadas del insumo biológico sangre y donantes altruistas habilitados. Al registrarse, el firmante declara actuar libre de todo tipo de remuneración económica, coerción o fines comerciales.
            </p>

            <h3 className="font-sans font-bold text-slate-800 mt-3 text-xs uppercase">2. PRINCIPIO DE MINIMIZACIÓN DE DATOS (RGPD / LEY DE PROTECCIÓN)</h3>
            <p>
              En cumplimiento estricto de las reglamentaciones de protección de datos personales de salud (Ley 25.326 de Protección de Datos Personales, RGPD de la UE y normativas de sanidad locales), nuestra red opera bajo el criterio de minimización severa:
            </p>
            <ul className="list-disc pl-5 space-y-1 my-2">
              <li>
                <strong>Nivel Público (Minimizado):</strong> Serán expuestos solo el Alias del donante, su ubicación general (Localidad/Provincia/País) y la fecha de su última donación para comprobar de forma pública que cumple con la habilitación temporal reglamentaria de reposo.
              </li>
              <li>
                <strong>Nivel Privado (Encapsulado):</strong> El teléfono de contacto y el Documento de Identidad (DNI) se encuentran en bases de datos protegidas y encapsuladas. Solo se revelarán temporalmente previa suscripción electrónica de una "Declaración Jurada de Emergencia Sanitaria" por parte del buscador.
              </li>
            </ul>

            <h3 className="font-sans font-bold text-slate-800 mt-3 text-xs uppercase">3. DECLARACIÓN DE HABILITACIÓN MÉDICA DEL DONANTE</h3>
            <p>
              El donante declara bajo juramento estar en perfectas condiciones de salud generales y haber respondido honestamente el checklist interactivo de filtro. El sistema calculará el "Período de ventana reglamentario" (90 días mínimos para donantes masculinos y 120 días mínimos para donantes femeninos) para figurar con estado "Habilitado". El donante asume la obligación ética de actualizar su ficha de manera regular.
            </p>

            <h3 className="font-sans font-bold text-slate-800 mt-3 text-xs uppercase">4. AUDITORÍA INMUTABLE Y PREVENCIÓN DE ACOSO</h3>
            <p>
              La Red se reserva el derecho de registrar en un log de auditoría inmutable en la nube todas las solicitudes de contacto realizadas, almacenando el nombre del solicitante, DNI del solicitante, la institución médica receptora y el motivo de urgencia, asociados al ID del donante expuesto. El uso indebido de los canales de llamada para venta de sangre, spam de marketing o acoso será denunciado de inmediato a las fiscalías especializadas en cibercrimen y la baja del infractor será irrevocable.
            </p>

            <h3 className="font-sans font-bold text-slate-800 mt-3 text-xs uppercase">5. DERECHO DE ACCESO, RECTIFICACIÓN Y SUPRESIÓN ("DERECHO AL OLVIDO")</h3>
            <p>
              El donante conserva la propiedad irrestricta de su perfil. Desde el panel interior de configuración podrá en cualquier minuto:
            </p>
            <ol className="list-decimal pl-5 space-y-1 my-2">
              <li>Pausar la cartilla temporalmente de forma instantánea desactivando el selector de "Disponibilidad".</li>
              <li>Eliminar definitivamente todas sus claves, teléfonos y perfiles de los registros (Derecho de revocación absoluta del consentimiento).</li>
            </ol>

            <div className="pt-4 border-t border-slate-200 mt-4 text-[11px] text-slate-500 italic text-center">
              Al tildar el casillero de "Acepto los términos y condiciones" durante su registro, el usuario manifiesta que comprende estas cláusulas y autoriza de forma expresa, libre y revocable el tratamiento mínimo aquí detallado.
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
            <Lock className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>
              Este texto cumple con el estándar de consentimiento informado necesario en el flujo que genera la aplicación QR de salud cívica.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
