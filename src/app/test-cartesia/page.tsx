"use client"
import { useState } from "react";
import { generateCartesiaAudio } from "@/lib/cartesia";

export default function TestCartesiaPage() {
  const [text, setText] = useState("Hello, this is a test of the Cartesia TTS system.");
  const [voice, setVoice] = useState<"soft_caring" | "strict_motivational" | "professional" | "energetic" | "calm">("soft_caring");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      console.log("Generating Cartesia audio for voice:", voice);
      const result = await generateCartesiaAudio(text, voice);
      console.log("Cartesia audio generated successfully:", !!result);
      setAudioUrl(result);
    } catch (err) {
      console.error("Cartesia voice generation failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (audioUrl) {
      console.log("Playing Cartesia audio:", audioUrl.substring(0, 50) + "...");
      const audio = new Audio(audioUrl);
      audio.muted = isMuted;
      audio.play().catch((err) => console.error("Audio playback failed:", err));
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Cartesia TTS Test Page</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <label>
          Text to synthesize:
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "100%", height: "80px", marginTop: "5px" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Voice:
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value as any)}
            style={{ marginLeft: "10px" }}
          >
            <option value="soft_caring">Soft Caring</option>
            <option value="strict_motivational">Strict Motivational</option>
            <option value="professional">Professional</option>
            <option value="energetic">Energetic</option>
            <option value="calm">Calm</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: "10px 20px",
            backgroundColor: isGenerating ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isGenerating ? "not-allowed" : "pointer"
          }}
        >
          {isGenerating ? "Generating..." : "Generate Audio"}
        </button>

        {audioUrl && (
          <button
            onClick={handlePlay}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Play Audio
          </button>
        )}

        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: isMuted ? "#dc3545" : "#ffc107",
            color: isMuted ? "white" : "#212529",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isMuted ? "Unmute" : "Mute"} Audio
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          Error: {error}
        </div>
      )}

      {audioUrl && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Audio Generated Successfully!</h3>
          <p>Audio URL length: {audioUrl.length} characters</p>
          <p>MIME Type: {audioUrl.split(",")[0]}</p>
        </div>
      )}

      <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h3>Debug Information</h3>
        <p>Open the browser console to see detailed logging:</p>
        <ul>
          <li>Cartesia API response status</li>
          <li>Audio generation success/failure</li>
          <li>Audio playback attempts</li>
        </ul>
      </div>
    </div>
  );
}