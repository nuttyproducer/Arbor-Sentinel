// src/components/admin/MediaLibrary.tsx
// Media library — upload, browse, and select images/documents.

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/db/client';

interface MediaItem {
  name: string;
  id: string | null;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
  } | null;
}

export interface MediaLibraryProps {
  bucket?: 'evidence-documents' | 'dossier-exports';
  onSelect?: (url: string, item: MediaItem) => void;
  selectLabel?: string;
}

export function MediaLibrary({
  bucket = 'evidence-documents',
  onSelect,
  selectLabel = 'Select',
}: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setIsLoading(true);
    const { data, error: err } = await supabase.storage.from(bucket).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (err) {
      setError(err.message);
    } else {
      setItems(data ?? []);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, [bucket]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    setUploading(true);
    setError(null);

    const path = `${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (uploadErr) {
      setError(uploadErr.message);
    } else {
      loadItems();
    }
    setUploading(false);

    // Reset file input
    e.target.value = '';
  }

  function getPublicUrl(item: MediaItem): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(item.name);
    return data.publicUrl;
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-charcoal/10 bg-bone/50">
        <h2 className="font-serif text-lg font-semibold text-ink mb-2">Media Library</h2>

        <label className="inline-block px-4 py-2 bg-charcoal text-white font-mono text-xs rounded
          hover:bg-charcoal/90 transition-colors cursor-pointer">
          {uploading ? 'Uploading…' : '+ Upload'}
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf,.zip,.txt,.csv"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="m-4 bg-clay/5 border border-clay/20 rounded p-3" role="alert">
          <p className="font-mono text-xs text-clay">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
        {isLoading ? (
          <p className="col-span-full font-mono text-sm text-charcoal/40 py-8 text-center">
            Loading media…
          </p>
        ) : items.length === 0 ? (
          <p className="col-span-full font-mono text-sm text-charcoal/40 py-8 text-center">
            No media files. Upload an image or document to get started.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.name}
              className="border border-charcoal/10 rounded p-2 hover:border-charcoal/30 transition-colors"
            >
              {/* Image preview or file icon */}
              {item.metadata?.mimetype?.startsWith('image/') ? (
                <img
                  src={getPublicUrl(item)}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded mb-1 bg-bone"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-24 bg-bone rounded mb-1 flex items-center justify-center">
                  <span className="font-mono text-2xl text-charcoal/30">📄</span>
                </div>
              )}

              <p className="font-mono text-[10px] text-charcoal/60 truncate" title={item.name}>
                {item.name}
              </p>
              <p className="font-mono text-[10px] text-charcoal/40">
                {item.metadata ? formatSize(item.metadata.size) : ''}
              </p>

              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(getPublicUrl(item), item)}
                  className="mt-1 w-full py-1 border border-charcoal/20 rounded font-mono text-[10px]
                    text-charcoal/60 hover:bg-bone transition-colors"
                >
                  {selectLabel}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
