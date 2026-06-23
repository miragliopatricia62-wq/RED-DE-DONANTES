/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Activity, 
  QrCode, 
  Search, 
  User, 
  PlusCircle, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  HeartHandshake, 
  BookOpen,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database
} from "lucide-react";
import { DonorProfile, ContactRequestLog, PreCheckAnswer } from "./types";
import { dbService, authService, AuthUser, checkDonorAvailability } from "./lib/firebase";
import InfoArchitecture from "./components/InfoArchitecture";
import PreCheckList from "./components/PreCheckList";
import DonorRegisterForm from "./components/DonorRegisterForm";
import DonorSearch from "./components/DonorSearch";
import UserProfile from "./components/UserProfile";
import QRGenerator from "./components/QRGenerator";
import { generateSafeQR } from "./lib/qrHelper";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [contactLogs, setContactLogs] = useState<ContactRequestLog[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "search" | "register" | "profile" | "docs" | "qr">("home");
  
  // Estados para simular flujo QR
  const [showQrSimulation, setShowQrSimulation] = useState(false);
  const [qrSimStep, setQrSimStep] = useState<"scan" | "welcome" | "ready">("scan");
  const [homeQrDataUrl, setHomeQrDataUrl] = useState<string>("");

  // Estado del Checklist previo
  const [preCheckPassed, setPreCheckPassed] = useState<boolean>(false);
  const [preCheckAnswers, setPreCheckAnswers] = useState<PreCheckAnswer | null>(null);

  // Intentar emparejar el usuario logueado con un perfil de donante registrado (por correo)
  const [myDonorProfile, setMyDonorProfile] = useState<DonorProfile | null>(null);

  // Generar QR de inicio de manera 100% offline y local sin llamadas 403 externas
  useEffect(() => {
    if (typeof window !== "undefined") {
      generateSafeQR(window.location.href, 180, "#991b1b")
        .then((url) => {
          setHomeQrDataUrl(url);
        })
        .catch((err) => {
          console.error("Error generating local home QR:", err);
        });
    }
  }, []);

  // Carga inicial y listeners de autenticación
  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribeAuth = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Cargar donantes y bitácora de auditoría
    loadDatabase();

    return () => unsubscribeAuth();
  }, []);

  // Volver a calcular el perfil del donante cuando cambia la lista de donantes o el usuario actual
  useEffect(() => {
    if (donors.length > 0) {
      const savedDonorId = localStorage.getItem("my_registered_donor_id");
      let match = null;

      // 1. Intentar buscar por el ID de donante registrado guardado en el dispositivo
      if (savedDonorId) {
        match = donors.find((d) => d.id === savedDonorId);
      }

      // 2. Si no coincide, buscar por la sesión del usuario actual (UID o email)
      if (!match && currentUser) {
        match = donors.find((d) => 
          d.id === currentUser.uid || 
          (d.email && currentUser.email && d.email.toLowerCase() === currentUser.email.toLowerCase())
        );
      }

      // 3. Si se encontró un donante por sesión, respaldar su ID localmente para máxima tolerancia
      if (match && !savedDonorId) {
        localStorage.setItem("my_registered_donor_id", match.id);
      }

      setMyDonorProfile(match || null);
    } else {
      setMyDonorProfile(null);
    }
  }, [currentUser, donors]);

  const loadDatabase = async () => {
    try {
      const allDonors = await dbService.getDonors();
      setDonors(allDonors);
      const allLogs = dbService.getContactRequests();
      setContactLogs(allLogs);
    } catch (e) {
      console.error("Error al cargar la base de datos:", e);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      setCurrentUser(user);
    } catch (e) {
      alert("No se pudo iniciar sesión. Verifica la configuración de Firebase.");
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setMyDonorProfile(null);
    localStorage.removeItem("my_registered_donor_id"); // Limpiar también el ID al desloguearse explícitamente
  };

  // Crear un nuevo registro de donante
  const handleRegisterDonor = async (profileData: Omit<DonorProfile, "id" | "createdAt" | "isAvailableOverride">) => {
    let activeUser = currentUser;

    // Si no hay usuario activo, generamos una sesión simulada transparente para evitar errores de autenticación
    if (!activeUser) {
      const autoUid = "donor-user-" + Date.now();
      const newMockUser: AuthUser = {
        uid: autoUid,
        displayName: profileData.fullName,
        email: profileData.email,
        photoURL: null
      };
      
      localStorage.setItem("mock_user_session", JSON.stringify(newMockUser));
      setCurrentUser(newMockUser);
      activeUser = newMockUser;
    }

    try {
      const registered = await dbService.registerDonor(
        {
          ...profileData,
          isAvailableOverride: true,
        },
        true,
        activeUser.uid // Usamos el UID de la sesión para vincularlo de forma unívoca
      );

      // Sincronizar los datos del usuario logueado con los registrados
      const updatedUser = {
        ...activeUser,
        displayName: profileData.fullName,
        email: profileData.email,
      };
      localStorage.setItem("mock_user_session", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Guardar el ID del donante en LocalStorage para persistencia infalible de su perfil
      localStorage.setItem("my_registered_donor_id", registered.id);

      // Recargar base de datos
      await loadDatabase();
      alert("¡Felicitaciones! Te has registrado con éxito como donante altruista.");
      setActiveTab("profile");
    } catch (e) {
      console.error(e);
      alert("Error al registrar donante.");
    }
  };

  // Actualizar la última fecha de donación desde Mi Perfil
  const handleUpdateLastDonation = async (date: string) => {
    if (!myDonorProfile) return;
    try {
      await dbService.updateLastDonationDate(myDonorProfile.id, date);
      await loadDatabase();
      alert("Fecha de última donación actualizada con éxito. Tu estado de disponibilidad se ha recalculado automáticamente.");
    } catch (e) {
      console.error(e);
    }
  };

  // Cambiar el interruptor de disponibilidad
  const handleToggleAvailability = async (isAvailable: boolean) => {
    if (!myDonorProfile) return;
    try {
      await dbService.toggleAvailability(myDonorProfile.id, isAvailable);
      await loadDatabase();
    } catch (e) {
      console.error(e);
    }
  };

  // Callback cuando se genera un log de auditoría en la búsqueda
  const handleContactLogCreated = async (log: ContactRequestLog) => {
    // Recargamos los logs para actualizar la vista de Mi Perfil
    const allLogs = dbService.getContactRequests();
    setContactLogs(allLogs);
  };

  // Autoexclusión / Baja completa (Derecho de oposición / borrado)
  const handleUnregister = async () => {
    if (!myDonorProfile) return;
    try {
      // En base de datos simulada o real, excluimos al ID de la lista
      const list = donors.filter((d) => d.id !== myDonorProfile.id);
      localStorage.setItem("donors_registry", JSON.stringify(list));
      localStorage.removeItem("my_registered_donor_id"); // Limpiamos la persistencia del ID de registro local
      alert("Tus datos personales y declaración de donante han sido borrados de inmediato.");
      setMyDonorProfile(null);
      await loadDatabase();
      setActiveTab("home");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f8] flex flex-col justify-between selection:bg-rose-100 selection:text-rose-900">
      {/* HEADER DE LA RED */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-50/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-100 transition-all duration-300 group-hover:scale-105">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm md:text-base text-slate-800 tracking-tight block">
                Red de Donantes Conectados
              </span>
              <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-bold">
                Asistencia de Salud Cívica
              </span>
            </div>
          </div>

          {/* Menú de Navegación de Alta Calidad */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "home" ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "search" ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              Cartilla de Donantes
            </button>
            <button
              onClick={() => {
                if (preCheckPassed) {
                  setActiveTab("register");
                } else {
                  setActiveTab("home");
                  // Enfocar o lanzar al usuario a checklist
                  alert("Para ir al registro primero debes verificar tu salud básica con el Asistente en la pestaña Inicio.");
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "register" ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              Inscribirme
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "profile" ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              Mi Perfil {myDonorProfile && <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>}
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "qr" ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              Compartir QR
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "docs" ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              Documentación Técnica
            </button>
          </nav>

          {/* Área de Autenticación */}
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all ml-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Acceder</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User Avatar" referrerPolicy="no-referrer" className="w-6 h-6 rounded-lg" />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {currentUser.displayName?.substring(0, 1) || "U"}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700 hidden sm:inline max-w-[120px] truncate">
                  {currentUser.displayName?.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Salir de la sesión"
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BANNER DE INFORME CONFIGURANTE DE FIREBASE (PROVEEDOR DINÁMICO) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-rose-500" />
            <span>
              {dbService.isUsingFirebase() ? (
                <strong className="text-emerald-400">✓ Conectado a Firebase Cloud.</strong>
              ) : (
                <span>Almacenamiento local aislado activo. Puedes tildar la configuración de Firebase en el panel lateral de AI Studio para conectarte en vivo.</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Hora UTC-3 Localizada &bull; 2026</span>
            <button
              onClick={() => setShowQrSimulation(true)}
              className="px-2.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase cursor-pointer"
            >
              Simular QR Celular
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* TAB 1: INICIO (PÁGINA DE BIENVENVENIDA / HERO + CHECKLIST DE ENTRADA) */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-fade-in">
            {/* HERO PANEL */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-radial from-white via-[#fffcfc] to-[#fffbfc]">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2.5 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-full text-rose-700 text-xs font-bold leading-none">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Carga Instantánea - Código QR de Salud Cívica</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight md:tracking-tight font-sans">
                  Conectando vidas de forma <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-red-500">segura y altruista.</span>
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  La <strong>Red de Donantes Conectados</strong> es una plataforma pública descentralizada libre de intermediarios. Registramos de manera inteligente la disponibilidad para asegurar el nexo directo en emergencias sanitarias, protegiendo al 100% las identidades y los números telefónicos privados.
                </p>

                {/* Acciones Rápidas */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("search")}
                    className="flex justify-center items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl cursor-pointer shadow-md transition-all "
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar Donantes por Grupo</span>
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById("checklist-container");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex justify-center items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl cursor-pointer shadow-lg shadow-rose-100 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Completar Alta de Donante</span>
                  </button>
                </div>
              </div>

              {/* Lado derecho: Tarjeta QR de acceso comunitario y Datos de la Red */}
              <div className="lg:col-span-5 bg-gradient-to-b from-rose-50/50 to-rose-100/30 rounded-2xl border border-rose-100/60 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-white p-4 rounded-xl border border-rose-100/80 shadow-md hover:scale-105 duration-300 transition-transform">
                  <div className="w-[180px] h-[180px] flex items-center justify-center bg-white relative">
                    {/* Código QR Real y Escaneable generado de forma local y offline mediante qrcode sin errores 403 de red */}
                    {homeQrDataUrl ? (
                      <img 
                        src={homeQrDataUrl}
                        alt="Código QR Real Escaneable de la Red"
                        className="w-[170px] h-[170px] object-contain"
                      />
                    ) : (
                      <div className="text-xs text-rose-500 font-bold animate-pulse">Generando QR...</div>
                    )}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-lg shadow-md border border-rose-100">
                      <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Código QR Oficial de la Red</span>
                  <p className="text-xs text-slate-600 font-medium max-w-xs">
                    Imprime este código en hospitales y centros comunitarios para habilitar el ingreso móvil sin descargas.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                  <button
                    onClick={() => setShowQrSimulation(true)}
                    className="flex-grow flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-205 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simular Móvil</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("qr")}
                    className="flex-grow flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalizar / Imprimir QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ASISTENTE INTERACTIVO DE AUTOHABILITACIÓN */}
            <div id="checklist-container" className="scroll-mt-6">
              <PreCheckList 
                onCheckPassed={(answers) => {
                  setPreCheckAnswers(answers);
                  setPreCheckPassed(true);
                  if (!currentUser) {
                    // Invitar a logearse con sesión mock automático
                    alert("Aptitud médica verificada correctamente. Por favor presione 'Registrarme' para logearse de forma segura y guardar sus datos.");
                    handleLogin().then(() => setActiveTab("register"));
                  } else {
                    setActiveTab("register");
                  }
                }} 
              />
            </div>

            {/* SECCIÓN ESTADÍSTICAS MUNICIPALES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-rose-100/80 shadow-xs flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-xl font-bold font-mono">
                  {donors.length}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Donantes Altruistas</h5>
                  <p className="text-xs text-slate-400">Registrados de forma voluntaria</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100/80 shadow-xs flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold font-mono">
                  {donors.filter(d => checkDonorAvailability(d).isAvailable).length}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Donantes Disponibles</h5>
                  <p className="text-xs text-slate-400">Aptos hoy en cartilla comunitaria</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100/80 shadow-xs flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold font-mono">
                  {contactLogs.length}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Nexos de Urgencia</h5>
                  <p className="text-xs text-slate-400">Accesos auditados con éxito</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CARTILLA DE BÚSQUEDA */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <DonorSearch 
              donors={donors} 
              onContactCreated={handleContactLogCreated} 
              currentUserUid={currentUser?.uid} 
            />
          </div>
        )}

        {/* TAB 3: REGISTRO PASO A PASO */}
        {activeTab === "register" && (
          <div className="space-y-6">
            {preCheckPassed ? (
              <DonorRegisterForm 
                onRegisterSubmit={handleRegisterDonor}
                onCancel={() => setActiveTab("home")}
                userEmail={currentUser?.email || undefined}
                userDisplayName={currentUser?.displayName || undefined}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-rose-100 p-8 shadow-md text-center max-w-xl mx-auto space-y-4">
                <Activity className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
                <h4 className="font-bold text-slate-800 text-lg">Paso Requerido: Evaluación Prevencional</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Para velar por la seguridad de los pacientes y la tuya propia, las normativas sanitarias exigen cumplimentar el <strong>Asistente Virtual de Habilitación Médica</strong> antes de acceder al formulario de inscripción como donante.
                </p>
                <button
                  onClick={() => setActiveTab("home")}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md"
                >
                  Completar Checklist de Habilitación
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MI PERFIL / ESTADO */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <UserProfile 
              donorProfile={myDonorProfile}
              onUpdateDonationDate={handleUpdateLastDonation}
              onToggleAvailability={handleToggleAvailability}
              unRegister={handleUnregister}
              contactLogs={contactLogs}
            />
          </div>
        )}

        {/* TAB 5 (NUEVO): GENERADOR Y COMPARTIR CÓDIGO QR */}
        {activeTab === "qr" && (
          <div className="space-y-6">
            <QRGenerator />
          </div>
        )}

        {/* TAB 6: ARQUITECTURA TÉCNICA / DOCUMENTOS */}
        {activeTab === "docs" && (
          <div className="space-y-6">
            <InfoArchitecture />
          </div>
        )}
      </main>

      {/* FOOTER GENERAL */}
      <footer className="bg-white border-t border-rose-50 py-6 mt-12 bg-linear-to-b from-white to-rose-50/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-rose-600 flex items-center justify-center text-white text-[10px] font-black">R</div>
            <span className="text-xs text-slate-500 font-bold">Red de Donantes Conectados &copy; 2026. Proyecto Cívico Transparente.</span>
          </div>
          <div className="flex gap-4 text-[11px] text-slate-400 font-medium">
            <button onClick={() => setActiveTab("docs")} className="hover:text-rose-500 cursor-pointer">Seguridad de Datos</button>
            <span>&bull;</span>
            <button onClick={() => setActiveTab("docs")} className="hover:text-rose-500 cursor-pointer">Leyes Sanitarias Locales</button>
            <span>&bull;</span>
            <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="hover:text-rose-500 flex items-center gap-0.5">
              <span>Firebase Cloud</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* MODAL SIMULADOR QR CELULAR (DEMO DE INTEGRACIÓN MÓVIL) */}
      {showQrSimulation && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border-4 border-[#27272a] rounded-[36px] w-[350px] h-[670px] overflow-hidden shadow-2xl relative flex flex-col justify-between p-4 ring-12 ring-slate-800">
            {/* Altavoz simulado */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 bg-[#27272a] rounded-full z-10 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-700 ml-1"></div>
            </div>

            {/* Pantalla interior */}
            <div className="flex-grow bg-[#fff8f8] rounded-[24px] overflow-y-auto p-4 flex flex-col justify-between pt-6 select-none">
              
              {qrSimStep === "scan" && (
                <div className="text-center space-y-6 pt-12 my-auto animate-fade-in">
                  <div className="w-20 h-20 bg-rose-100 rounded-3xl mx-auto flex items-center justify-center text-rose-600 ring-8 ring-rose-50">
                    <QrCode className="w-10 h-10 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-slate-800 text-lg">Cámara del Teléfono</h5>
                    <p className="text-xs text-slate-500">
                      Escaneo simulado de folleto municipal en cartelera o centro cívico.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner flex flex-col gap-1 text-[10px] text-slate-600 max-w-[200px] mx-auto">
                    <span className="font-bold">detectado:</span>
                    <span className="text-rose-500 truncate font-mono">donantes-conectados.net/qr</span>
                  </div>
                  <button
                    onClick={() => setQrSimStep("welcome")}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
                  >
                    Abrir URL en Navegador
                  </button>
                </div>
              )}

              {qrSimStep === "welcome" && (
                <div className="my-auto space-y-6 text-center animate-fade-in">
                  <div className="relative inline-block">
                    <div className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-red-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-rose-100 scale-110">
                      <Heart className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-extrabold text-[#991b1b] text-base leading-tight">Red de Donantes</h5>
                    <p className="text-[11px] text-slate-600 max-w-[240px] mx-auto">
                      ¡Bienvenido! Has accedido a la cartilla municipal móvil de donantes directamente sin descargar apps pesadas.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-rose-100 text-left space-y-2 text-[10px] text-slate-700 leading-relaxed shadow-xs">
                    <span className="font-bold text-rose-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      <span>Fricción Cero Legal</span>
                    </span>
                    <p>
                      Tu acceso se realiza directamente. Si buscas donantes por emergencia, puedes realizar tu pedido ahora. Si quieres ser donante, el Asistente evaluará tu elegibilidad en 1 minuto.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab("home");
                        setShowQrSimulation(false);
                        setQrSimStep("scan");
                        // Desplazar a checklist
                        setTimeout(() => {
                          const el = document.getElementById("checklist-container");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }, 200);
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Verificar mi Salud (Inscribirme)
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("search");
                        setShowQrSimulation(false);
                        setQrSimStep("scan");
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Navegar Cartilla de Donantes
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Tecla de inicio del móvil */}
            <div className="flex items-center justify-center pt-2 gap-10">
              <button
                onClick={() => setQrSimStep("scan")}
                className="text-slate-500 hover:text-white text-[10px] uppercase font-bold cursor-pointer"
              >
                Reiniciar
              </button>
              <button
                onClick={() => {
                  setShowQrSimulation(false);
                  setQrSimStep("scan");
                }}
                className="w-12 h-1.5 bg-[#27272a] rounded-full cursor-pointer hover:bg-slate-600"
              ></button>
              <button
                onClick={() => {
                  setShowQrSimulation(false);
                  setQrSimStep("scan");
                }}
                className="text-slate-500 hover:text-white text-[10px] uppercase font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
