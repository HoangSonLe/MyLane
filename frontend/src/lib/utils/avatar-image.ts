const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const MAX_AVATAR_EDGE = 512
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('PROFILE_AVATAR_INVALID'))
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('PROFILE_AVATAR_INVALID')),
      'image/webp',
      0.86,
    )
  })
}

/** Validates, bounds and normalizes an avatar before it reaches Storage. */
export async function prepareAvatarImage(source: File): Promise<File> {
  if (!ACCEPTED_TYPES.has(source.type)) {
    throw new Error('PROFILE_AVATAR_TYPE')
  }
  if (source.size > MAX_AVATAR_BYTES) {
    throw new Error('PROFILE_AVATAR_SIZE')
  }

  const objectUrl = URL.createObjectURL(source)
  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, MAX_AVATAR_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('PROFILE_AVATAR_INVALID')
    context.drawImage(image, 0, 0, width, height)
    const blob = await canvasToBlob(canvas)
    if (blob.size > MAX_AVATAR_BYTES) throw new Error('PROFILE_AVATAR_SIZE')
    return new File([blob], 'avatar.webp', { type: 'image/webp' })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
