import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const sessionsCollection = db.collection("sessions");

    const session = {
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await sessionsCollection.insertOne(session);

    return NextResponse.json(
      {
        session: {
          id: result.insertedId.toString(),
          ...session,
          userId: userId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    const db = await getDb();

    if (sessionId) {
      // Get specific session with messages
      const sessionsCollection = db.collection("sessions");
      const messagesCollection = db.collection("messages");

      const session = await sessionsCollection.findOne({
        _id: new ObjectId(sessionId),
      });

      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      const messages = await messagesCollection
        .find({ sessionId: new ObjectId(sessionId) })
        .sort({ createdAt: 1 })
        .toArray();

      return NextResponse.json({
        session: {
          id: session._id.toString(),
          ...session,
          messages: messages.map((msg) => ({
            id: msg._id.toString(),
            ...msg,
            sessionId: msg.sessionId.toString(),
            userId: msg.userId.toString(),
          })),
        },
      });
    }

    if (userId) {
      // Get all sessions for user
      const sessionsCollection = db.collection("sessions");
      const messagesCollection = db.collection("messages");

      const sessions = await sessionsCollection
        .find({ userId: new ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .toArray();

      const sessionsWithMessages = await Promise.all(
        sessions.map(async (session) => {
          const lastMessage = await messagesCollection
            .find({ sessionId: session._id })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

          return {
            id: session._id.toString(),
            ...session,
            userId: session.userId.toString(),
            messages: lastMessage.map((msg) => ({
              id: msg._id.toString(),
              ...msg,
              sessionId: msg.sessionId.toString(),
              userId: msg.userId.toString(),
            })),
          };
        })
      );

      return NextResponse.json({ sessions: sessionsWithMessages });
    }

    return NextResponse.json(
      { error: "User ID or Session ID is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
