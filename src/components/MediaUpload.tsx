import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { uploadMedia } from "@/lib/content";
import { toast } from "sonner";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  accept?: string;
  className?: string;
};

export function MediaUpload({
  value,
  onChange,
  folder = "general",
  label = "Upload",
  accept = "image/*",
  className = "",
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {value ? (
        <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground inline-flex items-center justify-center shadow"
            aria-label="remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center shrink-0">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
          }}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:border-primary text-sm font-semibold disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {label}
        </button>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="or paste image URL"
          className="mt-2 w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background"
        />
      </div>
    </div>
  );
}
