/* eslint-disable @typescript-eslint/no-explicit-any */
import md5 from "blueimp-md5";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { findAppUserByClerkUserId } from "@/lib/supabase/app-users";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_AUTH_URL = "https://www.last.fm/api/auth/";

type LastFmConfig = {
  apiKey: string;
  sharedSecret: string;
};

export type LastFmPlaybackPayload = {
  mediaId: string;
  title: string;
  artist: string;
  album?: string | null;
  artworkUrl?: string | null;
  trackNumber?: number | null;
  durationSeconds?: number | null;
  contextUrl?: string | null;
  mbid?: string | null;
  albumArtist?: string | null;
  playedAt?: string | number | Date | null;
};

export type LastFmConnectionStatus = {
  connected: boolean;
  lastfmUsername: string | null;
  connectedAt: string | null;
  pendingFlowId: string | null;
  pendingFlowExpiresAt: string | null;
};

type LastFmServiceSession = {
  session: {
    name: string;
    key: string;
    subscriber: boolean;
  };
};

type LastFmConnectionRecord = {
  id: string;
  app_user_id: string;
  lastfm_username: string;
  lastfm_session_key: string;
  connected_at: string;
  created_at: string;
  updated_at: string;
};

type LastFmConnectionFlowRecord = {
  id: string;
  app_user_id: string;
  request_token: string;
  status: "pending" | "completed" | "expired" | "cancelled";
  expires_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export class LastFmHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "LastFmHttpError";
  }
}

function getLastFmConfig(): LastFmConfig {
  const apiKey = process.env.LASTFM_API_KEY?.trim();
  const sharedSecret = process.env.LASTFM_SHARED_SECRET?.trim();

  if (!apiKey) {
    throw new LastFmHttpError(500, "Missing LASTFM_API_KEY");
  }

  if (!sharedSecret) {
    throw new LastFmHttpError(500, "Missing LASTFM_SHARED_SECRET");
  }

  return { apiKey, sharedSecret };
}

function normalizeParams(
  params: Record<string, string | number | boolean | null | undefined>
) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value)])
  ) as Record<string, string>;
}

function buildLastFmSignature(params: Record<string, string>, sharedSecret: string) {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");

  return md5(signatureBase + sharedSecret);
}

function buildLastFmAuthorizeUrl(apiKey: string, token: string) {
  const url = new URL(LASTFM_AUTH_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("token", token);
  return url.toString();
}

async function parseLastFmResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new LastFmHttpError(
      response.status,
      `Last.fm returned a non-JSON response (${response.status})`
    );
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message ?? "Last.fm request failed")
        : `Last.fm request failed (${response.status})`;

    throw new LastFmHttpError(response.status, errorMessage);
  }

  return data as T;
}

async function callLastFmGet<T>(coreParams: Record<string, string | number | boolean | null | undefined>) {
  const { apiKey, sharedSecret } = getLastFmConfig();
  const signedParams = normalizeParams({
    ...coreParams,
    api_key: apiKey,
  });
  const apiSig = buildLastFmSignature(signedParams, sharedSecret);

  const url = new URL(LASTFM_API_URL);
  url.searchParams.set("format", "json");

  for (const [key, value] of Object.entries(signedParams)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("api_sig", apiSig);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  return parseLastFmResponse<T>(response);
}

async function callLastFmPost<T>(coreParams: Record<string, string | number | boolean | null | undefined>) {
  const { apiKey, sharedSecret } = getLastFmConfig();
  const signedParams = normalizeParams({
    ...coreParams,
    api_key: apiKey,
  });
  const apiSig = buildLastFmSignature(signedParams, sharedSecret);

  const bodyParams = new URLSearchParams();
  for (const [key, value] of Object.entries(signedParams)) {
    bodyParams.set(key, value);
  }
  bodyParams.set("api_sig", apiSig);

  const url = new URL(LASTFM_API_URL);
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyParams,
  });

  return parseLastFmResponse<T>(response);
}

async function requestLastFmToken() {
  const response = await callLastFmGet<{ token: string }>({
    method: "auth.gettoken",
  });

  if (!response.token) {
    throw new LastFmHttpError(502, "Last.fm did not return an auth token");
  }

  return response.token;
}

async function exchangeLastFmSession(token: string) {
  const response = await callLastFmGet<LastFmServiceSession>({
    method: "auth.getsession",
    token,
  });

  if (!response.session?.key || !response.session?.name) {
    throw new LastFmHttpError(502, "Last.fm did not return a usable session");
  }

  return response.session;
}

function playedAtToTimestamp(playedAt: LastFmPlaybackPayload["playedAt"]) {
  if (!playedAt) {
    return Math.floor(Date.now() / 1000);
  }

  if (playedAt instanceof Date) {
    return Math.floor(playedAt.getTime() / 1000);
  }

  if (typeof playedAt === "number") {
    return playedAt > 1_000_000_000_000 ? Math.floor(playedAt / 1000) : Math.floor(playedAt);
  }

  const parsed = Date.parse(playedAt);
  return Number.isNaN(parsed) ? Math.floor(Date.now() / 1000) : Math.floor(parsed / 1000);
}

function toOptionalString(value: string | number | boolean | null | undefined) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

async function resolveSignedInAppUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new LastFmHttpError(401, "Not signed in");
  }

  const appUser = await findAppUserByClerkUserId(userId);

  if (!appUser) {
    throw new LastFmHttpError(404, "cisum account is not synced yet");
  }

  return appUser;
}

async function getActiveLastFmConnection(appUserId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lastfm_connections")
    .select("*")
    .eq("app_user_id", appUserId)
    .maybeSingle();

  if (error) {
    throw new LastFmHttpError(500, `Failed to load Last.fm connection: ${error.message}`);
  }

  return data as LastFmConnectionRecord | null;
}

async function getLatestPendingFlow(appUserId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lastfm_connection_flows")
    .select("*")
    .eq("app_user_id", appUserId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new LastFmHttpError(500, `Failed to load Last.fm flow: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const flow = data as LastFmConnectionFlowRecord;
  if (new Date(flow.expires_at).getTime() <= Date.now()) {
    await supabase
      .from("lastfm_connection_flows")
      .update({ status: "expired" })
      .eq("id", flow.id);
    return null;
  }

  return flow;
}

async function createConnectionFlow(appUserId: string, requestToken: string) {
  const supabase = getSupabaseAdminClient();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("lastfm_connection_flows")
    .insert({
      app_user_id: appUserId,
      request_token: requestToken,
      expires_at: expiresAt,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new LastFmHttpError(500, `Failed to store Last.fm flow: ${error.message}`);
  }

  return data as LastFmConnectionFlowRecord;
}

async function upsertConnection(
  appUserId: string,
  lastfmUsername: string,
  sessionKey: string
) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("lastfm_connections")
    .upsert(
      {
        app_user_id: appUserId,
        lastfm_username: lastfmUsername,
        lastfm_session_key: sessionKey,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "app_user_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new LastFmHttpError(500, `Failed to persist Last.fm connection: ${error.message}`);
  }

  return data as LastFmConnectionRecord;
}

function buildTrackParams(payload: LastFmPlaybackPayload) {
  const title = payload.title.trim();
  const artist = payload.artist.trim();

  if (!title || !artist) {
    throw new LastFmHttpError(400, "Missing track title or artist");
  }

  return normalizeParams({
    artist,
    track: title,
    album: toOptionalString(payload.album),
    context: toOptionalString(payload.contextUrl),
    trackNumber: payload.trackNumber ?? undefined,
    mbid: toOptionalString(payload.mbid),
    albumArtist: toOptionalString(payload.albumArtist),
    duration: payload.durationSeconds ?? undefined,
  });
}

async function submitTrackUpdate(
  method: "track.updateNowPlaying" | "track.scrobble",
  payload: LastFmPlaybackPayload,
  sessionKey: string
) {
  const coreParams = {
    method,
    sk: sessionKey,
    ...buildTrackParams(payload),
  };

  if (method === "track.scrobble") {
    const timestamp = playedAtToTimestamp(payload.playedAt);
    return callLastFmPost<{ ignored?: number[] }>(
      normalizeParams({
        ...coreParams,
        timestamp,
      })
    );
  }

  return callLastFmPost<{ nowplaying?: unknown }>(normalizeParams(coreParams));
}

export async function getLastFmConnectionStatusForSignedInUser(): Promise<LastFmConnectionStatus> {
  const appUser = await resolveSignedInAppUser();
  const [connection, flow] = await Promise.all([
    getActiveLastFmConnection(appUser.id),
    getLatestPendingFlow(appUser.id),
  ]);

  return {
    connected: Boolean(connection),
    lastfmUsername: connection?.lastfm_username ?? null,
    connectedAt: connection?.connected_at ?? null,
    pendingFlowId: flow?.id ?? null,
    pendingFlowExpiresAt: flow?.expires_at ?? null,
  };
}

export async function startLastFmConnectionForSignedInUser() {
  const appUser = await resolveSignedInAppUser();
  const token = await requestLastFmToken();
  const flow = await createConnectionFlow(appUser.id, token);
  const { apiKey } = getLastFmConfig();

  return {
    flowId: flow.id,
    authorizeUrl: buildLastFmAuthorizeUrl(apiKey, token),
    expiresAt: flow.expires_at,
  };
}

export async function completeLastFmConnectionForSignedInUser(flowId: string) {
  const appUser = await resolveSignedInAppUser();
  const supabase = getSupabaseAdminClient();

  const { data: flow, error } = await supabase
    .from("lastfm_connection_flows")
    .select("*")
    .eq("id", flowId)
    .eq("app_user_id", appUser.id)
    .maybeSingle();

  if (error) {
    throw new LastFmHttpError(500, `Failed to load Last.fm flow: ${error.message}`);
  }

  if (!flow) {
    throw new LastFmHttpError(404, "Last.fm connection flow not found");
  }

  const typedFlow = flow as LastFmConnectionFlowRecord;
  if (typedFlow.status !== "pending") {
    throw new LastFmHttpError(409, "Last.fm connection flow is no longer pending");
  }

  if (new Date(typedFlow.expires_at).getTime() <= Date.now()) {
    await supabase
      .from("lastfm_connection_flows")
      .update({ status: "expired" })
      .eq("id", typedFlow.id);
    throw new LastFmHttpError(410, "Last.fm connection flow has expired");
  }

  const session = await exchangeLastFmSession(typedFlow.request_token);
  const connection = await upsertConnection(appUser.id, session.name, session.key);

  await supabase
    .from("lastfm_connection_flows")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", typedFlow.id);

  return {
    connected: true,
    lastfmUsername: connection.lastfm_username,
    connectedAt: connection.connected_at,
  };
}

export async function disconnectLastFmConnectionForSignedInUser() {
  const appUser = await resolveSignedInAppUser();
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("lastfm_connections")
    .delete()
    .eq("app_user_id", appUser.id);

  if (error) {
    throw new LastFmHttpError(500, `Failed to disconnect Last.fm: ${error.message}`);
  }

  await supabase
    .from("lastfm_connection_flows")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("app_user_id", appUser.id)
    .eq("status", "pending");

  return { connected: false };
}

async function getConnectionSessionKeyForSignedInUser() {
  const appUser = await resolveSignedInAppUser();
  const connection = await getActiveLastFmConnection(appUser.id);

  if (!connection) {
    throw new LastFmHttpError(409, "Last.fm is not connected for this user");
  }

  return connection.lastfm_session_key;
}

export async function submitLastFmNowPlayingForSignedInUser(payload: LastFmPlaybackPayload) {
  const sessionKey = await getConnectionSessionKeyForSignedInUser();
  await submitTrackUpdate("track.updateNowPlaying", payload, sessionKey);
  return { ok: true };
}

export async function submitLastFmScrobbleForSignedInUser(payload: LastFmPlaybackPayload) {
  const sessionKey = await getConnectionSessionKeyForSignedInUser();
  await submitTrackUpdate("track.scrobble", payload, sessionKey);
  return { ok: true };
}

// --- TRACK ENDPOINTS ---

export type LastFmTrackInfoParams = {
  track?: string;
  artist?: string;
  mbid?: string;
  username?: string;
  autocorrect?: boolean | number;
};

export async function getLastFmTrackInfo(params: LastFmTrackInfoParams) {
  return callLastFmGet<any>({
    method: "track.getInfo",
    track: params.track,
    artist: params.artist,
    mbid: params.mbid,
    username: params.username,
    autocorrect: params.autocorrect ? "1" : "0",
  });
}

export type LastFmTrackSearchParams = {
  track: string;
  artist?: string;
  limit?: number;
  page?: number;
};

export async function searchLastFmTrack(params: LastFmTrackSearchParams) {
  return callLastFmGet<any>({
    method: "track.search",
    track: params.track,
    artist: params.artist,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
  });
}

export type LastFmTrackSimilarParams = {
  track?: string;
  artist?: string;
  mbid?: string;
  limit?: number;
  autocorrect?: boolean | number;
};

export async function getSimilarLastFmTracks(params: LastFmTrackSimilarParams) {
  return callLastFmGet<any>({
    method: "track.getSimilar",
    track: params.track,
    artist: params.artist,
    mbid: params.mbid,
    limit: params.limit?.toString(),
    autocorrect: params.autocorrect ? "1" : "0",
  });
}

export async function loveLastFmTrackForSignedInUser(track: string, artist: string) {
  const sessionKey = await getConnectionSessionKeyForSignedInUser();
  return callLastFmPost<any>({
    method: "track.love",
    track,
    artist,
    sk: sessionKey,
  });
}

export async function unloveLastFmTrackForSignedInUser(track: string, artist: string) {
  const sessionKey = await getConnectionSessionKeyForSignedInUser();
  return callLastFmPost<any>({
    method: "track.unlove",
    track,
    artist,
    sk: sessionKey,
  });
}

// --- ARTIST ENDPOINTS ---

export type LastFmArtistInfoParams = {
  artist?: string;
  mbid?: string;
  lang?: string;
  username?: string;
  autocorrect?: boolean | number;
};

export async function getLastFmArtistInfo(params: LastFmArtistInfoParams) {
  return callLastFmGet<any>({
    method: "artist.getInfo",
    artist: params.artist,
    mbid: params.mbid,
    lang: params.lang,
    username: params.username,
    autocorrect: params.autocorrect ? "1" : "0",
  });
}

export type LastFmArtistSearchParams = {
  artist: string;
  limit?: number;
  page?: number;
};

export async function searchLastFmArtist(params: LastFmArtistSearchParams) {
  return callLastFmGet<any>({
    method: "artist.search",
    artist: params.artist,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
  });
}

export type LastFmArtistTopParams = {
  artist?: string;
  mbid?: string;
  limit?: number;
  page?: number;
  autocorrect?: boolean | number;
};

export async function getLastFmArtistTopTracks(params: LastFmArtistTopParams) {
  return callLastFmGet<any>({
    method: "artist.getTopTracks",
    artist: params.artist,
    mbid: params.mbid,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
    autocorrect: params.autocorrect ? "1" : "0",
  });
}

export async function getLastFmArtistTopAlbums(params: LastFmArtistTopParams) {
  return callLastFmGet<any>({
    method: "artist.getTopAlbums",
    artist: params.artist,
    mbid: params.mbid,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
    autocorrect: params.autocorrect ? "1" : "0",
  });
}

export type LastFmArtistSimilarParams = {
  artist?: string;
  mbid?: string;
  limit?: number;
  autocorrect?: boolean | number;
};

export async function getSimilarLastFmArtists(params: LastFmArtistSimilarParams) {
  return callLastFmGet<any>({
    method: "artist.getSimilar",
    artist: params.artist,
    mbid: params.mbid,
    limit: params.limit?.toString(),
    autocorrect: params.autocorrect ? "1" : "0",
  });
}

// --- ALBUM ENDPOINTS ---

export type LastFmAlbumInfoParams = {
  album?: string;
  artist?: string;
  mbid?: string;
  lang?: string;
  username?: string;
  autocorrect?: boolean | number;
};

export async function getLastFmAlbumInfo(params: LastFmAlbumInfoParams) {
  return callLastFmGet<any>({
    method: "album.getInfo",
    album: params.album,
    artist: params.artist,
    mbid: params.mbid,
    lang: params.lang,
    username: params.username,
    autocorrect: params.autocorrect ? "1" : "0",
  });
}

export type LastFmAlbumSearchParams = {
  album: string;
  limit?: number;
  page?: number;
};

export async function searchLastFmAlbum(params: LastFmAlbumSearchParams) {
  return callLastFmGet<any>({
    method: "album.search",
    album: params.album,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
  });
}

// --- USER ENDPOINTS ---

export type LastFmUserInfoParams = {
  user?: string;
};

export async function getLastFmUserInfo(params: LastFmUserInfoParams) {
  return callLastFmGet<any>({
    method: "user.getInfo",
    user: params.user,
  });
}

export type LastFmUserRecentTracksParams = {
  user: string;
  limit?: number;
  page?: number;
  from?: number;
  to?: number;
  extended?: boolean | number;
};

export async function getLastFmUserRecentTracks(params: LastFmUserRecentTracksParams) {
  return callLastFmGet<any>({
    method: "user.getRecentTracks",
    user: params.user,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
    from: params.from?.toString(),
    to: params.to?.toString(),
    extended: params.extended ? "1" : "0",
  });
}

export type LastFmUserTopParams = {
  user: string;
  limit?: number;
  page?: number;
  period?: "overall" | "7day" | "1month" | "3month" | "6month" | "12month" | string;
};

export async function getLastFmUserTopArtists(params: LastFmUserTopParams) {
  return callLastFmGet<any>({
    method: "user.getTopArtists",
    user: params.user,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
    period: params.period,
  });
}

export async function getLastFmUserTopTracks(params: LastFmUserTopParams) {
  return callLastFmGet<any>({
    method: "user.getTopTracks",
    user: params.user,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
    period: params.period,
  });
}

export async function getLastFmUserTopAlbums(params: LastFmUserTopParams) {
  return callLastFmGet<any>({
    method: "user.getTopAlbums",
    user: params.user,
    limit: params.limit?.toString(),
    page: params.page?.toString(),
    period: params.period,
  });
}
