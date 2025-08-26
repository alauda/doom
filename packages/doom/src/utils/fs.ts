import fs from 'fs/promises'

export async function pathExists(path: string, type?: 'file' | 'directory') {
  try {
    const stats = await fs.stat(path)
    if (type === 'file') {
      return stats.isFile()
    }
    if (type === 'directory') {
      return stats.isDirectory()
    }
    return true
  } catch {
    return false
  }
}

export async function readJson<T>(path: string) {
  const raw = await fs.readFile(path, 'utf8')
  return JSON.parse(raw) as T
}
