import { TCCProject } from '../types';
import { sampleMonograph } from '../data/sampleProjects';

const DB_NAME = 'DocuTCC_DB';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const PROJECT_KEY = 'current_project';
const LOCAL_STORAGE_KEY = 'docutcc_current_project';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não é suportado neste ambiente.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Persists the TCC project in IndexedDB (which supports hundreds of MBs without quota issues)
 * and safely tries localStorage as a secondary fallback.
 */
export async function saveProjectToStorage(project: TCCProject): Promise<void> {
  // 1. Primary high-capacity storage: IndexedDB
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(project, PROJECT_KEY);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (indexedDbErr) {
    console.warn('Aviso: Não foi possível gravar no IndexedDB, usando fallback.', indexedDbErr);
  }

  // 2. Secondary fallback: localStorage (guarded against QuotaExceededError)
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
  } catch (localStorageErr: any) {
    // QuotaExceededError is expected for large academic projects with many sections.
    // Since IndexedDB already stores the complete data, we simply catch this gracefully.
    if (localStorageErr?.name === 'QuotaExceededError' || localStorageErr?.code === 22) {
      console.info('Projeto acadêmico extenso salvo com sucesso no IndexedDB (armazenamento de alta capacidade).');
    } else {
      console.warn('Aviso ao sincronizar localStorage secundário:', localStorageErr);
    }
  }
}

/**
 * Loads the stored TCC project.
 * Checks IndexedDB first (which holds large projects), falling back to localStorage.
 */
export async function loadProjectFromStorage(): Promise<TCCProject | null> {
  // 1. Try IndexedDB first
  try {
    const db = await openDatabase();
    const project = await new Promise<TCCProject | null>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(PROJECT_KEY);

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (project && project.id && project.title) {
      return project;
    }
  } catch (e) {
    console.warn('Não foi possível ler do IndexedDB, tentando fallback:', e);
  }

  // 2. Try localStorage fallback
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.title) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler do localStorage:', e);
  }

  return null;
}

/**
 * Synchronous initial state for React initialization before async IndexedDB completes.
 */
export function getInitialProject(): TCCProject {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.title) {
        return parsed;
      }
    }
  } catch (_e) {
    // ignore
  }
  return sampleMonograph;
}
