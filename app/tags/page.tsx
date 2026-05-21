import { getAllNotes } from "@/lib/notes-data";
import { TagCloud } from "@/components/ui/tag-cloud";
import { domains } from "@/lib/domains";

export default async function TagsPage() {
  const notes = await getAllNotes();

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-1.5">标签</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        通过标签跨领域关联笔记，点击标签查看相关笔记。
      </p>
      <TagCloud notes={notes} domains={domains} />
    </div>
  );
}
