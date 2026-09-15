const DATABASE_NAME = "aio-media";
const DATABASE_VERSION = 1;
const IMAGE_STORE_NAME = "images";
const MANAGED_IMAGE_PREFIX = "aio-image://";

const openMediaDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        database.createObjectStore(IMAGE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const isManagedImageReference = (value: string) =>
  value.startsWith(MANAGED_IMAGE_PREFIX);

const getImageId = (reference: string) =>
  reference.slice(MANAGED_IMAGE_PREFIX.length);

export const saveManagedImage = async (file: File) => {
  const database = await openMediaDatabase();
  const id = crypto.randomUUID();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, "readwrite");
    transaction.objectStore(IMAGE_STORE_NAME).put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  database.close();
  return `${MANAGED_IMAGE_PREFIX}${id}`;
};

export const loadManagedImage = async (reference: string) => {
  if (!isManagedImageReference(reference)) return undefined;

  const database = await openMediaDatabase();
  const image = await new Promise<Blob | undefined>((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, "readonly");
    const request = transaction.objectStore(IMAGE_STORE_NAME).get(getImageId(reference));
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });

  database.close();
  return image;
};

export const deleteManagedImage = async (reference: string) => {
  if (!isManagedImageReference(reference)) return;

  const database = await openMediaDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, "readwrite");
    transaction.objectStore(IMAGE_STORE_NAME).delete(getImageId(reference));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
};

export const getManagedImageReferences = (value: unknown): string[] => {
  if (typeof value === "string") {
    return isManagedImageReference(value) ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(getManagedImageReferences);
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).flatMap(getManagedImageReferences);
  }

  return [];
};

export const deleteManagedImagesInValue = async (value: unknown) => {
  const references = [...new Set(getManagedImageReferences(value))];
  await Promise.all(references.map(deleteManagedImage));
};
