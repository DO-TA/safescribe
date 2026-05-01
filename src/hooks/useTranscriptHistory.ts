import { useState, useCallback, useEffect } from 'react'
import {
  saveTranscript as dbSave,
  getAllTranscripts as dbGetAll,
  searchTranscripts as dbSearch,
  deleteTranscript as dbDelete,
} from '../utils/db'

export interface TranscriptItem {
  id?: number
  title: string
  text: string
  segments?: { start: number; end: number; text: string }[]
  createdAt: number
}

export function useTranscriptHistory() {
  const [items, setItems] = useState<TranscriptItem[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const all = await dbGetAll()
    setItems(all)
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(async (item: Omit<TranscriptItem, 'id'>) => {
    const id = await dbSave(item)
    await refresh()
    return id
  }, [refresh])

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      await refresh()
      return
    }
    const results = await dbSearch(query)
    setItems(results)
  }, [refresh])

  const remove = useCallback(async (id: number) => {
    await dbDelete(id)
    await refresh()
  }, [refresh])

  return { items, loaded, save, search, remove, refresh }
}
