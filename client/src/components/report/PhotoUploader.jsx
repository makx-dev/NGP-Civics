import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ImagePlus, Trash2, Replace, Loader2, Upload } from 'lucide-react'

export default function PhotoUploader({ files, onFilesChange, errors }) {
  const [loadingIds, setLoadingIds] = useState(new Set())

  const onDrop = useCallback(
    (acceptedFiles) => {
      const remaining = 5 - files.length
      if (remaining <= 0) return
      const toAdd = acceptedFiles.slice(0, remaining)
      const newFiles = toAdd.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file), uid: `${Date.now()}-${Math.random().toString(36).slice(2)}` })
      )
      onFilesChange([...files, ...newFiles])
    },
    [files, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, open } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 5,
    noClick: true,
    noKeyboard: true,
    disabled: files.length >= 5,
  })

  const removeFile = (uid) => {
    const file = files.find((f) => f.uid === uid)
    if (file?.preview) URL.revokeObjectURL(file.preview)
    onFilesChange(files.filter((f) => f.uid !== uid))
  }

  const replaceFile = (uid) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.png,.jpg,.jpeg,.webp'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      setLoadingIds((prev) => new Set(prev).add(uid))
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
        uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      })
      // simulate upload delay
      setTimeout(() => {
        removeFile(uid)
        onFilesChange([...files.filter((f) => f.uid !== uid), newFile])
        setLoadingIds((prev) => {
          const next = new Set(prev)
          next.delete(uid)
          return next
        })
      }, 400)
    }
    input.click()
  }

  const remaining = 5 - files.length

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Upload Photos</h3>
        <p className="mt-1 text-sm text-slate-400">
          Show the issue clearly. PNG, JPG, or WEBP. Max 5 photos, 5MB each.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-12 ${
          isDragAccept
            ? 'border-blue-500 bg-blue-500/5'
            : isDragReject
              ? 'border-red-500 bg-red-500/5'
              : isDragActive
                ? 'border-blue-400 bg-blue-500/5'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
        } ${files.length >= 5 ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
          {isDragActive ? (
            <Upload size={28} className="text-blue-400" />
          ) : (
            <ImagePlus size={28} className="text-slate-400" />
          )}
        </div>
        {isDragActive ? (
          <p className="text-base font-medium text-blue-400">Drop your photos here</p>
        ) : (
          <>
            <p className="text-base font-medium text-slate-300">
              Drag & drop photos here
            </p>
            <p className="mt-2 text-sm text-slate-500">or</p>
          </>
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              open()
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
          >
            <ImagePlus size={16} />
            Browse Files
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.png,.jpg,.jpeg,.webp'
              input.capture = 'environment'
              input.onchange = (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const newFile = Object.assign(file, {
                  preview: URL.createObjectURL(file),
                  uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                })
                onFilesChange([...files, newFile])
              }
              input.click()
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700"
          >
            <Camera size={16} />
            Camera
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-600">
          {remaining > 0 ? `${remaining} photo${remaining !== 1 ? 's' : ''} remaining` : 'Maximum photos reached'}
        </p>
      </div>

      {errors?.photos && (
        <p className="text-sm text-red-400">{errors.photos.message || errors.photos}</p>
      )}

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <motion.div
                key={file.uid}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-700 bg-slate-900"
              >
                <img
                  src={file.preview || URL.createObjectURL(file)}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onLoad={(e) => {
                    if (file.preview && !file.preview.startsWith('blob:')) {
                      URL.revokeObjectURL(file.preview)
                    }
                  }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => replaceFile(file.uid)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700"
                    title="Replace"
                  >
                    <Replace size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(file.uid)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/80 text-white transition-colors hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {/* Loading overlay */}
                <AnimatePresence>
                  {loadingIds.has(file.uid) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/70"
                    >
                      <Loader2 size={24} className="animate-spin text-blue-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* File size badge */}
                <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}