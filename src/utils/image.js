// Firestore 문서(1MB 한도) 안에 이미지를 데이터 URL로 담기 위한 압축 유틸.
const DEFAULT_BUDGET = 600_000

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지를 불러올 수 없어요')) }
    img.src = url
  })
}

function drawToDataURL(img, width, quality) {
  const height = Math.round(img.height * width / img.width)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

// 예산 안에 들어오는 가장 큰 해상도를 고른다. 못 맞추면 가장 작은 결과라도 반환.
export async function compressImage(file, maxBytes = DEFAULT_BUDGET) {
  const img = await loadImage(file)
  let best = null
  for (const width of [1600, 1280, 960, 720]) {
    for (const quality of [0.85, 0.7, 0.55]) {
      const dataUrl = drawToDataURL(img, Math.min(width, img.width), quality)
      best = dataUrl
      if (dataUrl.length <= maxBytes) return dataUrl
    }
  }
  return best
}
