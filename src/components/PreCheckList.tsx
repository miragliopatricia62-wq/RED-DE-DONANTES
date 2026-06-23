/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Activity } from "lucide-react";
import { PreCheckAnswer } from "../types";

interface PreCheckListProps {
  onCheckPassed: (answers: PreCheckAnswer) => void;
}

export default function PreCheckList({ onCheckPassed }: PreCheckListProps) {
  const [answers, setAnswers] = useState<Partial<PreCheckAnswer>>({});
  const [showResult, setShowResult] = useState(false);

  // Lista de preguntas definidas por salud cívica
  const questions = [
    {
      key: "ageOk",
      label: "¿Tienes entre 18 y 65 años de edad?",
      subLabel: "O mayor de 16 con autorización de adultos responsables.",
      expected: true,
    },
    {
      key: "weightOk",
      label: "¿Tu peso corporal es superior a 50 kg?",
      subLabel: "Requisito mínimo para garantizar tu volumen circulatorio seguro.",
      expected: true,
    },
    {
      key: "noRecentTattoos",
      label: "¿Estás libre de tatuajes, piercings o tratamientos estéticos en los últimos 12 meses?",
      subLabel: "Periodo obligatorio de resguardo y seguridad epidemiológica (hepatitis/HIV).",
      expected: true,
    },
    {
      key: "noRecentSurgeries",
      label: "¿Estás libre de cirugías mayores, endoscopías o tratamientos invasivos en el último año?",
      subLabel: "Previene complicaciones anestésicas o infecciosas posoperatorias.",
      expected: true,
    },
    {
      key: "noPregnantCheck",
      label: "¿Estás libre de embarazo, lactancia o partos en los últimos 6 meses? (O no aplica a tu caso)",
      subLabel: "El cuerpo necesita recuperar hierro y niveles de hemoglobina estables.",
      expected: true,
    },
    {
      key: "generalHealthOk",
      label: "¿Te sientes bien de salud general hoy?",
      subLabel: "Sin resfríos, mareos, fiebre o toma de antibióticos en las últimas dos semanas.",
      expected: true,
    }
  ];

  const handleSelect = (key: keyof PreCheckAnswer, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const checkEligibility = () => {
    // Comprobar si todas fueron respondidas
    const allAnswered = questions.every((q) => answers[q.key as keyof PreCheckAnswer] !== undefined);
    if (!allAnswered) {
      alert("Por favor responde todas las preguntas del asistente antes de continuar.");
      return;
    }
    setShowResult(true);
  };

  // Determinar elegibilidad (todos los campos deben cumplir su valor esperado "true")
  const isEligible = 
    answers.ageOk === true &&
    answers.weightOk === true &&
    answers.noRecentTattoos === true &&
    answers.noRecentSurgeries === true &&
    answers.noPregnantCheck === true &&
    answers.generalHealthOk === true;

  const resetCheck = () => {
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Asistente de Autoevaluación Médica</h3>
          <p className="text-xs text-slate-500">Filtro inteligente rápido para comprobar tu aptitud de donante voluntario.</p>
        </div>
      </div>

      {!showResult ? (
        <div className="space-y-4">
          <div className="divide-y divide-rose-50/50">
            {questions.map((q) => {
              const currentVal = answers[q.key as keyof PreCheckAnswer];
              return (
                <div key={q.key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0">
                  <div className="space-y-0.5 max-w-lg">
                    <p className="text-sm font-semibold text-slate-800">{q.label}</p>
                    <p className="text-xs text-slate-500 leading-normal">{q.subLabel}</p>
                  </div>
                  <div className="flex gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleSelect(q.key as keyof PreCheckAnswer, true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                        currentVal === true
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelect(q.key as keyof PreCheckAnswer, false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                        currentVal === false
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-rose-100 flex justify-end">
            <button
              onClick={checkEligibility}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-bold rounded-xl cursor-pointer shadow-md shadow-rose-100 transition-all"
            >
              <span>Verificar Elegibilidad</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in text-center py-4 px-2">
          {isEligible ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-xl font-bold text-slate-800">¡Eres apto para ser Donante!</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Basado en tus respuestas, cumples con los lineamientos básicos estipulados por los Ministerios de Salud y la OMS. Tu decisión puede salvar hasta tres vidas hoy.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={resetCheck}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer transition-colors w-full sm:w-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Volver a evaluar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onCheckPassed(answers as PreCheckAnswer)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-100 cursor-pointer transition-all w-full sm:w-auto"
                >
                  <span>Ir al Formulario de Registro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-xl font-bold text-slate-800">No habilitado de momento</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Para resguardar tu salud o la del paciente, existen requisitos del checklist interactivo que no se cumplieron en este momento. Esto es habitual y temporal.
                </p>
                <p className="text-xs text-rose-600 bg-rose-50/50 p-3 rounded-lg border border-rose-100/60 leading-relaxed">
                  ¡No te preocupes! El período de ventana por tatuajes o cirugías de 12 meses es preventivo. Agradecemos inmensamente tu espíritu civil altruista y te invitamos a sumarte a difundir la app compartiendo el Código QR con tus conocidos.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={resetCheck}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Intentar de nuevo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
