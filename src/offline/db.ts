import type { Product } from "@/domain/types";

const DB_NAME = "produzir-registra";
const DB_VERSION = 1;
const PENDING_STORE = "pending-records";
const PRODUCT_STORE = "products";

export interface OfflineProduction {
  localId: string;
  companyId: string;
  userId: string;
  barcode: string;
  quantity: number;
  idempotencyKey: string;
  sourceDeviceId: string;
  localRecordedAt: string;
  retryCount: number;
  lastError?: string;
}

interface CachedProduct extends Product {
  cacheKey: string;
  cachedAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        const pending = db.createObjectStore(PENDING_STORE, { keyPath: "localId" });
        pending.createIndex("identity", ["companyId", "userId"], { unique: false });
      }
      if (!db.objectStoreNames.contains(PRODUCT_STORE)) {
        db.createObjectStore(PRODUCT_STORE, { keyPath: "cacheKey" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueProduction(
  item: Omit<OfflineProduction, "retryCount">,
): Promise<OfflineProduction> {
  const value: OfflineProduction = { ...item, retryCount: 0 };
  const db = await openDb();
  const tx = db.transaction(PENDING_STORE, "readwrite");
  tx.objectStore(PENDING_STORE).put(value);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return value;
}

export async function listPendingProductions(
  companyId: string,
  userId: string,
): Promise<OfflineProduction[]> {
  const db = await openDb();
  const tx = db.transaction(PENDING_STORE, "readonly");
  const store = tx.objectStore(PENDING_STORE);
  const all = await requestValue(store.getAll()) as OfflineProduction[];
  db.close();
  return all
    .filter((item) => item.companyId === companyId && item.userId === userId)
    .sort((a, b) => a.localRecordedAt.localeCompare(b.localRecordedAt));
}

export async function removePendingProduction(localId: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(PENDING_STORE, "readwrite");
  tx.objectStore(PENDING_STORE).delete(localId);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function markPendingError(
  localId: string,
  message: string,
): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(PENDING_STORE, "readwrite");
  const store = tx.objectStore(PENDING_STORE);
  const item = await requestValue(store.get(localId)) as OfflineProduction | undefined;
  if (item) {
    store.put({
      ...item,
      retryCount: item.retryCount + 1,
      lastError: message,
    });
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function cacheProducts(products: Product[]): Promise<void> {
  if (products.length === 0) return;
  const db = await openDb();
  const tx = db.transaction(PRODUCT_STORE, "readwrite");
  const store = tx.objectStore(PRODUCT_STORE);
  const cachedAt = new Date().toISOString();
  for (const product of products) {
    const value: CachedProduct = {
      ...product,
      cacheKey: `${product.companyId}:${product.barcode}`,
      cachedAt,
    };
    store.put(value);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getCachedProduct(
  companyId: string,
  barcode: string,
): Promise<Product | null> {
  const db = await openDb();
  const tx = db.transaction(PRODUCT_STORE, "readonly");
  const value = await requestValue(
    tx.objectStore(PRODUCT_STORE).get(`${companyId}:${barcode}`),
  ) as CachedProduct | undefined;
  db.close();
  if (!value) return null;
  const { cacheKey: _cacheKey, cachedAt: _cachedAt, ...product } = value;
  return product;
}

export function getDeviceId(): string {
  const key = "produzir-registra-device-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}
