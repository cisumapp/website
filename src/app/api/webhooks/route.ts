import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  markAppUserDeletedFromClerkUser,
  upsertAppUserFromClerkUser,
} from "@/lib/supabase/app-users";

export async function POST(req: NextRequest) {
  let event: WebhookEvent;

  try {
    event = await verifyWebhook(req);
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertAppUserFromClerkUser(event.data);
    }

    if (event.type === "user.deleted") {
      if (!event.data.id) {
        throw new Error("Clerk delete webhook did not include a user id");
      }

      await markAppUserDeletedFromClerkUser(event.data.id);
    }
  } catch (error) {
    console.error("Clerk webhook sync failed", {
      eventType: event.type,
      error,
    });
    return new Response("Webhook sync failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}