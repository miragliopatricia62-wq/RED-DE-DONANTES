/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BloodGroup = "A" | "B" | "AB" | "O";
export type BloodFactor = "+" | "-";

export interface DonorProfile {
  id: string;
  fullName: string;      // Privado (Dato Sensible)
  alias: string;         // Público (Nombre de pila o alias para visualización general)
  dni: string;           // Privado (Dato Sensible)
  phone: string;         // Privado (Dato Sensible)
  email: string;         // Privado (Dato Sensible)
  city: string;          // Público (Filtro por nodo territorial)
  state: string;         // Público (Filtro por nodo territorial)
  country: string;       // Público (Filtro por nodo territorial)
  bloodGroup: BloodGroup;
  bloodFactor: BloodFactor;
  lastDonationDate: string; // YYYY-MM-DD
  gender: "M" | "F";      // Requerido para calcular período de ventana
  isAvailableOverride: boolean; // El usuario puede apagar temporalmente su disponibilidad
  createdAt: string;
}

export interface PreCheckAnswer {
  ageOk: boolean;            // Mayor de 16/18 y menor de 65 años
  weightOk: boolean;         // Más de 50 kg
  noRecentTattoos: boolean;  // Sin tatuajes o piercings en los últimos 12 meses
  noRecentSurgeries: boolean;// Sin cirugías mayores en los últimos 12 meses
  noPregnantCheck: boolean;  // No está embarazada ni amamantando (si aplica)
  generalHealthOk: boolean;  // Sintiéndose bien el día de hoy, sin síntomas gripales o COVID-19
}

export interface ContactRequestLog {
  id: string;
  userId?: string;              // Quien solicita (si está autenticado)
  requesterName: string;        // Nombre del solicitante de emergencia
  patientName: string;          // Nombre del paciente que necesita la sangre
  hospital: string;             // Centro de salud u hospital receptor
  urgencyReason: string;        // Declaración jurada del motivo de urgencia
  donorId: string;              // ID del donante contactado
  donorAlias: string;           // Alias del donante
  timestamp: string;            // Fecha y hora del pedido
}

export interface InfoNode {
  title: string;
  content: string[];
}
