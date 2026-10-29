import { PersistedList } from './persisted.svelte.js';

// Flat metadata-only document registry, spanning employee profiles,
// individual qualifications, and offboarding exit cases. No binary
// storage — this is a UI-only prototype, so uploads only capture
// filename/type/size, mirroring how qualifications[].documentRef is
// already just a string reference rather than a real file.
const seedDocuments = [];

export const documentsStore = new PersistedList('cyberguard_documents', seedDocuments);

export function getDocumentsFor(recordType, recordId) {
  return documentsStore.items.filter(
    (doc) => doc.recordType === recordType && doc.recordId === recordId
  );
}

export function attachDocument(recordType, recordId, file, category, uploadedBy) {
  const doc = {
    id: `DOC-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    recordType,
    recordId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    sizeLabel: formatFileSize(file.size),
    category: category || 'General',
    uploadedBy: uploadedBy || 'Current User',
    uploadedAt: new Date().toISOString().split('T')[0]
  };
  documentsStore.add(doc);
  return doc;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
