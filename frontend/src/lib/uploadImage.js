const API_BASE = "http://localhost:5000";
const CHUNK_SIZE = 45 * 1024 * 1024; // 45MB
const SIMPLE_THRESHOLD = 45 * 1024 * 1024;

const uploadSimple = async (file) => {
  const formData = new FormData();
  formData.append("media", file);

  const res = await fetch(`${API_BASE}/api/upload/simple`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Simple upload failed");
  return res.json(); // { url, fileName, mimeType, size }
};

const uploadChunked = async (file, onProgress) => {
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("uploadId", uploadId);
    formData.append("chunkIndex", i);

    const res = await fetch(`${API_BASE}/api/upload/chunk`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error(`Chunk ${i + 1} failed`);

    if (onProgress) onProgress(Math.round(((i + 1) / totalChunks) * 100));
  }

  const finalizeRes = await fetch(`${API_BASE}/api/upload/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uploadId,
      originalName: file.name,
      mimeType: file.type,
      totalSize: file.size,
      totalChunks,
    }),
  });

  if (!finalizeRes.ok) throw new Error("Finalize failed");
  const { manifestId } = await finalizeRes.json();

  return {
    manifestId,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
};

export const uploadImage = async (file, onProgress) => {
  if (!file) throw new Error("No file provided");

  return file.size > SIMPLE_THRESHOLD
    ? uploadChunked(file, onProgress)
    : uploadSimple(file);
};