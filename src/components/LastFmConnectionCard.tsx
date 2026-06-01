"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Music4, RefreshCw, Unlink2 } from "lucide-react";

type LastFmStatus = {
  connected: boolean;
  lastfmUsername: string | null;
  connectedAt: string | null;
  pendingFlowId: string | null;
  pendingFlowExpiresAt: string | null;
};

type LastFmActionResponse =
  | LastFmStatus
  | {
      flowId?: string;
      authorizeUrl?: string;
      expiresAt?: string;
      connected?: boolean;
      lastfmUsername?: string | null;
      connectedAt?: string | null;
      ok?: boolean;
      error?: string;
    };

const STORAGE_KEY = "cisum:lastfm:flowId";

export function LastFmConnectionCard() {
  const [status, setStatus] = useState<LastFmStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingFlowId, setPendingFlowId] = useState<string | null>(null);

  const hasPendingFlow = Boolean(pendingFlowId || status?.pendingFlowId);

  async function loadStatus() {
    try {
      const response = await fetch('/api/lastfm', { cache: 'no-store' });
      const data = (await response.json()) as LastFmStatus;

      setStatus(data);

      if (data.connected) {
        window.localStorage.removeItem(STORAGE_KEY);
        setPendingFlowId(null);
      } else if (data.pendingFlowId) {
        window.localStorage.setItem(STORAGE_KEY, data.pendingFlowId);
        setPendingFlowId(data.pendingFlowId);
      }
    } catch (error) {
      console.error('Failed to load Last.fm status', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPendingFlowId(window.localStorage.getItem(STORAGE_KEY));
    void loadStatus();
  }, []);

  async function postAction(action: string, body?: Record<string, unknown>) {
    const response = await fetch('/api/lastfm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });

    const data = (await response.json()) as LastFmActionResponse;

    if (!response.ok) {
      throw new Error('error' in data && data.error ? data.error : 'Last.fm request failed');
    }

    return data;
  }

  async function startConnection() {
    setSubmitting(true);

    try {
      const data = await postAction('start');

      if (!('flowId' in data) || !data.flowId || !('authorizeUrl' in data) || !data.authorizeUrl) {
        throw new Error('Last.fm did not return a valid connection flow');
      }

      window.localStorage.setItem(STORAGE_KEY, data.flowId);
      setPendingFlowId(data.flowId);

      const popup = window.open(data.authorizeUrl, '_blank', 'noopener,noreferrer');
      if (!popup) {
        window.location.href = data.authorizeUrl;
      }
    } catch (error) {
      console.error('Last.fm connect failed', error);
      alert(error instanceof Error ? error.message : 'Unable to connect Last.fm');
    } finally {
      setSubmitting(false);
    }
  }

  async function finishConnection() {
    const flowId = pendingFlowId || status?.pendingFlowId;

    if (!flowId) {
      return;
    }

    setSubmitting(true);

    try {
      const data = await postAction('complete', { flowId });

      window.localStorage.removeItem(STORAGE_KEY);
      setPendingFlowId(null);
      setStatus({
        connected: true,
        lastfmUsername: 'lastfmUsername' in data ? data.lastfmUsername ?? null : null,
        connectedAt: 'connectedAt' in data ? data.connectedAt ?? null : null,
        pendingFlowId: null,
        pendingFlowExpiresAt: null,
      });
    } catch (error) {
      console.error('Last.fm completion failed', error);
      alert(error instanceof Error ? error.message : 'Unable to finish Last.fm connection');
    } finally {
      setSubmitting(false);
    }
  }

  async function disconnect() {
    setSubmitting(true);

    try {
      await postAction('disconnect');

      window.localStorage.removeItem(STORAGE_KEY);
      setPendingFlowId(null);
      setStatus({
        connected: false,
        lastfmUsername: null,
        connectedAt: null,
        pendingFlowId: null,
        pendingFlowExpiresAt: null,
      });
    } catch (error) {
      console.error('Last.fm disconnect failed', error);
      alert(error instanceof Error ? error.message : 'Unable to disconnect Last.fm');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <Music4 className="h-3.5 w-3.5" />
            Last.fm
          </div>
          <p className="text-sm leading-6 text-zinc-200">
            {loading
              ? 'Checking connection status.'
              : status?.connected
                ? `Connected as ${status.lastfmUsername ?? 'Last.fm user'}`
                : hasPendingFlow
                  ? 'Authorize the app in Last.fm, then finish the connection here.'
                  : 'Connect once and cisum will keep scrobbling from the web player and native apps.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStatus()}
          className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
          aria-label="Refresh Last.fm status"
        >
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {status?.connected ? (
          <>
            <button
              type="button"
              onClick={() => void disconnect()}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink2 className="h-4 w-4" />}
              Disconnect
            </button>

            {status.lastfmUsername ? (
              <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                {status.lastfmUsername}
              </span>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={() => void (hasPendingFlow ? finishConnection() : startConnection())}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            {hasPendingFlow ? 'Finish connection' : 'Connect Last.fm'}
          </button>
        )}
      </div>

      {status?.pendingFlowExpiresAt ? (
        <p className="mt-3 text-xs text-zinc-500">
          Pending flow expires at {new Date(status.pendingFlowExpiresAt).toLocaleTimeString()}.
        </p>
      ) : null}
    </div>
  );
}
