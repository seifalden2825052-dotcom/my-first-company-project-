import { useRoute } from "wouter";
import { useGetPageBySlug, getGetPageBySlugQueryKey } from "@workspace/api-client-react";
import { FileQuestion } from "lucide-react";
import { mediaUrl } from "@/lib/media";

export default function DynamicPage() {
  const [, params] = useRoute("/p/:slug");
  const slug = params?.slug ?? "";

  const { data: page, isLoading, error } = useGetPageBySlug(slug, {
    query: { enabled: !!slug, retry: false, queryKey: getGetPageBySlugQueryKey(slug) },
  });

  if (isLoading) {
    return (
      <div className="w-full pt-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="w-full pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <FileQuestion className="w-14 h-14 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-display font-bold text-white mb-3">PAGE NOT FOUND</h1>
        <p className="text-muted-foreground">This page may have been removed or unpublished.</p>
      </div>
    );
  }

  return (
    <div className="w-full pt-20">
      <section className="py-20 md:py-28 bg-card border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight" data-testid="text-page-title">
            {page.title.toUpperCase()}
          </h1>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-10">
          {page.blocks.length === 0 && (
            <p className="text-center text-muted-foreground">Content coming soon.</p>
          )}
          {page.blocks.map((block) => {
            switch (block.type) {
              case "heading":
                return (
                  <div key={block.id}>
                    {block.label && (
                      <div className="text-xs font-display font-bold text-primary tracking-widest uppercase mb-2">{block.label}</div>
                    )}
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">{block.content}</h2>
                  </div>
                );
              case "price":
                return (
                  <div key={block.id} className="bg-card border border-primary/30 p-8 text-center">
                    {block.label && (
                      <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-3">{block.label}</div>
                    )}
                    <div className="text-4xl font-display font-bold text-primary">{block.content}</div>
                  </div>
                );
              case "image":
                return (
                  <div key={block.id}>
                    {block.label && (
                      <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-3">{block.label}</div>
                    )}
                    <img src={mediaUrl(block.content)} alt={block.label || page.title} className="w-full border border-white/10" />
                  </div>
                );
              case "video":
                return (
                  <div key={block.id}>
                    {block.label && (
                      <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-3">{block.label}</div>
                    )}
                    <video
                      src={mediaUrl(block.content)}
                      controls
                      preload="metadata"
                      className="w-full border border-white/10"
                      data-testid={`video-${block.id}`}
                    />
                  </div>
                );
              default:
                return (
                  <div key={block.id}>
                    {block.label && (
                      <div className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">{block.label}</div>
                    )}
                    <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">{block.content}</p>
                  </div>
                );
            }
          })}
        </div>
      </section>
    </div>
  );
}
