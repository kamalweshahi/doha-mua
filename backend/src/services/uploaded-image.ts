import fs from 'fs/promises'
import path from 'path'
import config from '../config'

function isUploadedFile(imageName?: string | null) {
  return Boolean(imageName && !imageName.startsWith('http://') && !imageName.startsWith('https://'))
}

export async function removeUploadedImage(imageName?: string | null) {
  if (!isUploadedFile(imageName)) return

  const imagePath = path.resolve(config.app.uploadsDir, imageName!)
  await fs.unlink(imagePath).catch(error => {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  })
}
