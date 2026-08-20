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

export type CreateLotState = { error?: string; success?: string };

export async function createLot(
  _previousState: CreateLotState,
  formData: FormData,
): Promise<CreateLotState> {
  const showId = String(formData.get("show_id") ?? "");
  const consignorId = String(formData.get("consignor_id") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price_idr"));
  const opensAtValue = String(formData.get("opens_at") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "Asia/Jakarta");
  const photos = ["image_link_1", "image_link_2", "image_link_3"]
    .map((field) => String(formData.get(field) ?? "").trim())
    .filter(Boolean);

  if (!showId || !consignorId || !code || !title || !Number.isFinite(price) || price < 0) {
    return { error: "Consignor, code, title, and a valid non-negative price are required." };
  }
  if (photos.some((photo) => !URL.canParse(photo))) {
    return { error: "Each image link must be a valid URL." };
  }

  let opensAt: string | null = null;
  if (opensAtValue) {
    const offset = timezone === "UTC" ? "Z" : "+07:00";
    const date = new Date(`${opensAtValue}:00${offset}`);
    if (Number.isNaN(date.getTime())) return { error: "Enter a valid opening date and time." };
    opensAt = date.toISOString();
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) return { error: "Your session has expired. Please sign in again." };
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.claims.sub)
    .maybeSingle();
  if (profile?.role !== "admin") return { error: "You do not have permission to create lots." };

  const { data: lastLot } = await supabase
    .from("lots")
    .select("seq")
    .eq("show_id", showId)
    .order("seq", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("lots").insert({
    show_id: showId,
    consignor_id: consignorId,
    code,
    title,
    description: description || null,
    photos,
    price_idr: price,
    seq: (lastLot?.seq ?? -1) + 1,
    opens_at: opensAt,
  });
  if (error) {
    console.error("Unable to create lot:", error);
    return { error: "The lot could not be created. Its code may already be used for this show." };
  }

  revalidatePath(`/admin/shows/${showId}`);
  revalidatePath(`/shows/${showId}`);
  return { success: "Lot created as pending." };
}

export async function deleteLot(
  lotId: string,
  showId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims?.sub) return { error: "Your session has expired. Please sign in again." };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.claims.sub)
    .maybeSingle();
  if (profile?.role !== "admin") return { error: "You do not have permission to delete lots." };

  const { error } = await supabase
    .from("lots")
    .delete()
    .eq("id", lotId)
    .eq("show_id", showId);
  if (error) {
    console.error("Unable to delete lot:", error);
    return { error: "The lot could not be deleted. Please try again." };
  }

  revalidatePath(`/admin/shows/${showId}`);
  revalidatePath(`/shows/${showId}`);
  return {};
}
