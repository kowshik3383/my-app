import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";
import { generateAIResponse } from "@/lib/gemini";
import { generateVoice, VOICE_IDS } from "@/lib/elevenlabs";
import type { AIModulation } from "@/store/useStore";

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, message } = await request.json();

    if (!userId || !sessionId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");
    const messagesCollection = db.collection("messages");
    const sessionsCollection = db.collection("sessions");

    // Get user profile
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get conversation history
    const previousMessages = await messagesCollection
      .find({ sessionId: new ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .limit(20)
      .toArray();

    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Save user message
    await messagesCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(message, {
      role: user.aiRole as any,
      modulation: user.aiModulation as any,
      language: user.language as any,
      diseaseFocus: user.diseaseFocus as any,
      customTopic: user.customTopic || undefined,
      conversationHistory,
    });

    // Generate voice for AI response
    const voiceId = VOICE_IDS[user.aiModulation as AIModulation] || VOICE_IDS.professional;
    const audioUrl = await generateVoice(aiResponse, voiceId);

    // Save AI message
    const aiMessageResult = await messagesCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      userId: new ObjectId(userId),
      role: "assistant",
      content: aiResponse,
      audioUrl: audioUrl || null,
      createdAt: new Date(),
    });

    // Update session timestamp
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { updatedAt: new Date() } }
    );

    const aiMessage = await messagesCollection.findOne({
      _id: aiMessageResult.insertedId,
    });

    return NextResponse.json({
      message: {
        id: aiMessage?._id.toString(),
        role: aiMessage?.role,
        content: aiMessage?.content,
        audioUrl: aiMessage?.audioUrl,
        createdAt: aiMessage?.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
