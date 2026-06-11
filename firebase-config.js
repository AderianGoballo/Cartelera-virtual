import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCajiS-1KALCiCGUd7YNzbzWG0yGhLyd20",
  authDomain: "test-daia.firebaseapp.com",
  projectId: "test-daia",
  storageBucket: "test-daia.firebasestorage.app",
  messagingSenderId: "872183946058",
  appId: "1:872183946058:web:3770f5c3f6eae45911bfb3",
  measurementId: "G-01TGZ7G1G0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window.DaiaAuth = {
  login: async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error signing in", error);
      alert("Error al iniciar sesión: " + error.message);
      return null;
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error signing out", error);
    }
  },
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

window.DaiaDB = {
  // Check if a user has already taken a specific test
  hasUserTakenTest: async (email, testId) => {
    try {
      const docRef = doc(db, "testResults", `${email}_${testId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error checking test status:", error);
      return null;
    }
  },
  
  // Save test result
  saveTestResult: async (email, testId, data) => {
    try {
      const docRef = doc(db, "testResults", `${email}_${testId}`);
      await setDoc(docRef, {
        email: email,
        testId: testId,
        completedAt: new Date().toISOString(),
        ...data
      });
      return true;
    } catch (error) {
      console.error("Error saving test result:", error);
      alert("Hubo un error al guardar tu resultado. Por favor, toma una captura de pantalla.");
      return false;
    }
  }
};

// Global UI Updater for the NavBar
onAuthStateChanged(auth, (user) => {
  const authContainer = document.getElementById("auth-container");
  if (!authContainer) return;

  if (user) {
    authContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <img src="${user.photoURL}" alt="${user.displayName}" class="w-8 h-8 rounded-full border border-blue-200">
        <span class="text-sm font-semibold text-slate-700 dark:text-white hidden sm:inline-block" title="${user.email}">${user.displayName.split(" ")[0]}</span>
        <button onclick="window.DaiaAuth.logout()" class="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Cerrar Sesión">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <button onclick="window.DaiaAuth.login()" class="flex items-center gap-2 bg-white text-gray-700 font-semibold py-1.5 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm text-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
        Entrar
      </button>
    `;
  }
});
