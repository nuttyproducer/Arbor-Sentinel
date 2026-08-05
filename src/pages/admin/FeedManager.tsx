// src/pages/admin/FeedManager.tsx
// Admin page for managing RSS/Atom feed definitions.
// Supports: list, add, edit, toggle enable/disable, manual sync, delete.

import { useState, useEffect, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { FeedTable, type FeedRow } from "../../components/admin/FeedTable";
import { FeedForm, type FeedFormData } from "../../components/admin/FeedForm";
import { SupabaseStore } from "../../lib/collectors/SupabaseStore";

type View = "list" | "add" | "edit";

export function FeedManager() {
  const [view, setView] = useState<View>("list");
  const [feeds, setFeeds] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedRow | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const store = new SupabaseStore();

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await store.getFeeds();
      setFeeds(data as FeedRow[]);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load feeds." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  async function handleToggle(feedId: string, enabled: boolean) {
    const success = await store.toggleFeed(feedId, enabled);
    if (success) {
      setFeeds((prev) =>
        prev.map((f) => (f.id === feedId ? { ...f, enabled } : f)),
      );
      setMessage({ type: "success", text: `Feed ${enabled ? "enabled" : "disabled"}.` });
    } else {
      setMessage({ type: "error", text: "Failed to toggle feed." });
    }
  }

  async function handleSync(feedId: string) {
    const feed = feeds.find((f) => f.id === feedId);
    if (!feed) return;

    // Import the scheduler and run a manual sync
    try {
      const { CollectorRegistry } = await import("../../lib/collectors/CollectorRegistry");
      const { RateLimiter } = await import("../../lib/collectors/rateLimiter");
      const { DEFAULT_RATE_LIMIT, DEFAULT_RETRY_CONFIG, DEFAULT_FETCH_TIMEOUT_MS } =
        await import("../../lib/collectors/types");

      const registry = new CollectorRegistry(store, new RateLimiter());

      // Try to find and register a collector for this feed's source type
      const sourceType = feed.source_type as
        | "journalism"
        | "ngo"
        | "academic"
        | "un"
        | "government"
        | "court";

      // Dynamically import the appropriate collector
      let CollectorClass: Parameters<typeof registry.register>[0] | null = null;
      try {
        switch (sourceType) {
          case "journalism":
          case "ngo":
          case "academic": {
            const mod = await import("../../lib/collectors/media/JournalismCollector");
            CollectorClass = mod.JournalismCollector as unknown as Parameters<
              typeof registry.register
            >[0];
            break;
          }
          case "un": {
            const mod = await import("../../lib/collectors/un/OCHACollector");
            CollectorClass = mod.OCHACollector as unknown as Parameters<
              typeof registry.register
            >[0];
            break;
          }
          case "government": {
            const mod = await import("../../lib/collectors/eu/EUCollector");
            CollectorClass = mod.EUCollector as unknown as Parameters<
              typeof registry.register
            >[0];
            break;
          }
          case "court": {
            const mod = await import("../../lib/collectors/courts/ICJCollector");
            CollectorClass = mod.ICJCollector as unknown as Parameters<
              typeof registry.register
            >[0];
            break;
          }
          default:
            break;
        }
      } catch {
        setMessage({
          type: "error",
          text: `No collector found for source type "${sourceType}".`,
        });
        return;
      }

      if (!CollectorClass) {
        setMessage({
          type: "error",
          text: `Could not load collector for "${sourceType}".`,
        });
        return;
      }

      registry.register(CollectorClass, [sourceType], `Collector for ${feed.name}`);

      const config = {
        sourceId: feed.id,
        label: feed.name,
        sourceType,
        enabled: true,
        trigger: { type: "manual" as const },
        rateLimit: DEFAULT_RATE_LIMIT,
        retry: DEFAULT_RETRY_CONFIG,
        fetchTimeoutMs: DEFAULT_FETCH_TIMEOUT_MS,
        maxContentAgeMs: 24 * 60 * 60 * 1000,
        storeRawResponse: false,
        metadata: { url: feed.url, feedId: feed.id },
      };

      const sourceRecord = {
        id: feed.id,
        slug: feed.id,
        title: feed.name,
        publisher: feed.name,
        sourceType,
        url: feed.url,
        accessedAt: new Date().toISOString(),
        status: "active" as const,
        version: 1,
        trustLevel: feed.trust_level,
        healthStatus: feed.health_status as
          | "unknown"
          | "active"
          | "degraded"
          | "failed",
        automationStatus: "scheduled" as const,
        failureCount: feed.failure_count,
        monitoringEnabled: true,
        correctionUrl: "",
      };

      const collector = registry.createInstance(sourceRecord, config);
      const result = await collector.collect();

      // Update feed health
      await store.updateFeedHealth(feed.id, {
        healthStatus: result.success ? "active" : "degraded",
        lastFetchedAt: new Date().toISOString(),
        lastSuccessAt: result.success ? new Date().toISOString() : undefined,
        failureCount: result.success ? 0 : feed.failure_count + 1,
      });

      // Persist run to DB
      await store.persistRun({
        sourceId: feed.id,
        collectorType: sourceType,
        status: result.success ? "completed" : "failed",
        itemsFetched: result.itemsFetched,
        itemsValidated: result.itemsValidated,
        itemsStored: result.itemsStored,
        stageDurations: result.stageDurations,
        errors: [],
        startedAt: result.startedAt,
        completedAt: result.completedAt,
      });

      setMessage({
        type: result.success ? "success" : "error",
        text: result.success
          ? `Sync complete: ${result.itemsStored} new items stored.`
          : `Sync completed with errors.`,
      });

      await loadFeeds();
    } catch (err) {
      setMessage({
        type: "error",
        text: `Sync failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  async function handleAdd(data: FeedFormData) {
    setSaving(true);
    try {
      const { supabase } = await import("../../lib/db/client");
      const { error } = await supabase.from("feeds").insert({
        name: data.name,
        url: data.url,
        source_type: data.source_type,
        category: data.category,
        parser: data.parser,
        language: data.language,
        poll_interval_minutes: data.poll_interval_minutes,
        trust_level: data.trust_level,
        enabled: data.enabled,
      });

      if (error) {
        setMessage({ type: "error", text: `Failed to add feed: ${error.message}` });
        return;
      }

      setMessage({ type: "success", text: "Feed added successfully." });
      setView("list");
      await loadFeeds();
    } catch (err) {
      setMessage({
        type: "error",
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: FeedFormData) {
    if (!editingFeed) return;
    setSaving(true);
    try {
      const { supabase } = await import("../../lib/db/client");
      const { error } = await supabase
        .from("feeds")
        .update({
          name: data.name,
          url: data.url,
          source_type: data.source_type,
          category: data.category,
          parser: data.parser,
          language: data.language,
          poll_interval_minutes: data.poll_interval_minutes,
          trust_level: data.trust_level,
          enabled: data.enabled,
        })
        .eq("id", editingFeed.id);

      if (error) {
        setMessage({ type: "error", text: `Failed to update feed: ${error.message}` });
        return;
      }

      setMessage({ type: "success", text: "Feed updated successfully." });
      setView("list");
      setEditingFeed(null);
      await loadFeeds();
    } catch (err) {
      setMessage({
        type: "error",
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(feedId: string) {
    const success = await store.deleteFeed(feedId);
    if (success) {
      setFeeds((prev) => prev.filter((f) => f.id !== feedId));
      setMessage({ type: "success", text: "Feed deleted." });
    } else {
      setMessage({ type: "error", text: "Failed to delete feed." });
    }
  }

  function startEdit(feed: FeedRow) {
    setEditingFeed(feed);
    setView("edit");
  }

  return (
    <Container>
      {/* Message banner */}
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm font-mono ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-3 text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <PageIntro title="Feed Manager" description="Manage RSS, Atom, and JSON Feed collectors." />
        <div className="flex gap-2">
          {view !== "list" && (
            <button
              onClick={() => {
                setView("list");
                setEditingFeed(null);
              }}
              className="px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-charcoal/60 hover:bg-charcoal/5 transition-colors"
            >
              ← Back to list
            </button>
          )}
          {view === "list" && (
            <>
              <button
                onClick={loadFeeds}
                className="px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-charcoal/60 hover:bg-charcoal/5 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => setView("add")}
                className="px-4 py-2 bg-ink text-white font-mono text-sm rounded hover:bg-charcoal/80 transition-colors"
              >
                + Add Feed
              </button>
            </>
          )}
        </div>
      </div>

      {view === "list" && (
        <div className="bg-white border border-charcoal/10 rounded-lg">
          <FeedTable
            feeds={feeds}
            onToggle={handleToggle}
            onSync={handleSync}
            onEdit={startEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      )}

      {view === "add" && (
        <FeedForm onSubmit={handleAdd} onCancel={() => setView("list")} loading={saving} />
      )}

      {view === "edit" && editingFeed && (
        <FeedForm
          initial={{
            name: editingFeed.name,
            url: editingFeed.url,
            source_type: editingFeed.source_type,
            category: editingFeed.category ?? "",
            parser: editingFeed.parser,
            language: editingFeed.language,
            poll_interval_minutes: editingFeed.poll_interval_minutes,
            trust_level: editingFeed.trust_level,
            enabled: editingFeed.enabled,
          }}
          onSubmit={handleEdit}
          onCancel={() => {
            setView("list");
            setEditingFeed(null);
          }}
          loading={saving}
        />
      )}
    </Container>
  );
}
