import { getAllNotes } from "@/lib/notes-data";
import { SearchBox } from "@/components/ui/search-box";
import { TagCloud } from "@/components/ui/tag-cloud";
import { domains } from "@/lib/domains";
import { Search, Hash } from "lucide-react";

export default async function SearchPage() {
  const notes = await getAllNotes();

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-1.5">探索</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">搜索笔记、浏览标签。</p>

      {/* Search section */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Search size={15} className="text-zinc-400" />
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">搜索</h2>
        </div>
        <SearchBox notes={notes} domains={domains} />
      </section>

      {/* Divider */}
      <div className="h-px my-8" style={{ backgroundColor: "var(--bd)" }} />

      {/* Tags section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Hash size={15} className="text-zinc-400" />
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">标签</h2>
        </div>
        <TagCloud notes={notes} domains={domains} />
      </section>
    </div>
  );
}
