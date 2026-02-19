import { NextRequest, NextResponse } from "next/server";
import { getDb, ObjectId } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aiRole, aiModulation, language, diseaseFocus, customTopic } = body;

    // Validate required fields
    if (!aiRole || !aiModulation || !language || !diseaseFocus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const user = {
      aiRole,
      aiModulation,
      language,
      diseaseFocus,
      customTopic: diseaseFocus === "custom" ? customTopic : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);

    return NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          ...user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, aiRole, aiModulation, language, diseaseFocus, customTopic } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const updateData = {
      aiRole,
      aiModulation,
      language,
      diseaseFocus,
      customTopic: diseaseFocus === "custom" ? customTopic : null,
      updatedAt: new Date(),
    };

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: result._id.toString(),
        ...result,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        ...user,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
