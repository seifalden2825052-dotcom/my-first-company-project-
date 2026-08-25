import { useRef, useState } from "react";
import {
  useListPages,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  getListPagesQueryKey,
  type SitePage,
  type PageBlock,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Eye, EyeOff, ArrowUp, ArrowDown, X, FileText, Upload, Loader2, ImageIcon, Film } from "lucide-react";
import { mediaUrl } from "@/lib/media";

const BLOCK_TYPES: { value: PageBlock["type"]; label: string }[] = [
  { value: "heading", label: "Heading" },
  { value: "text", label: "Text" },
  { value: "price", label: "Price" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

function newBlockId() {
  return `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function PagesManager() {
  const queryClient = useQueryClient();
  const { data: pages, isLoading } = useListPages();
  const [editing, setEditing] = useState<SitePage | "new" | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useDeletePage();

  const handleDelete = (page: SitePage) => {
    if (confirm(`Delete page "${page.title}"? This cannot be undone.`)) {
      setDeleteError(null);
      deleteMutation.mutate({ id: page.id }, {
        onSuccess: (_deleted, variables) => {
          // Update the visible list immediately. Invalidate as well so the
          // server remains the source of truth after the next fetch.
          queryClient.setQueryData<SitePage[]>(
            getListPagesQueryKey(),
            (current) => current?.filter((item) => item.id !== variables.id) ?? [],
          );
          queryClient.invalidateQueries({ queryKey: getListPagesQueryKey() });
        },
        onError: (error) => {
          setDeleteError(error instanceof Error ? error.message : "Failed to delete the page.");
        },
      });
    }
  };

  if (isLoading) return <div className="text-muted-foreground p-8">Loading pages…</div>;

  if (editing !== null) {
    return (
      <PageForm
        page={editing === "new" ? undefined : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="bg-background border border-white/10">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="font-display font-bold text-white uppercase tracking-wider">Site Pages</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create pages for events, courses, or announcements. Published pages appear in the site menu for all visitors.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          data-testid="button-new-page"
          className="bg-primary/20 text-primary border border-primary/50 px-4 py-2 text-sm font-display font-bold tracking-wider hover:bg-primary hover:text-white transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> NEW PAGE
        </button>
      </div>
      {deleteError && (
        <div className="mx-6 mt-6 text-destructive text-sm bg-destructive/10 p-3 border border-destructive/20" role="alert">
          {deleteError}
        </div>
      )}

      {(!pages || pages.length === 0) ? (
        <div className="p-12 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-4 opacity-30" />
          No pages yet. Create your first page — for example an "Events" page announcing a new course.
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {pages.map((page) => (
            <div key={page.id} className="p-6 flex items-center justify-between gap-4" data-testid={`row-page-${page.id}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-white font-display font-bold truncate">{page.title}</span>
                  {page.published ? (
                    <span className="text-[10px] font-display font-bold tracking-wider uppercase text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Published
                    </span>
                  ) : (
                    <span className="text-[10px] font-display font-bold tracking-wider uppercase text-muted-foreground border border-white/10 bg-white/5 px-2 py-0.5 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  /p/{page.slug} · {page.blocks.length} section{page.blocks.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditing(page)}
                  data-testid={`button-edit-page-${page.id}`}
                  className="p-2 text-muted-foreground hover:text-primary bg-white/5 hover:bg-primary/20 transition-colors border border-white/10 hover:border-primary/50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(page)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-page-${page.id}`}
                  className="p-2 text-muted-foreground hover:text-destructive bg-white/5 hover:bg-destructive/20 transition-colors border border-white/10 hover:border-destructive/50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageForm({ page, onClose }: { page?: SitePage; onClose: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();

  const [title, setTitle] = useState(page?.title ?? "");
  const [published, setPublished] = useState(page?.published ?? true);
  const [blocks, setBlocks] = useState<PageBlock[]>(page?.blocks ?? []);

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: newBlockId(), label: "", type: "text", content: "" },
    ]);
  };

  const updateBlock = (id: string, patch: Partial<PageBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBlocks = blocks.filter((b) => b.label.trim() || b.content.trim());

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListPagesQueryKey() });
      onClose();
    };

    if (page) {
      updateMutation.mutate({ id: page.id, data: { title, published, blocks: cleanBlocks } }, { onSuccess });
    } else {
      createMutation.mutate({ data: { title, published, blocks: cleanBlocks } }, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-background border border-white/10 p-8">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">
          {page ? `Edit Page — ${page.title}` : "Create New Page"}
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-white text-sm" data-testid="button-cancel-page">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <label className="block text-xs font-display font-bold text-muted-foreground tracking-widest uppercase mb-2">
              Page Title (appears in the site menu)
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Events, NDT Level II Course, Announcements"
              data-testid="input-page-title"
              className="w-full bg-card border border-white/10 text-white px-4 py-3 focus:border-primary focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer pb-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              data-testid="checkbox-published"
              className="w-5 h-5 accent-blue-500"
            />
            <span className="text-sm font-display font-bold tracking-wider text-white uppercase">Published</span>
          </label>
        </div>

        {/* Blocks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-display font-bold text-muted-foreground tracking-widest uppercase">
              Content Sections
            </label>
            <button
              type="button"
              onClick={addBlock}
              data-testid="button-add-block"
              className="text-primary border border-primary/40 px-3 py-1.5 text-xs font-display font-bold tracking-wider hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> ADD SECTION
            </button>
          </div>

          {blocks.length === 0 && (
            <div className="border border-dashed border-white/10 p-8 text-center text-muted-foreground text-sm">
              No sections yet. Add a section and give it any name you want — e.g. "Course Title", "Price", "Details", "Start Date".
            </div>
          )}

          <div className="space-y-4">
            {blocks.map((block, idx) => (
              <div key={block.id} className="border border-white/10 bg-card p-4" data-testid={`block-editor-${idx}`}>
                <div className="flex flex-wrap gap-3 mb-3 items-center">
                  <input
                    type="text"
                    value={block.label}
                    onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                    placeholder="Section name (e.g. Price, Title, Details)"
                    data-testid={`input-block-label-${idx}`}
                    className="flex-1 min-w-[180px] bg-background border border-white/10 text-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <select
                    value={block.type}
                    onChange={(e) => updateBlock(block.id, { type: e.target.value as PageBlock["type"] })}
                    data-testid={`select-block-type-${idx}`}
                    className="bg-background border border-white/10 text-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    {BLOCK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} className="p-1.5 text-muted-foreground hover:text-white disabled:opacity-30 border border-white/10">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1} className="p-1.5 text-muted-foreground hover:text-white disabled:opacity-30 border border-white/10">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removeBlock(block.id)} className="p-1.5 text-muted-foreground hover:text-destructive border border-white/10">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {block.type === "text" ? (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    rows={3}
                    placeholder="Section content…"
                    data-testid={`input-block-content-${idx}`}
                    className="w-full bg-background border border-white/10 text-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                ) : block.type === "image" || block.type === "video" ? (
                  <MediaBlockEditor
                    block={block}
                    idx={idx}
                    onChange={(content) => updateBlock(block.id, { content })}
                  />
                ) : (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder={
                      block.type === "heading" ? "Heading text…" : "e.g. 1500 SAR"
                    }
                    data-testid={`input-block-content-${idx}`}
                    className="w-full bg-background border border-white/10 text-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {(createMutation.isError || updateMutation.isError) && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 border border-destructive/20" data-testid="text-page-form-error">
            Failed to save the page. Please try again.
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            data-testid="button-save-page"
            className="bg-primary text-primary-foreground px-8 py-3 font-display font-bold tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "SAVING..." : page ? "SAVE CHANGES" : "CREATE PAGE"}
          </button>
        </div>
      </form>
    </div>
  );
}

const MAX_UPLOAD_MB = 200;

function MediaBlockEditor({
  block,
  idx,
  onChange,
}: {
  block: PageBlock;
  idx: number;
  onChange: (content: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploadFile, cancelUpload, isUploading, progress } = useUpload({
    onSuccess: (response) => onChange(response.objectPath),
    onError: (err) => setUploadError(err.message),
  });

  const isVideo = block.type === "video";
  const accept = isVideo ? "video/*" : "image/*";

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setUploadError(`File is too large (max ${MAX_UPLOAD_MB} MB).`);
      return;
    }
    await uploadFile(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        data-testid={`input-block-file-${idx}`}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {block.content ? (
        <div className="space-y-3">
          <div className="bg-background border border-white/10 p-2">
            {isVideo ? (
              <video
                src={mediaUrl(block.content)}
                controls
                preload="metadata"
                className="w-full max-h-64"
                data-testid={`preview-video-${idx}`}
              />
            ) : (
              <img
                src={mediaUrl(block.content)}
                alt={block.label || "Uploaded image"}
                className="w-full max-h-64 object-contain"
                data-testid={`preview-image-${idx}`}
              />
            )}
          </div>
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary text-xs font-display font-bold tracking-wider">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>UPLOADING… {progress}%</span>
              </div>
              <div className="w-full h-1 bg-white/10">
                <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <button
                type="button"
                onClick={cancelUpload}
                data-testid={`button-cancel-upload-${idx}`}
                className="text-muted-foreground border border-white/10 px-3 py-1.5 text-xs font-display font-bold tracking-wider hover:text-destructive hover:border-destructive/40 transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> CANCEL
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                data-testid={`button-replace-media-${idx}`}
                className="text-primary border border-primary/40 px-3 py-1.5 text-xs font-display font-bold tracking-wider hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> REPLACE
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                data-testid={`button-remove-media-${idx}`}
                className="text-muted-foreground border border-white/10 px-3 py-1.5 text-xs font-display font-bold tracking-wider hover:text-destructive hover:border-destructive/40 transition-colors"
              >
                REMOVE
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          data-testid={`button-upload-media-${idx}`}
          className="w-full border border-dashed border-white/20 hover:border-primary/50 bg-background p-6 text-center transition-colors group disabled:opacity-70"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-display font-bold tracking-wider">UPLOADING… {progress}%</span>
              <div className="w-full max-w-xs h-1 bg-white/10">
                <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); cancelUpload(); }}
                data-testid={`button-cancel-upload-empty-${idx}`}
                className="text-muted-foreground border border-white/10 px-3 py-1 text-xs font-display font-bold tracking-wider hover:text-destructive hover:border-destructive/40 transition-colors flex items-center gap-1.5"
              >
                <X className="w-3 h-3" /> CANCEL
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              {isVideo ? <Film className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
              <span className="text-xs font-display font-bold tracking-wider">
                {isVideo ? "UPLOAD VIDEO FROM YOUR DEVICE" : "UPLOAD IMAGE FROM YOUR DEVICE"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {isVideo ? "MP4, WebM, MOV…" : "JPG, PNG, WebP, GIF…"} (max {MAX_UPLOAD_MB} MB)
              </span>
            </div>
          )}
        </button>
      )}

      {uploadError && (
        <div className="text-destructive text-xs mt-2" data-testid={`text-upload-error-${idx}`}>
          Upload failed: {uploadError}
        </div>
      )}
    </div>
  );
}
