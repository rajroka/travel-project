"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Cancel01Icon, Upload06Icon } from "hugeicons-react";

interface Props {
  value: string; // current image URL
  onChange: (url: string, fileId?: string) => void;
  folder?: string; // imagekit folder, e.g. "destinations"
  label?: string;
  aspectRatio?: string; // tailwind aspect-ratio class
}

export default function ImageUpload({
  value,
  onChange,
  folder = "general",
  label = "Upload Image",
  aspectRatio = "aspect-video",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Max file size is 10 MB.");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("category", folder);

      setProgress(50);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      setProgress(90);

      const json = await res.json() as {
        success: boolean;
        message?: string;
        data?: { url: string; fileId: string };
      };

      if (!json.success || !json.data) {
        setError(json.message ?? `Upload failed (${res.status}).`);
        return;
      }

      onChange(json.data.url, json.data.fileId);
      setProgress(100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function clear() { onChange("", ""); }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      {value ? (
        /* ── preview ────────────────────────────────────────────────── */
        <div className={`relative w-full overflow-hidden rounded-xl ${aspectRatio}`}>
          <Image src={value} alt="Uploaded" fill className="object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
            title="Remove image"
          >
            <Cancel01Icon size={14} />
          </button>
        </div>
      ) : (
        /* ── drop zone ──────────────────────────────────────────────── */
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
            uploading
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          } ${aspectRatio} min-h-[120px]`}
        >
          <Upload06Icon size={28} className={uploading ? "text-blue-500" : "text-gray-400"} />
          <p className="text-xs text-gray-500">
            {uploading ? "Uploading…" : "Click or drag & drop"}
          </p>
          <p className="text-xs text-gray-400">JPEG, PNG, WebP · max 10 MB</p>

          {/* progress bar */}
          {uploading && progress > 0 && (
            <div className="absolute bottom-0 left-0 h-1 w-full rounded-b-xl bg-gray-200">
              <div
                className="h-full rounded-b-xl bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInput}
      />
    </div>
  );
}
