const fetch = require('node-fetch');

async function testCartesiaAPI() {
  const text = "Hello, this is a test of the Cartesia TTS system.";
  const voice = "soft_caring";
  const apiKey = process.env.CARTESIA_API_KEY;

  if (!apiKey) {
    console.error("CARTESIA_API_KEY is not set");
    return;
  }

  try {
    console.log("Testing Cartesia API...");
    console.log("API Key:", apiKey.substring(0, 10) + "...");
    
    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Cartesia-Version": "2026-03-01",
      },
      body: JSON.stringify({
        model_id: "sonic-2",
        transcript: text,
        voice: {
          mode: "id",
          id: "694f9389-aac1-45b6-b726-9d9369183238", // Warm Female
        },
        output_format: {
          container: "mp3",
          encoding: "mp3",
          sample_rate: 44100,
        },
      }),
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cartesia API error response:", errorText);
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Audio buffer size:", audioBuffer.byteLength);
    
    const base64 = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64}`;
    
    console.log("Audio URL length:", audioUrl.length);
    console.log("Audio URL preview:", audioUrl.substring(0, 100) + "...");
    console.log("✅ Cartesia API is working correctly!");
    
  } catch (error) {
    console.error("❌ Cartesia API test failed:", error);
  }
}

testCartesiaAPI();