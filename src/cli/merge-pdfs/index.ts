import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import x from './pyodide/pyodide.js'
import { yellowBright } from 'yoctocolors'

import { formatDate } from './formatDate.js'

/**
 * @see https://www.uuidgenerator.net/version4
 * UUID v4
 */
export const MERGE_PDF_NAME = '66699f18-ad5a-43c2-a96e-97bddaef0e6b.pdf'
export const MOUNT_DIR = '/' + '991e729a-8f2e-472a-8402-c26bb03b5ea3'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function mergePDFs(entries: string[]) {
  if (entries.length < 2) {
    process.stdout.write(yellowBright('At least two PDF files.\n'))
    process.exit(1)
  }

  const pyodide = await x.loadPyodide({
    indexURL: resolve(__dirname, 'pyodide'),
  })
  await pyodide.loadPackage('micropip')
  const micropip = pyodide.pyimport('micropip') as {
    install(pkg: string): Promise<void>
  }

  pyodide.FS.mkdirTree(MOUNT_DIR)
  pyodide.FS.mount(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    pyodide.FS.filesystems.NODEFS,
    { root: __dirname },
    MOUNT_DIR,
  )
  /**
   * @see https://github.com/pyodide/pyodide/issues/3246#issuecomment-1312210155
   * You need to prefix the path with emfs: or it will be treated as a url
   */
  await micropip.install(
    `emfs:${MOUNT_DIR}/pyodide/pypdf-3.8.1-py3-none-any.whl`,
  )

  const tempFileNameArr: string[] = []
  entries.forEach((filePath) => {
    const tempFileName = `/${filePath.split('/').join('-')}`
    tempFileNameArr.push(tempFileName)
    pyodide.FS.writeFile(tempFileName, readFileSync(filePath))
  })

  const curDate = formatDate(new Date())

  await pyodide.runPythonAsync(`
		from pypdf import PdfWriter
		from json import loads

		writer = PdfWriter()
		writer.add_metadata(
				{
						"/CreationDate": "${curDate}",
						"/ModDate": "${curDate}",
						"/Creator": "doom",
						"/Producer": "pypdf - doom",
				}
		)

		for path in loads('${JSON.stringify(tempFileNameArr)}'):
			writer.append(path)

		writer.write("/${MERGE_PDF_NAME}")
		writer.close()
	`)

  return pyodide.FS.readFile(`/${MERGE_PDF_NAME}`)
}

export default mergePDFs
