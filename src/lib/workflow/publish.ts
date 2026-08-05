import { supabase } from '../db/client';

interface PublishOptions {
  scheduledAt?: Date;
  reviewerId?: string;
}

interface PublishResult {
  success: boolean;
  recordId: string;
  error?: string;
}

export async function publishRecord(
  contentType: string,
  recordId: string,
  options?: PublishOptions,
): Promise<PublishResult> {
  const { error } = await supabase
    .from(contentType)
    .update({
      review_status: 'published',
      visibility: 'public',
      last_reviewed_at: new Date().toISOString(),
      reviewed_by: options?.reviewerId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId);

  if (error) return { success: false, recordId, error: error.message };
  return { success: true, recordId };
}

export async function archiveRecord(
  contentType: string,
  recordId: string,
): Promise<PublishResult> {
  const { error } = await supabase
    .from(contentType)
    .update({
      review_status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId);

  if (error) return { success: false, recordId, error: error.message };
  return { success: true, recordId };
}
