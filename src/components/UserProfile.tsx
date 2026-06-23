/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, 
  Settings, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  XOctagon, 
  RefreshCw,
  QrCode,
  FileText
} from "lucide-react";
import { DonorProfile, ContactRequestLog } from "../types";
import { checkDonorAvailability } from "../lib/firebase";

interface UserProfileProps {
  donorProfile: DonorProfile | null;
  onUpdateDonationDate: (date: string) => void;
  onToggleAvailability: (isAvailable: boolean) => void;
  unRegister: () => void;
  contactLogs: ContactRequestLog[];
}

export default function UserProfile({ 
  donorProfile, 
  onUpdateDonationDate, 
  onToggleAvailability, 
  unRegister,
  contactLogs 
}: UserProfileProps) {
  const [newDonationDate, setNewDonationDate] = useState(donorProfile?.lastDonationDate || "2026-06-01");
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);

  if (!donorProfile) {
    return (
      <div className="bg-white rounded-2xl border border-rose-100 p-8 shadow-lg text-center space-y-4">
        <User className="w-12 h-12 text-rose-300 mx-auto" />
        <div className="max-w-md mx-auto space-y-2">
          <h4 className="font-bold text-slate-800 text-lg">Aún no estás registrado como donante</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Para poder gestionar tu disponibilidad, actualizar tus fechas de donación o ver quién solicita tu contacto, primero debes completar el registro altruista.
          </p>
        </div>
      </div>
    );
  }

  const availability = checkDonorAvailability(donorProfile);
  // Buscar solicitudes de contacto dirigidas a este donante específico
  const filteredMyLogs = contactLogs.filter((log) => log.donorId === donorProfile.id);

  const handleDateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDonationDate(newDonationDate);
    setIsUpdatingDate(false);
  };

  const handleUnregisterConfirm = () => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que deseas revocar tu consentimiento, dándote de baja de la Red de Donantes Conectados? Esto eliminará todos tus datos personales de inmediato en cumplimiento con la Ley de Tratamiento de Datos Sanitarios."
    );
    if (isConfirmed) {
      unRegister();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA 1: FICHA ACTUAL Y ESTADO DE DISPONIBILIDAD */}
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-md flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-rose-50 pb-3">
              <User className="w-5 h-5 text-rose-500" />
              <span>Ficha del Donante</span>
            </h3>

            {/* Identidad del voluntario */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="text-sm font-black bg-rose-500 text-white rounded-lg px-2 py-1">
                  {donorProfile.bloodGroup}{donorProfile.bloodFactor}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base leading-tight">{donorProfile.fullName}</h4>
                  <p className="text-xs text-slate-500">Alias: {donorProfile.alias}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">DNI: {donorProfile.dni} | Correo: {donorProfile.email}</p>
              <p className="text-xs text-slate-500">Ubicación: {donorProfile.city}, {donorProfile.state}, {donorProfile.country}</p>
            </div>

            {/* Estado de habilitación actual */}
            <div className="border border-rose-50 rounded-xl p-3 bg-rose-50/20 space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Estado Médico</span>
              {availability.isAvailable ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Habilitado / Disponible</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>En período de ventana / espera</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Debes esperar {availability.daysRemaining} días más antes de postularte como donante activo en el buscador, para resguardo de tu propio sistema hematológico.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Toggle de resguardo mental */}
          <div className="pt-4 border-t border-rose-50/50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm">Disponibilidad en Cartilla</h5>
                <p className="text-[10px] text-slate-500">Apaga este switch para pausar temporalmente toda llamada sin darte de baja.</p>
              </div>
              <button
                type="button"
                onClick={() => onToggleAvailability(!donorProfile.isAvailableOverride)}
                className="cursor-pointer transition-transform duration-200 active:scale-95"
              >
                {donorProfile.isAvailableOverride ? (
                  <ToggleRight className="w-12 h-12 text-rose-600" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: GESTIÓN DE ÚLTIMA FECHA DE DONACIÓN O BAJA */}
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-md space-y-5">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-rose-50 pb-3">
            <Calendar className="w-5 h-5 text-rose-500" />
            <span>Fechas y Derecho al Olvido</span>
          </h3>

          {!isUpdatingDate ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 space-y-1">
                <span className="text-slate-400">Última fecha informada:</span>
                <p className="font-bold text-slate-800 text-sm">
                  {donorProfile.lastDonationDate === "2020-01-01" ? "Ninguna registrada (Primera vez)" : donorProfile.lastDonationDate}
                </p>
              </div>
              <button
                onClick={() => setIsUpdatingDate(true)}
                className="w-full text-center px-4 py-2 border border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Actualizar última fecha de donación
              </button>
            </div>
          ) : (
            <form onSubmit={handleDateUpdate} className="space-y-3 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nueva Fecha de Última Donación</label>
                <input
                  type="date"
                  required
                  value={newDonationDate}
                  onChange={(e) => setNewDonationDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdatingDate(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 w-3" />
                  <span>Actualizar</span>
                </button>
              </div>
            </form>
          )}

          {/* Advertencia derecho al olvido */}
          <div className="pt-4 border-t border-rose-50/50 space-y-3">
            <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1 text-slate-700">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Revocar Consentimiento</span>
            </h5>
            <p className="text-[10px] text-slate-500 leading-normal">
              De acuerdo con las normativas internacionales de protección de datos sanitarios, tienes el derecho absoluto de revocación de tu consentimiento en cualquier momento. Al darte de baja, todos tus datos públicos y privados serán eliminados inalterablemente de nuestros servidores de base de datos.
            </p>
            <button
              onClick={handleUnregisterConfirm}
              className="w-full text-center px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Dar de baja mi perfil permanentemente
            </button>
          </div>
        </div>

        {/* COLUMNA 3: TRANSPARENCIA Y BITÁCORA DE AUDITORÍA */}
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-md space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2 border-b border-rose-50 pb-3">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
            <span>Bitácora de Solicitudes</span>
          </h3>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Quién accedió a tus datos ({filteredMyLogs.length})
            </span>

            <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1 divide-y divide-rose-50/50">
              {filteredMyLogs.length > 0 ? (
                filteredMyLogs.map((log) => (
                  <div key={log.id} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                      <span>{log.requesterName}</span>
                      <span className="text-rose-600">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-600 space-y-1">
                      <p><strong>Paciente:</strong> {log.patientName}</p>
                      <p><strong>Clínica:</strong> {log.hospital}</p>
                      <p className="italic text-slate-400"><strong>Motivo:</strong> "{log.urgencyReason}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No se registran solicitudes de revelación de tus datos privados. Tu privacidad está completamente a salvo.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
