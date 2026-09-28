import { supabaseAdmin } from "../config/supabaseAdmin.js";

const BUCKET = "meida";
const CHUNK_SIZE = 45 * 1024 * 1024;

const sanitizeFileName = (name) =>
  name.replace(/[^a-zA-Z0-9.\-_]/g, "_").replace(/_+/g, "_");

// --- Simple upload: small files go straight to Supabase, return a URL ---
export const uploadSimple = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const filePath = `${Date.now()}-${sanitizeFileName(req.file.originalname)}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

    return res.json({
      url: data.publicUrl,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    console.error("SIMPLE UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

// --- Chunk upload: one piece of a large file, forwarded to Supabase ---
export const uploadChunk = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No chunk provided" });

    const { uploadId, chunkIndex } = req.body;
    if (!uploadId || chunkIndex === undefined) {
      return res.status(400).json({ error: "Missing uploadId or chunkIndex" });
    }

    const chunkPath = `chunks/${uploadId}.part${String(chunkIndex).padStart(4, "0")}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(chunkPath, req.file.buffer, { upsert: true });

    if (error) throw error;

    return res.json({ chunkPath });
  } catch (err) {
    console.error("CHUNK UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Chunk upload failed" });
  }
};

// --- Finalize: all chunks uploaded, write the manifest row ---
export const finalizeUpload = async (req, res) => {
  try {
    const { uploadId, originalName, mimeType, totalSize, totalChunks } = req.body;

    if (!uploadId || !totalChunks) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const chunkPaths = Array.from({ length: Number(totalChunks) }, (_, i) =>
      `chunks/${uploadId}.part${String(i).padStart(4, "0")}`
    );

    const { data: manifest, error } = await supabaseAdmin
      .from("video_manifests")
      .insert({
        base_name: uploadId,
        original_name: originalName,
        total_chunks: Number(totalChunks),
        total_size: Number(totalSize),
        mime_type: mimeType,
        chunk_paths: chunkPaths,
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({ manifestId: manifest.id });
  } catch (err) {
    console.error("FINALIZE ERROR:", err);
    return res.status(500).json({ error: "Finalize failed" });
  }
};