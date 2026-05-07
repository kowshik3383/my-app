import { chatCompletionStream, type ChatMessage } from "./client";
import type { ModelTask } from "./models";

export function createStreamingResponse(
  messages: ChatMessage[],
  task: ModelTask = "fast_chat"
): ReadableStream<string> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chatCompletionStream({ messages, task })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}

export function createSSEStream(
  messages: ChatMessage[],
  task: ModelTask = "fast_chat"
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chatCompletionStream({ messages, task })) {
          const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        const data = `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`;
        controller.enqueue(encoder.encode(data));
      } finally {
        controller.close();
      }
    },
  });
}
