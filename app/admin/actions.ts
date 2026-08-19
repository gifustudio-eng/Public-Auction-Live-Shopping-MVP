"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CreateShowState = {
  error?: string;
  success?: string;
};

export async function createShow(
  _previousState: CreateShowState,
  formData: FormData,
): Promise<CreateShowState> {
  const title = String(formData.get("title") ?? "").trim();
  const scheduledDateValue = String(formData.get("scheduled_date") ?? "").trim();
  const scheduledTimeValue = String(formData.get("scheduled_time") ?? "").trim();
  const streamPlaybackUrl = String(
    formData.get("stream_playback_url") ?? "",
  ).trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title || !scheduledDateValue || !scheduledTimeValue) {
    return { error: "A show title and scheduled time are required." };
  }

  const scheduledDate = new Date(
    `${scheduledDateValue}T${scheduledTimeValue}:00+07:00`,
  );
  if (Number.isNaN(scheduledDate.getTime())) {
    return { error: "Enter a valid scheduled date and time." };
  }

  if (streamPlaybackUrl) {
    try {
      new URL(streamPlaybackUrl);
    } catch {
      return { error: "Enter a valid stream playback URL." };
    }
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims?.sub) {
    return { error: "Your session has expired. Please sign in again." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.claims.sub)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "You do not have permission to create shows." };
  }

  const { error } = await supabase.from("shows").insert({
    title,
    scheduled_at: scheduledDate.toISOString(),
    stream_playback_url: streamPlaybackUrl || null,
    notes: notes || null,
  });

  if (error) {
    console.error("Unable to create show:", error);
    return { error: "The show could not be created. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/shows");
  return { success: "Show created as a draft." };
}

export async function updateShow(
  _previousState: CreateShowState,
  formData: FormData,
): Promise<CreateShowState> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const scheduledDateValue = String(formData.get("scheduled_date") ?? "").trim();
  const scheduledTimeValue = String(formData.get("scheduled_time") ?? "").trim();
  const streamPlaybackUrl = String(formData.get("stream_playback_url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !title || !scheduledDateValue || !scheduledTimeValue) {
    return { error: "A show title and scheduled time are required." };
  }

  const scheduledDate = new Date(`${scheduledDateValue}T${scheduledTimeValue}:00+07:00`);
  if (Number.isNaN(scheduledDate.getTime())) {
    return { error: "Enter a valid scheduled date and time." };
  }

  if (streamPlaybackUrl) {
    try {
      new URL(streamPlaybackUrl);
    } catch {
      return { error: "Enter a valid stream playback URL." };
    }
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) return { error: "Your session has expired. Please sign in again." };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.claims.sub)
    .maybeSingle();
  if (profile?.role !== "admin") return { error: "You do not have permission to edit shows." };

  const { error } = await supabase
    .from("shows")
    .update({
      title,
      scheduled_at: scheduledDate.toISOString(),
      stream_playback_url: streamPlaybackUrl || null,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Unable to update show:", error);
    return { error: "The show could not be updated. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath("/shows");
  return { success: "Show updated." };
}

export async function deleteShow(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) return { error: "Your session has expired. Please sign in again." };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.claims.sub)
    .maybeSingle();
  if (profile?.role !== "admin") return { error: "You do not have permission to delete shows." };

  const { error } = await supabase.from("shows").delete().eq("id", id);
  if (error) {
    console.error("Unable to delete show:", error);
    return { error: "The show could not be deleted. It may still have related lots." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath("/shows");
  return {};
}
