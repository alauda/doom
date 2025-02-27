import { dirname } from 'node:path'
import type { Buffer } from 'node:buffer'
import { existsSync, promises as fs } from 'node:fs'

/**
 * Write file safely
 */
export async function writeFileSafe(
  path: string,
  data: string | Buffer | Uint8Array = '',
) {
  const directory = dirname(path)
  if (!existsSync(directory)) {
    await fs.mkdir(directory, { recursive: true })
  }

  try {
    await fs.writeFile(path, data)
    return true
  } catch {
    return false
  }
}
