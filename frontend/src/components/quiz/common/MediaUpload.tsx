
import { X } from 'lucide-react';

interface MediaUploadProps {
  mediaType: string;
  mediaUrl: string;
  onMediaTypeChange: (type: string) => void;
  onMediaUpload: (file: File) => void;
  onRemoveMedia: () => void;
}

export function MediaUpload({
  mediaType,
  mediaUrl,
  onMediaTypeChange,
  onMediaUpload,
  onRemoveMedia
}: MediaUploadProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">Media (Pilihan)</label>
      <div className="flex gap-2 mb-2">
        {["audio", "image", "video", "text"].map((type) => (
          <button
            key={type}
            onClick={() => onMediaTypeChange(type)}
            className={`px-3 py-1 rounded capitalize ${mediaType === type ? "bg-blue-500 text-white" : "bg-slate-200"}`}
          >
            {type === "audio" ? "Audio" : type === "image" ? "Gambar" : type === "video" ? "Video" : "Teks"}
          </button>
        ))}
        {mediaType && (
          <button
            onClick={onRemoveMedia}
            className="px-3 py-1 rounded bg-red-500 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {mediaType && mediaType !== "text" && (
        <div className="mt-2">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onMediaUpload(file)
            }}
            accept={
              mediaType === "image"
                ? "image/*"
                : mediaType === "audio"
                  ? "audio/*"
                  : "video/*"
            }
            className="mb-2"
          />
          {mediaUrl && (
            <>
              {mediaType === "image" && (
                <img src={mediaUrl || "/placeholder.svg"} alt="Preview" className="max-w-xs rounded" />
              )}
              {mediaType === "audio" && <audio src={mediaUrl} controls className="w-full" />}
              {mediaType === "video" && (
                <video src={mediaUrl} controls className="max-w-md rounded" />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
