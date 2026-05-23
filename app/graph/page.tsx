import { buildDomainTree } from "@/lib/graph";
import { getAllNotes } from "@/lib/notes-data";
import { GraphView } from "@/components/graph/graph-view";
import { domains } from "@/lib/domains";
import { DomainTabs } from "@/components/graph/domain-tabs";
export default async function GraphPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const sp = await searchParams;
  const firstDomain = domains[0]?.key ?? "";
  const domainKey = sp?.domain ?? firstDomain;
  const validDomain = domains.find((d) => d.key === domainKey) ? domainKey : firstDomain;

  const [data, allNotes] = await Promise.all([
    buildDomainTree(validDomain),
    getAllNotes(),
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <DomainTabs active={validDomain} domains={domains} />
      <GraphView
        domainKey={validDomain}
        data={data}
        allNotes={allNotes}
        domains={domains}
      />
    </div>
  );
}
