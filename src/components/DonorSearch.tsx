/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  Filter, 
  Send, 
  X,
  FileSpreadsheet
} from "lucide-react";
import { DonorProfile, BloodGroup, BloodFactor, ContactRequestLog } from "../types";
import { checkDonorAvailability, dbService } from "../lib/firebase";

interface DonorSearchProps {
  donors: DonorProfile[];
  onContactCreated: (log: ContactRequestLog) => void;
  currentUserUid?: string;
}

export default function DonorSearch({ donors, onContactCreated, currentUserUid }: DonorSearchProps) {
  // Filtros de búsqueda
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | "">("");
  const [selectedFactor, setSelectedFactor] = useState<BloodFactor | "">("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Control del diálogo/modal de emergencia
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [requesterName, setRequesterName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [hospital, setHospital] = useState("");
  const [urgencyReason, setUrgencyReason] = useState("");
  const [underOath, setUnderOath] = useState(false);

  // Almacenar el donante que se ha desbloqueado correctamente tras la firma
  const [unlockedDonorId, setUnlockedDonorId] = useState<string | null>(null);
  const [unlockedPhone, setUnlockedPhone] = useState<string>("");
  const [unlockedFullName, setUnlockedFullName] = useState<string>("");

  // Obtener países, estados y ciudades únicos para rellenar los autocompletados
  const uniqueCountries = Array.from(new Set(donors.map((d) => d.country)));
  const uniqueStates = Array.from(new Set(donors.map((d) => d.state)));
  const uniqueCities = Array.from(new Set(donors.map((d) => d.city)));

  // Filtrado lógico
  const filteredDonors = donors.filter((donor) => {
    // 1. Filtro por grupo
    if (selectedGroup && donor.bloodGroup !== selectedGroup) return false;
    // 2. Filtro por factor
    if (selectedFactor && donor.bloodFactor !== selectedFactor) return false;
    // 3. Filtro por país (Nodo nacional)
    if (selectedCountry && donor.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;
    // 4. Filtro por provincia (Nodo regional)
    if (selectedState && donor.state.toLowerCase() !== selectedState.toLowerCase()) return false;
    // 5. Filtro por ciudad (Nodo local)
    if (selectedCity && donor.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    // 6. Texto libre general (Acepta alias, provincia, ciudad)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAlias = donor.alias.toLowerCase().includes(q);
      const matchCity = donor.city.toLowerCase().includes(q);
      const matchState = donor.state.toLowerCase().includes(q);
      return matchAlias || matchCity || matchState;
    }
    return true;
  });

  const openContactFlow = (donor: DonorProfile) => {
    setSelectedDonor(donor);
    setRequesterName("");
    setPatientName("");
    setHospital("");
    setUrgencyReason("");
    setUnderOath(false);
    setIsEmergencyModalOpen(true);
  };

  const handleApplyContactRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor) return;

    if (!underOath) {
      alert("Debes tildar la casilla de declaración jurada bajo fe de verdad.");
      return;
    }

    if (!requesterName || !patientName || !hospital || !urgencyReason) {
      alert("Por favor completa todos los campos requeridos para auditar esta solicitud.");
      return;
    }

    // Registrar auditoría real o mock
    const log = await dbService.logContactRequest({
      userId: currentUserUid || "mock-user-current",
      requesterName,
      patientName,
      hospital,
      urgencyReason,
      donorId: selectedDonor.id,
      donorAlias: selectedDonor.alias
    });

    onContactCreated(log);

    // Revelar los datos confidenciales
    setUnlockedDonorId(selectedDonor.id);
    setUnlockedPhone(selectedDonor.phone);
    setUnlockedFullName(selectedDonor.fullName);
    setIsEmergencyModalOpen(false);
  };

  const clearFilters = () => {
    setSelectedGroup("");
    setSelectedFactor("");
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN FILTROS INTEGRADOS */}
      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-rose-500" />
              <span>Directorio de Donantes de Sangre</span>
            </h3>
            <p className="text-xs text-slate-500">Filtrado inteligente por grupo, factor y capas territoriales sanitarias.</p>
          </div>
          {(selectedGroup || selectedFactor || selectedCountry || selectedState || selectedCity || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Grupo Sanguíneo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Grupo Sanguíneo</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as BloodGroup | "")}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-rose-500"
            >
              <option value="">Cualquiera</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
              <option value="AB">Grupo AB</option>
              <option value="O">Grupo O</option>
            </select>
          </div>

          {/* Factor Sanguíneo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Factor (Rh)</label>
            <select
              value={selectedFactor}
              onChange={(e) => setSelectedFactor(e.target.value as BloodFactor | "")}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-rose-500"
            >
              <option value="">Cualquiera</option>
              <option value="+">Factor + (Rh+)</option>
              <option value="-">Factor - (Rh-)</option>
            </select>
          </div>

          {/* País */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">País (Nodo Nac.)</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-rose-500"
            >
              <option value="">Cualquiera</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Estado / Provincia */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Provincia (Nodo Reg.)</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-rose-500"
            >
              <option value="">Cualquiera</option>
              {uniqueStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Ciudad (Nodo Local)</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-rose-500"
            >
              <option value="">Cualquiera</option>
              {uniqueCities.map((ci) => (
                <option key={ci} value={ci}>{ci}</option>
              ))}
            </select>
          </div>

          {/* Caja búsqueda texto libre */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Buscar por texto</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Alias, filtros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-2 focus:outline-none focus:border-rose-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* CARTILLA DE RESULTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDonors.length > 0 ? (
          filteredDonors.map((donor) => {
            // Calcular disponibilidad del donante basado en la fecha de última donación
            const availability = checkDonorAvailability(donor);
            const isUnlocked = unlockedDonorId === donor.id;

            return (
              <div 
                key={donor.id}
                className={`p-5 rounded-2xl bg-white border shadow-sm transition-all flex flex-col justify-between gap-4 ${
                  availability.isAvailable 
                    ? "border-rose-100/70 hover:border-rose-200 hover:shadow-md" 
                    : "border-slate-100 bg-slate-50/50 opacity-90"
                }`}
              >
                {/* Header card */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3">
                    {/* Badge sangre */}
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-rose-600 font-bold">
                      <span className="text-sm font-black leading-none">{donor.bloodGroup}</span>
                      <span className="text-xs font-bold leading-none mt-0.5">{donor.bloodFactor}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
                        <span>{donor.alias}</span>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 uppercase tracking-widest">
                            {unlockedFullName}
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{donor.city}, {donor.state} ({donor.country})</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado Badge */}
                  <div>
                    {availability.isAvailable ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Disponible</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>En espera ({availability.daysRemaining} días)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalles intermedios */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Última Donación:</span>
                    <span className="font-medium text-slate-700">
                      {donor.lastDonationDate === "2020-01-01" ? "Ninguna registrada" : donor.lastDonationDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Género biológico:</span>
                    <span className="font-medium text-slate-700">{donor.gender === "M" ? "Masculino" : "Femenino"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ubicación Territorial:</span>
                    <span className="font-medium text-slate-700">{donor.country} &bull; {donor.state}</span>
                  </div>
                </div>

                {/* Footer card: botón de contacto */}
                <div className="border-t border-rose-50/50 pt-3 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 italic">ID: {donor.id.substring(0, 10)}...</span>
                  
                  {isUnlocked ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <a
                        href={`tel:${unlockedPhone}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all w-full sm:w-auto"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar {unlockedPhone}</span>
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => openContactFlow(donor)}
                      disabled={!availability.isAvailable}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        availability.isAvailable 
                          ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer" 
                          : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contactar Donante</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 py-12 px-6 rounded-2xl bg-rose-50/20 border border-rose-100 text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="font-bold text-slate-800 text-base">No se hallaron donantes calificados</h4>
              <p className="text-xs text-slate-600 leading-normal">
                No hay resultados con los filtros aplicados en el nodo local. Te sugerimos ampliar el filtro geográfico al nodo regional (Provincia) o nacional para cruzar localidades vecinas.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-rose-500 font-bold border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Restaurar cartilla comunitaria general
            </button>
          </div>
        )}
      </div>

      {/* MODAL DE EMERGENCIA / DECLARACIÓN JURADA */}
      {isEmergencyModalOpen && selectedDonor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-rose-100 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-rose-600 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm md:text-base">Declaración de Urgencia Crítica</h4>
                  <p className="text-[10px] text-rose-100">Auditoría electrónica legal obligatoria para revelar datos confidenciales</p>
                </div>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyContactRequest} className="p-6 space-y-4">
              <div className="text-[11px] text-amber-700 bg-amber-50 rounded-xl border border-amber-200/60 p-3.5 space-y-1.5">
                <span className="font-bold block uppercase">¡Atención Ley de Minimización de Datos!</span>
                <p className="leading-relaxed">
                  Estás a punto de solicitar acceso al número telefónico y nombre completo privado del donante altruista <strong>{selectedDonor.alias}</strong> (Grupo <strong>{selectedDonor.bloodGroup}{selectedDonor.bloodFactor}</strong>), residente en <strong>{selectedDonor.city}</strong>. Todo pedido queda auditado electrónicamente para resguardo civil.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tu Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sofía Altruista"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nombre del Paciente Receptor</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez Paciente"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hospital / Centro de Salud de Destino</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Hospital de Clínicas, CABA"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Justificación Breve de la Urgencia</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe por qué es crítico el pedido (ej: Cirugía programada de urgencia el lunes, reposición de plaquetas...)"
                    value={urgencyReason}
                    onChange={(e) => setUrgencyReason(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                <input
                  type="checkbox"
                  required
                  id="underOath"
                  checked={underOath}
                  onChange={(e) => setUnderOath(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="underOath" className="text-[10px] text-slate-700 leading-normal font-medium cursor-pointer select-none">
                  <strong>Declaro bajo juramento</strong> que los datos aquí declarados son verídicos, exactos y con fines exclusivamente médicos asistenciales inmediatos. Comprendo que la mala fe será penalizada de conformidad con las leyes vigentes de mi respectivo país.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-rose-100"
                >
                  <span>Firmar y Revelar Teléfono</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
