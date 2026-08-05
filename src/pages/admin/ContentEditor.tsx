// src/pages/admin/ContentEditor.tsx
// Content editor — shared editor for all content types.
// Renders type-specific form fields, status selector, and save/publish actions.

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentForm, type FormField } from '../../components/admin/ContentForm';
import { StatusSelect } from '../../components/admin/StatusSelect';
import { VersionHistory } from '../../components/admin/VersionHistory';
import { useAdminContent, type ContentType } from '../../hooks/useAdminContent';
import { publishRecord } from '../../lib/workflow/publish';

interface ContentEditorProps {
  contentType: ContentType;
  title: string;
  listPath: string;
  fields: FormField[];
}

export function ContentEditor({ contentType, title, listPath, fields }: ContentEditorProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const { create, update } = useAdminContent<{ id: string } & Record<string, unknown>>({
    contentType,
    perPage: 1,
  });

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [reviewStatus, setReviewStatus] = useState('draft');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load existing record for editing
  useEffect(() => {
    if (!isNew) {
      // Fetch the record directly
      import('../../lib/db/client').then(({ supabase }) => {
        supabase
          .from(contentType)
          .select('*')
          .eq('id', id!)
          .single()
          .then(({ data: record, error }) => {
            if (!error && record) {
              setValues(record as Record<string, unknown>);
              if (record.review_status) setReviewStatus(String(record.review_status));
            }
          });
      });
    }
  }, [contentType, id, isNew]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required) {
        const val = values[field.key];
        if (val === undefined || val === null || val === '') {
          newErrors[field.key] = `${field.label} is required`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setIsSaving(true);
    setSaveMessage(null);

    const payload = {
      ...values,
      ...(contentType === 'evidence_items' ? { review_status: reviewStatus } : {}),
    };

    if (isNew) {
      const created = await create(payload);
      if (created) {
        setSaveMessage('Created successfully.');
        setTimeout(() => navigate(`${listPath}/${created.id}`), 1000);
      }
    } else {
      const updated = await update(id!, payload);
      if (updated) {
        setSaveMessage('Saved.');
      }
    }
    setIsSaving(false);
  }

  async function handlePublish() {
    if (!id || isNew) return;
    setIsSaving(true);
    setSaveMessage(null);
    const result = await publishRecord(contentType, id);
    setIsSaving(false);
    setSaveMessage(result.success ? 'Published successfully' : `Error: ${result.error}`);
    if (result.success) {
      setReviewStatus('published');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(listPath)}
            className="font-mono text-xs text-charcoal/50 hover:text-ink mb-1"
          >
            ← Back to list
          </button>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            {isNew ? `New ${title}` : `Edit ${title}`}
          </h1>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-bone border border-charcoal/10 rounded p-3 mb-4">
          <p className="font-mono text-xs text-ink">{saveMessage}</p>
        </div>
      )}

      <div className="bg-white border border-charcoal/10 rounded-lg p-6">
        {/* Status selector for content types that have workflow */}
        {contentType === 'evidence_items' && (
          <div className="mb-6 max-w-xs">
            <StatusSelect
              value={reviewStatus}
              onChange={setReviewStatus}
              disabled={isNew}
            />
          </div>
        )}

        <ContentForm
          fields={fields}
          values={values}
          onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
          errors={errors}
          isSubmitting={isSaving}
          onSubmit={handleSave}
          submitLabel={isNew ? 'Create' : 'Save Changes'}
        />

        {/* Publish action — only for evidence_items with an active review workflow */}
        {contentType === 'evidence_items' &&
          !isNew &&
          (reviewStatus === 'draft' || reviewStatus === 'approved') && (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving}
                className="px-6 py-2 bg-clay text-white font-mono text-sm rounded
                  hover:bg-clay/90 focus:outline-none focus:ring-2 focus:ring-clay/40
                  disabled:bg-clay/30 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Publishing…' : 'Publish'}
              </button>
            </div>
          )}
      </div>

      {!isNew && (
        <div className="mt-8">
          <VersionHistory contentType={contentType} contentId={id!} />
        </div>
      )}
    </div>
  );
}
