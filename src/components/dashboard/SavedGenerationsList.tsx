import { Save, Trash2, Clock, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedGeneration } from "@/hooks/use-saved-generations";

interface Props<T> {
  items: SavedGeneration<T>[];
  onLoad: (item: SavedGeneration<T>) => void;
  onDelete: (id: string) => void;
  onSave?: () => void;
  canSave?: boolean;
  label?: string;
}

export default function SavedGenerationsList<T>({ items, onLoad, onDelete, onSave, canSave, label = "Saved" }: Props<T>) {
  if (!items.length && !canSave) return null;
  return (
    <div className="mt-4 glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5 text-primary" /> {label} ({items.length})
        </p>
        {canSave && onSave && (
          <Button size="sm" variant="ghost" onClick={onSave} className="text-xs h-7 text-primary hover:text-primary">
            <Save className="w-3 h-3 mr-1" /> Save current
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground px-1">No saved items yet.</p>
      ) : (
        <div className="space-y-1 max-h-44 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-background/40 transition-colors group">
              <button onClick={() => onLoad(item)} className="flex-1 min-w-0 text-left">
                <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" /> {new Date(item.created_at).toLocaleDateString()}
                </p>
              </button>
              <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}