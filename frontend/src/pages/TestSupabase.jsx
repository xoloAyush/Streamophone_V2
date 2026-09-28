import { useState } from "react";
import { supabase } from "../lib/supabase";

const CHUNK_SIZE = 45 * 1024 * 1024; // 45MB, safe margin under the 50MB limit

const sanitizeFileName = (name) => {
  return name
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .replace(/_+/g, "_");
};

// Moved outside the component — clearly a pure utility, not render logic
const generateBaseName = (fileName) => {
  return `${Date.now()}-${sanitizeFileName(fileName)}`;
};

export default function TestSupabase() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      alert("Select a file first");
      return;
    }

    setIsProcessing(true);
    setUrl("");

    try {
      const baseName = generateBaseName(file.name);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const chunkPaths = [];

      for (let i = 0; i < totalChunks; i++) {
        setProgress(`Uploading chunk ${i + 1} of ${totalChunks}...`);

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const chunkName = `${baseName}.part${String(i).padStart(4, "0")}`;

        const { error } = await supabase.storage
          .from("meida")
          .upload(chunkName, chunk, { upsert: true });

        if (error) {
          console.log("CHUNK UPLOAD ERROR:", error);
          alert(`Chunk ${i + 1} failed: ${JSON.stringify(error, null, 2)}`);
          setIsProcessing(false);
          return;
        }

        chunkPaths.push(chunkName);
      }

      const { data: manifestData, error: manifestError } = await supabase
        .from("video_manifests")
        .insert({
          base_name: baseName,
          original_name: file.name,
          total_chunks: totalChunks,
          total_size: file.size,
          mime_type: file.type,
          chunk_paths: chunkPaths,
        })
        .select()
        .single();

      if (manifestError) {
        console.log("MANIFEST ERROR:", manifestError);
        alert(JSON.stringify(manifestError, null, 2));
        setIsProcessing(false);
        return;
      }

      console.log("Uploaded manifest:", manifestData);
      setProgress("Upload complete. Reassembling for preview...");

      const blob = await downloadAndReassemble(manifestData);
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setProgress("");
    } catch (err) {
      console.error("UPLOAD FLOW ERROR:", err);
      alert(`Something went wrong: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAndReassemble = async (manifest) => {
    const blobs = [];
    for (let i = 0; i < manifest.chunk_paths.length; i++) {
      setProgress(`Downloading chunk ${i + 1} of ${manifest.chunk_paths.length}...`);
      const { data, error } = await supabase.storage
        .from("meida")
        .download(manifest.chunk_paths[i]);

      if (error) throw error;
      blobs.push(data);
    }
    return new Blob(blobs, { type: manifest.mime_type });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Supabase Storage Test (Chunked Upload)</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={isProcessing}
      />

      <br /><br />

      <button onClick={uploadFile} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Upload"}
      </button>

      {progress && <p>{progress}</p>}

      {url && (
        <>
          <h3>File ready</h3>

          <a href={url} target="_blank" rel="noreferrer">
            Open File
          </a>

          <br /><br />

          {file?.type.startsWith("image") && (
            <img src={url} alt="" width="300" />
          )}

          {file?.type.startsWith("video") && (
            <video src={url} controls width="500" />
          )}
        </>
      )}
    </div>
  );
}