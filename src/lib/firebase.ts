/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where,
  onSnapshot 
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { DonorProfile, ContactRequestLog } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let useFirebase = false;
let app;
let db: any = null;
let auth: any = null;

// Validar si la configuración es el placeholder o si es la real
const isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("placeholder");

if (!isPlaceholder) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    useFirebase = true;
    console.log("Firebase inicializado con éxito.");
  } catch (error) {
    console.warn("Fallo al inicializar Firebase con credenciales reales. Usando fallback seguro de LocalStorage.", error);
    useFirebase = false;
  }
} else {
  console.log("Detectado configuración placeholder de Firebase. Se utilizará LocalStorage + Auth simulado por defecto.");
}

// Generador de errores requeridos por el skill de Firebase
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "mock-user-id",
      email: auth?.currentUser?.email || "mock@donation.org",
      emailVerified: auth?.currentUser?.emailVerified || true,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- DONANTES SEMILLA (SEED DATA) ---
const INITIAL_DONORS: DonorProfile[] = [
  {
    id: "donor-1",
    fullName: "Juan Ignacio Pérez",
    alias: "Juan P.",
    dni: "38.291.031",
    phone: "+54 9 11 5555 1234",
    email: "juanperez@mail.com",
    city: "CABA",
    state: "Buenos Aires",
    country: "Argentina",
    bloodGroup: "O",
    bloodFactor: "+",
    lastDonationDate: "2026-04-15", // Fecha reciente (Establece período de ventana: Mínimo 3 meses hombres)
    gender: "M",
    isAvailableOverride: true,
    createdAt: "2026-01-10T10:00:00Z"
  },
  {
    id: "donor-2",
    fullName: "María Florencia González",
    alias: "Florencia G.",
    dni: "41.139.582",
    phone: "+54 9 341 555 9876",
    email: "florgonzalez@mail.com",
    city: "Rosario",
    state: "Santa Fe",
    country: "Argentina",
    bloodGroup: "O",
    bloodFactor: "-", // Factor crítico
    lastDonationDate: "2026-01-10", // Más de 4 meses (Habilitada / Disponible)
    gender: "F",
    isAvailableOverride: true,
    createdAt: "2026-01-15T11:30:00Z"
  },
  {
    id: "donor-3",
    fullName: "Carlos Eduardo Silva",
    alias: "carlos_silva",
    dni: "34.502.911",
    phone: "+54 9 11 5555 4321",
    email: "carlose.silva@mail.com",
    city: "CABA",
    state: "Buenos Aires",
    country: "Argentina",
    bloodGroup: "A",
    bloodFactor: "+",
    lastDonationDate: "2025-11-20", // Disponible
    gender: "M",
    isAvailableOverride: true,
    createdAt: "2026-02-01T08:20:00Z"
  },
  {
    id: "donor-4",
    fullName: "Sofía Valentina Ramírez",
    alias: "Sofía VR",
    dni: "43.901.442",
    phone: "+56 9 8888 7766",
    email: "sofiaramirez@mail.cl",
    city: "Sajonia",
    state: "Región Metropolitana",
    country: "Chile",
    bloodGroup: "AB",
    bloodFactor: "-", // Rarísimo
    lastDonationDate: "2026-04-25", // En ventana de espera (Menos de 4 meses)
    gender: "F",
    isAvailableOverride: true,
    createdAt: "2026-03-12T14:15:00Z"
  },
  {
    id: "donor-5",
    fullName: "Diego Martín Alonso",
    alias: "Diego A.",
    dni: "37.581.011",
    phone: "+598 99 223 445",
    email: "diegoalonso@mail.uy",
    city: "Montevideo",
    state: "Montevideo",
    country: "Uruguay",
    bloodGroup: "B",
    bloodFactor: "+",
    lastDonationDate: "2026-02-15", // Disponible (hombres 3 meses)
    gender: "M",
    isAvailableOverride: true,
    createdAt: "2026-04-03T16:45:00Z"
  }
];

// --- MOTOR DE PERSISTENCIA FLEXIBLE (LOCALSTORAGE / FIREBASE) ---

// Inicializamos el local storage si no tiene donantes
if (!localStorage.getItem("donors_registry")) {
  localStorage.setItem("donors_registry", JSON.stringify(INITIAL_DONORS));
}
if (!localStorage.getItem("contact_requests")) {
  localStorage.setItem("contact_requests", JSON.stringify([]));
}

// Auxiliar para calcular disponibilidad basada en última donación
export function checkDonorAvailability(donor: DonorProfile, currentDateStr: string = "2026-06-13"): {
  isAvailable: boolean;
  daysRemaining: number;
} {
  if (!donor.isAvailableOverride) {
    return { isAvailable: false, daysRemaining: 0 };
  }

  if (!donor.lastDonationDate) {
    return { isAvailable: true, daysRemaining: 0 };
  }

  const lastDays = Date.parse(donor.lastDonationDate);
  const currentDays = Date.parse(currentDateStr);
  
  if (isNaN(lastDays) || isNaN(currentDays)) {
    return { isAvailable: true, daysRemaining: 0 };
  }

  const diffMs = currentDays - lastDays;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Regla médica estándar: 3 meses para hombres (90 días), 4 meses para mujeres (120 días)
  const waitDays = donor.gender === "M" ? 90 : 120;
  
  if (diffDays >= waitDays) {
    return { isAvailable: true, daysRemaining: 0 };
  } else {
    return { isAvailable: false, daysRemaining: waitDays - diffDays };
  }
}

// --- SERVICIO DE BASE DE DATOS (DURA / VOLÁTIL) ---
export const dbService = {
  isUsingFirebase(): boolean {
    return useFirebase;
  },

  async getDonors(): Promise<DonorProfile[]> {
    if (useFirebase && db) {
      const path = "donors";
      try {
        const querySnapshot = await getDocs(collection(db, path));
        const list: DonorProfile[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as DonorProfile);
        });
        return list;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    } else {
      const data = localStorage.getItem("donors_registry");
      return data ? JSON.parse(data) : [];
    }
  },

  async registerDonor(profile: Omit<DonorProfile, "id" | "createdAt">, isNewUser: boolean = true, customId?: string): Promise<DonorProfile> {
    const defaultId = customId || "donor-" + Date.now();
    const newProfile: DonorProfile = {
      ...profile,
      id: defaultId,
      createdAt: new Date().toISOString(),
    };

    if (useFirebase && db) {
      const path = `donors/${defaultId}`;
      try {
        await setDoc(doc(db, "donors", defaultId), newProfile);
        return newProfile;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else {
      const list = await this.getDonors();
      // Eliminar donante previo del mismo ID para evitar duplicados
      const filtered = list.filter((d) => d.id !== defaultId);
      filtered.push(newProfile);
      localStorage.setItem("donors_registry", JSON.stringify(filtered));
      return newProfile;
    }
  },

  async updateLastDonationDate(donorId: string, date: string): Promise<void> {
    if (useFirebase && db) {
      const path = `donors/${donorId}`;
      try {
        await updateDoc(doc(db, "donors", donorId), { lastDonationDate: date });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      const list = await this.getDonors();
      const updated = list.map((d) => d.id === donorId ? { ...d, lastDonationDate: date } : d);
      localStorage.setItem("donors_registry", JSON.stringify(updated));
    }
  },

  async toggleAvailability(donorId: string, isAvailable: boolean): Promise<void> {
    if (useFirebase && db) {
      const path = `donors/${donorId}`;
      try {
        await updateDoc(doc(db, "donors", donorId), { isAvailableOverride: isAvailable });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      const list = await this.getDonors();
      const updated = list.map((d) => d.id === donorId ? { ...d, isAvailableOverride: isAvailable } : d);
      localStorage.setItem("donors_registry", JSON.stringify(updated));
    }
  },

  async logContactRequest(request: Omit<ContactRequestLog, "id" | "timestamp">): Promise<ContactRequestLog> {
    const newLog: ContactRequestLog = {
      ...request,
      id: "req-" + Date.now(),
      timestamp: new Date().toISOString()
    };

    if (useFirebase && db) {
      const path = "contact_requests";
      try {
        await addDoc(collection(db, path), newLog);
        return newLog;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else {
      const logs = this.getContactRequests();
      logs.push(newLog);
      localStorage.setItem("contact_requests", JSON.stringify(logs));
      return newLog;
    }
  },

  getContactRequests(): ContactRequestLog[] {
    // Almacenamos solicitudes de contacto
    const data = localStorage.getItem("contact_requests");
    return data ? JSON.parse(data) : [];
  }
};

// --- SERVICIO DE AUTENTICACIÓN (GOOGLE / SIMULADOR DE SESIÓN) ---
export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export const authService = {
  isUsingFirebase(): boolean {
    return useFirebase && !!auth;
  },

  // Suscribirse a cambios de autenticación
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    if (useFirebase && auth) {
      return auth.onAuthStateChanged((user: User | null) => {
        if (user) {
          callback({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL
          });
        } else {
          callback(null);
        }
      });
    } else {
      // Intentar cargar sesión mockeada existente
      const session = localStorage.getItem("mock_user_session");
      if (session) {
        callback(JSON.parse(session));
      } else {
        callback(null);
      }
      // Retornar unsubscribe vacío
      return () => {};
    }
  },

  async loginWithGoogle(): Promise<AuthUser> {
    if (useFirebase && auth) {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      };
    } else {
      // Simular login con un usuario por defecto
      const mockUser: AuthUser = {
        uid: "mock-user-123",
        displayName: "Sofía Altruista",
        email: "sofia.voluntaria@gmail.com",
        photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
      };
      localStorage.setItem("mock_user_session", JSON.stringify(mockUser));
      // Forzar recarga ligera o evento para disparar cambio
      window.dispatchEvent(new Event("storage"));
      return mockUser;
    }
  },

  async logout(): Promise<void> {
    if (useFirebase && auth) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem("mock_user_session");
      window.dispatchEvent(new Event("storage"));
    }
  }
};
