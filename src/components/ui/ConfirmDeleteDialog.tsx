import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  loading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={!loading ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-sm font-semibold tracking-tight">
            {itemName}
          </span>
        </div>

        <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Sí, eliminar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
