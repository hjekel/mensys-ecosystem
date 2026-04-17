// Stub service. Phase 1 stores contacts in the frontend (localStorage).
// A future Airtable proxy will be wired in here.

export async function listContacts() {
  return [];
}

export async function getContact(_id) {
  return null;
}

export async function createContact(_payload) {
  throw new Error('Not implemented in phase 1');
}

export async function updateContact(_id, _payload) {
  throw new Error('Not implemented in phase 1');
}

export async function deleteContact(_id) {
  throw new Error('Not implemented in phase 1');
}
