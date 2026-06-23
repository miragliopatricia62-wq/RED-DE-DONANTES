/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, MapPin, HeartHandshake, Shield, HelpCircle, Save, ArrowLeft } from "lucide-react";
import { DonorProfile, BloodGroup, BloodFactor } from "../types";

interface DonorRegisterFormProps {
  onRegisterSubmit: (profile: Omit<DonorProfile, "id" | "createdAt" | "isAvailableOverride">) => void;
  onCancel: () => void;
  userEmail?: string;
  userDisplayName?: string;
}

export default function DonorRegisterForm({ onRegisterSubmit, onCancel, userEmail, userDisplayName }: DonorRegisterFormProps) {
  const [fullName, setFullName] = useState(userDisplayName || "");
  const [alias, setAlias] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [country, setCountry] = useState("Argentina");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O");
  const [bloodFactor, setBloodFactor] = useState<BloodFactor>("+");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [lastDonationDate, setLastDonationDate] = useState("2026-06-01");
  const [neverDonated, setNeverDonated] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Debes leer y aceptar de forma explícita el consentimiento de protección de datos.");
      return;
    }

    if (!fullName || !alias || !dni || !phone || !email || !country || !state || !city) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    // Si nunca donó, fijar una fecha lejana del pasado (ej. 1990) o vacía para habilitación instantánea
    const donationDateStr = neverDonated ? "2020-01-01" : lastDonationDate;

    onRegisterSubmit({
      fullName,
      alias,
      dni,
      phone,
      email,
      country,
      state,
      city,
      bloodGroup,
      bloodFactor,
      gender,
      lastDonationDate: donationDateStr
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-rose-100 p-6 lg:p-8 shadow-lg space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-rose-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Inscripción Altruista de Donante</h3>
            <p className="text-xs text-slate-500">Completa tu ficha para sumarte a la red cívica.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* BLOQUE: DATOS SANITARIOS DE CATERPILLAR */}
        <div className="md:col-span-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
            <HeartHandshake className="w-4 h-4" />
            <span>Filiación y Grupo Sanguíneo</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1.5">Grupo Sanguíneo</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer [&>option]:text-slate-800"
              >
                <option value="A">Grupo A</option>
                <option value="B">Grupo B</option>
                <option value="AB">Grupo AB</option>
                <option value="O">Grupo O (Universal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1.5">Factor Sanguíneo</label>
              <select
                value={bloodFactor}
                onChange={(e) => setBloodFactor(e.target.value as BloodFactor)}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer [&>option]:text-slate-800"
              >
                <option value="+">Factor + (Positivo)</option>
                <option value="-">Factor - (Negativo - Crítico)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1.5">Género Biológico</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "M" | "F")}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer [&>option]:text-slate-800"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1.5">Última donación</label>
              <input
                type="date"
                value={lastDonationDate}
                disabled={neverDonated}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-40"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="neverDonated"
              checked={neverDonated}
              onChange={(e) => setNeverDonated(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <label htmlFor="neverDonated" className="text-rose-100 cursor-pointer font-medium select-none">
              Es mi primera vez donando (habilitación inmediata para figurar disponible)
            </label>
          </div>
        </div>

        {/* COL 1: IDENTIFICACIÓN (DATOS PRIVADOS VS PÚBLICOS) */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-rose-50 pb-2">
            <User className="w-4 h-4 text-rose-500" />
            <span>Datos Personales y Privacidad</span>
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <span>Nombre Completo (Obligatorio)</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">Privado</span>
            </label>
            <input
              type="text"
              required
              placeholder="Juan Ignacio Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
            <p className="text-[10px] text-slate-400 mt-1">Este dato queda resguardado en Firestore y solo se revela en emergencias.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <span>Alias Público</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">Público</span>
              </label>
              <input
                type="text"
                required
                placeholder="Juan P."
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-1">Es lo que verán en la cartilla.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <span>Documento / DNI</span>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">Privado</span>
              </label>
              <input
                type="text"
                required
                placeholder="38.291.031"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-1">Fines de control de identidad.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <span>Teléfono de Contacto</span>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">Privado</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+54 9 11 5555 1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* COL 2: UBICACIÓN POR NODOS GEOGRÁFICOS */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-rose-50 pb-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Nodos de Ubicación y Escalabilidad</span>
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">País (Nodo Nacional)</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Paraguay">Paraguay</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Provincia, Estado o Región (Nodo Regional)</label>
            <input
              type="text"
              required
              placeholder="Buenos Aires, Santa Fe, RM..."
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ciudad o Localidad (Nodo Local)</label>
            <input
              type="text"
              required
              placeholder="CABA, Rosario, San Isidro..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* FOOTER: CONSENTIMIENTO Y ENVÍO */}
      <div className="pt-6 border-t border-rose-50 space-y-4">
        <div className="flex gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100/60">
          <input
            type="checkbox"
            id="termsAccepted"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="rounded text-rose-600 focus:ring-rose-500 w-5 h-5 cursor-pointer mt-0.5 flex-shrink-0"
          />
          <div className="text-xs text-slate-700 leading-relaxed space-y-1">
            <label htmlFor="termsAccepted" className="font-bold text-slate-800 cursor-pointer select-none flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>Acepto y firmo el Tratamiento Altruista de Datos Sanitarios</span>
            </label>
            <p>
              Consiento explícitamente que se publique mi Alias, Localización, Factor de Sangre y Fecha de Última Donación. Autorizo que mi teléfono privado sea relevado temporalmente bajo log de auditoría electrónica únicamente mediante solicitudes certificadas de urgencia sanitaria declarada. Entiendo que puedo dar de baja mi perfil en cualquier momento con efecto inmediato.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
          <p className="text-xs text-slate-500 text-center sm:text-right">
            Tus datos de contacto estarán encriptados y protegidos según leyes de salud cívica.
          </p>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-rose-100 transition-all w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Registro</span>
          </button>
        </div>
      </div>
    </form>
  );
}
