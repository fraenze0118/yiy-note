import { CreateNoteForm } from "@/components/notes/create-note-form";
import { domains } from "@/lib/domains";

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; topic?: string; topicId?: string }>;
}) {
  const sp = await searchParams;
  const defaultDomain = sp?.domain ?? "software";
  // topicId from graph node click takes precedence over topic name
  const defaultTopic = sp?.topicId ?? sp?.topic;

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">新建笔记</h1>
      <CreateNoteForm
        defaultDomain={defaultDomain}
        defaultTopic={defaultTopic}
        domains={domains}
      />
    </div>
  );
}
