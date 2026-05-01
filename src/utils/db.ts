import { openDB } from 'idb'

const DB_NAME = 'safescribe-db'
const DB_VERSION = 1

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transcripts')) {
        const store = db.createObjectStore('transcripts', {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('createdAt', 'createdAt')
        store.createIndex('title', 'title')
      }
      if (!db.objectStoreNames.contains('models')) {
        db.createObjectStore('models', { keyPath: 'name' })
      }
    },
  })
}

export async function saveTranscript(transcript: {
  title: string
  text: string
  segments?: { start: number; end: number; text: string }[]
  createdAt: number
}) {
  const db = await getDb()
  const id = await db.add('transcripts', transcript)
  const count = await db.count('transcripts')
  if (count > 100) {
    const all = await db.getAll('transcripts')
    all.sort((a, b) => a.createdAt - b.createdAt)
    const toDelete = all.slice(0, count - 100)
    for (const t of toDelete) {
      await db.delete('transcripts', t.id)
    }
  }
  return id
}

export async function getAllTranscripts() {
  const db = await getDb()
  const all = await db.getAll('transcripts')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getTranscript(id: number) {
  const db = await getDb()
  return db.get('transcripts', id)
}

export async function deleteTranscript(id: number) {
  const db = await getDb()
  return db.delete('transcripts', id)
}

export async function searchTranscripts(query: string) {
  const db = await getDb()
  const all = await db.getAll('transcripts')
  const q = query.toLowerCase()
  return all
    .filter((t) => t.text.toLowerCase().includes(q) || t.title.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function getModelStatus(name: string) {
  const db = await getDb()
  return db.get('models', name)
}

export async function setModelStatus(name: string, status: { downloaded: boolean; progress: number }) {
  const db = await getDb()
  return db.put('models', { name, ...status })
}
