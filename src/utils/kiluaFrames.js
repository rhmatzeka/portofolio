const frameModules = import.meta.glob('../assets/kiluaanimated/*.{jpg,jpeg,png,webp}', {
  query: '?url',
  import: 'default'
})

export const KILUA_FRAME_ASPECT_RATIO = '1920 / 1076'

const PRELOAD_CONCURRENCY = 4
const frameEntries = Object.entries(frameModules).sort(([a], [b]) => a.localeCompare(b))
const progressListeners = new Set()

let frameSourcesPromise = null
let preloadPromise = null
let preloadedSources = []
let latestProgress = {
  loaded: 0,
  total: frameEntries.length,
  percent: 0
}

const notifyProgress = (progress) => {
  latestProgress = progress
  progressListeners.forEach((listener) => listener(progress))
}

const preloadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image()

  image.decoding = 'async'
  image.onload = async () => {
    try {
      if (image.decode) await image.decode()
      resolve(src)
    } catch (error) {
      resolve(src)
    }
  }
  image.onerror = reject
  image.src = src
})

const preloadImages = async (sources) => {
  let loadedCount = 0
  let nextIndex = 0
  const workerCount = Math.min(PRELOAD_CONCURRENCY, sources.length)

  const preloadNext = async () => {
    while (nextIndex < sources.length) {
      const sourceIndex = nextIndex
      nextIndex += 1

      try {
        await preloadImage(sources[sourceIndex])
      } catch (error) {
        // Keep the sequence usable even if one frame has a temporary network miss.
      } finally {
        loadedCount += 1
        notifyProgress({
          loaded: loadedCount,
          total: sources.length,
          percent: sources.length ? Math.round((loadedCount / sources.length) * 100) : 100
        })
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, preloadNext))
}

export const loadKiluaFrameSources = () => {
  if (!frameSourcesPromise) {
    frameSourcesPromise = Promise.all(frameEntries.map(([, loadFrame]) => loadFrame()))
  }

  return frameSourcesPromise
}

export const ensureKiluaFramesPreloaded = (onProgress) => {
  if (onProgress) {
    progressListeners.add(onProgress)
    onProgress(latestProgress)
  }

  if (preloadedSources.length) {
    notifyProgress({
      loaded: preloadedSources.length,
      total: preloadedSources.length,
      percent: 100
    })
    if (onProgress) progressListeners.delete(onProgress)
    return Promise.resolve(preloadedSources)
  }

  if (!preloadPromise) {
    preloadPromise = loadKiluaFrameSources()
      .then(async (sources) => {
        notifyProgress({ loaded: 0, total: sources.length, percent: 0 })
        await preloadImages(sources)
        preloadedSources = sources
        notifyProgress({ loaded: sources.length, total: sources.length, percent: 100 })
        return sources
      })
  }

  return preloadPromise.finally(() => {
    if (onProgress) progressListeners.delete(onProgress)
  })
}
