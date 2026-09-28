import express from "express";
import upload from "../middleware/upload.middleware.js";
import {
  uploadSimple,
  uploadChunk,
  finalizeUpload,
} from "../controllers/upload.controller.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";

const router = express.Router();

router.post("/simple", upload.single("media"), uploadSimple);
// upload.routes.js
router.post("/chunk", (req, res, next) => {
  upload.single("chunk")(req, res, (err) => {
    if (err) {
      console.error("MULTER CHUNK ERROR:", err.message);
      return res.status(400).json({ error: `Chunk too large or malformed: ${err.message}` });
    }
    next();
  });
}, uploadChunk);
router.post("/finalize", express.json(), finalizeUpload);

// router.get("/media/:manifestId", async (req, res) => {
//   const { manifestId } = req.params;

//   const { data: manifest, error } = await supabaseAdmin
//     .from("video_manifests")
//     .select("*")
//     .eq("id", manifestId)
//     .single();

//   if (error || !manifest) return res.status(404).send("Not found");

//   res.setHeader("Content-Type", manifest.mime_type);
//   res.setHeader("Content-Length", manifest.total_size);

//   try {
//     for (const chunkPath of manifest.chunk_paths) {
//       const { data: blob, error: dlError } = await supabaseAdmin.storage
//         .from("meida")
//         .download(chunkPath);

//       if (dlError) throw dlError;

//       const buffer = Buffer.from(await blob.arrayBuffer());
//       const ok = res.write(buffer);
//       if (!ok) await new Promise((resolve) => res.once("drain", resolve));
//     }
//     res.end();
//   } catch (err) {
//     console.error("STREAM ERROR:", err);
//     if (!res.headersSent) res.status(500).send("Stream failed");
//     else res.destroy(err);
//   }
// });

router.get("/media/:manifestId", async (req, res) => {
  const { manifestId } = req.params;

  const { data: manifest, error } = await supabaseAdmin
    .from("video_manifests")
    .select("*")
    .eq("id", manifestId)
    .single();

  if (error || !manifest) return res.status(404).send("Not found");

  const totalSize = manifest.total_size;
  const chunkSize = 45 * 1024 * 1024; // must match your upload CHUNK_SIZE
  const range = req.headers.range;

  if (!range) {
    // No range requested — fall back to full sequential stream (your existing behavior)
    res.setHeader("Content-Type", manifest.mime_type);
    res.setHeader("Content-Length", totalSize);
    res.setHeader("Accept-Ranges", "bytes");

    try {
      for (const chunkPath of manifest.chunk_paths) {
        const { data: blob, error: dlError } = await supabaseAdmin.storage
          .from("meida")
          .download(chunkPath);
        if (dlError) throw dlError;
        const buffer = Buffer.from(await blob.arrayBuffer());
        const ok = res.write(buffer);
        if (!ok) await new Promise((resolve) => res.once("drain", resolve));
      }
      res.end();
    } catch (err) {
      console.error("STREAM ERROR:", err);
      if (!res.headersSent) res.status(500).send("Stream failed");
      else res.destroy(err);
    }
    return;
  }

  // Parse "bytes=start-end"
  const match = range.match(/bytes=(\d+)-(\d*)/);
  if (!match) return res.status(416).send("Invalid range");

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
  const requestedLength = end - start + 1;

  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Length", requestedLength);
  res.setHeader("Content-Type", manifest.mime_type);

  try {
    // Which chunks overlap [start, end]?
    const firstChunkIdx = Math.floor(start / chunkSize);
    const lastChunkIdx = Math.floor(end / chunkSize);

    for (let i = firstChunkIdx; i <= lastChunkIdx; i++) {
      const chunkPath = manifest.chunk_paths[i];
      const { data: blob, error: dlError } = await supabaseAdmin.storage
        .from("meida")
        .download(chunkPath);
      if (dlError) throw dlError;

      let buffer = Buffer.from(await blob.arrayBuffer());

      const chunkStart = i * chunkSize;
      const chunkEnd = chunkStart + buffer.length - 1;

      // Trim buffer to only the portion that falls inside [start, end]
      const sliceStart = Math.max(0, start - chunkStart);
      const sliceEnd = Math.min(buffer.length, end - chunkStart + 1);

      buffer = buffer.subarray(sliceStart, sliceEnd);

      const ok = res.write(buffer);
      if (!ok) await new Promise((resolve) => res.once("drain", resolve));
    }
    res.end();
  } catch (err) {
    console.error("RANGE STREAM ERROR:", err);
    if (!res.headersSent) res.status(500).send("Range stream failed");
    else res.destroy(err);
  }
});

export default router;