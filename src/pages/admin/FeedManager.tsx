// src/pages/admin/FeedManager.tsx
// Admin page for managing RSS/Atom feed definitions.
// Supports: list, add, edit, toggle enable/disable, manual sync, delete.

import { useState, useEffect, useCallback } from "react";
import { Container } from "../../components/ui/Container";
import { PageIntro } from "../../components/pages/PageIntro";
import { FeedTable, type FeedRow } from "../../components/admin/FeedTable";
import { FeedForm, type FeedFormData } from "../../components/admin/FeedForm";
import { getRuntimeEngine } from "../../lib/runtime/RuntimeEngine";

type View = "list" | "add" | "edit";

export function FeedManager() {
  const [view, setView] = useState<View>("list");
  const [feeds, setFeeds] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedRow | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const { supabase } = await import("../../lib/db/client");
      const { data, error } = await supabase
        .from("feeds")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setFeeds((data as FeedRow[]) ?? []);
    } catch {
      setMessage({ type: "error", text: "Failed to load feeds." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadFeeds);
  }, [loadFeeds]);

  async function handleToggle(feedId: string, enabled: boolean) {
    try {
      const { supabase } = await import("../../lib/db/client");
      const { error } = await supabase
        .from("feeds")
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq("id", feedId);
      if (error) throw error;
      setFeeds((prev) =>
        prev.map((f) => (f.id === feedId ? { ...f, enabled } : f)),
      );
      setMessage({ type: "success", text: `Feed ${enabled ? "enabled" : "disabled"}.` });
    } catch {
      setMessage({ type: "error", text: "Failed to toggle feed." });
    }
  }

  async function handleSync(feedId: string) {
    const feed = feeds.find((f) => f.id === feedId);
    if (!feed) return;

    try {
      const runtime = getRuntimeEngine();
      const result = await runtime.runOnce(feedId);
      setMessage({
        type: result?.success ? "success" : "error",
        text: result?.success
          ? `Sync complete: ${result.itemsStored} new items stored.`
          : `Sync completed with errors. Check diagnostics for details.`,
      });
      await loadFeeds();
    } catch (err) {
      setMessage({
        type: "error",
        text: `Sync failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  async function handleRunAll() {
    try {
      setMessage({ type: "success", text: "Running all enabled feeds…" });
      const runtime = getRuntimeEngine();
      const result = await runtime.runOnce();
      setMessage({
        type: result?.success ? "success" : "error",
        text: result?.success
          ? `Run All complete.`
          : `Run All completed with some errors. Check diagnostics.`,
      });
      await loadFeeds();
    } catch (err) {
      setMessage({
        type: "error",
        text: `Run All failed: ${err instanceof Error ? err.message : String(err)}`,
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
    try {
      const { supabase } = await import("../../lib/db/client");
      const { error } = await supabase.from("feeds").delete().eq("id", feedId);
      if (error) throw error;
      setFeeds((prev) => prev.filter((f) => f.id !== feedId));
      setMessage({ type: "success", text: "Feed deleted." });
    } catch {
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
                onClick={handleRunAll}
                className="px-3 py-2 bg-trust/10 border border-trust/30 rounded font-mono text-sm text-trust hover:bg-trust/20 transition-colors"
              >
                ▶ Run All
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
