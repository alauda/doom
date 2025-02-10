import fs from 'fs/promises'

export async function pathExists(path: string) {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

export async function readJson<T>(path: string) {
  const raw = await fs.readFile(path, 'utf8')
  return JSON.parse(raw) as T
}
