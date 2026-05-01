"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateWorkspaceDialog({ open, onOpenChange, onSubmit, error, isPending }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Create a new workspace for your team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Workspace name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief description" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <Input id="accentColor" name="accentColor" defaultValue="#d4510a" type="color" className="h-10 w-full p-1" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Workspace"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
