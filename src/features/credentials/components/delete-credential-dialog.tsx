"use client"

import React, { useState } from "react"
import { NodeType } from "@/generated/prisma/enums"
import useDeleteCredential from "@/features/credentials/hooks/use-delete-credential" // adjust path
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Props ────────────────────────────────────────────────────────────────────

interface DeleteCredentialDialogProps {
  /** Renders inside AlertDialogTrigger — clicking it opens the dialog */
  children?: React.ReactNode
  /** ID of the credential to delete */
  credentialId: string
  /** Human-readable name of the credential, shown in the dialog body */
  credentialName?: string
  /** Node type – forwarded to the mutation hook for cache invalidation */
  type: NodeType
  /** Optional callback fired after a successful deletion */
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DeleteCredentialDialog({
  children,
  credentialId,
  credentialName,
  type,
  onSuccess,
}: DeleteCredentialDialogProps) {
  const [open, setOpen] = useState(false)
  const { deleteCredential, isPending, isError, error } = useDeleteCredential(
    credentialId,
    type
  )

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleConfirm() {
    deleteCredential(
      { id: credentialId },
      {
        onSuccess: () => {
          setOpen(false)
          onSuccess?.()
        },
      }
    )
  }

  function handleCancel() {
    if (isPending) return
    setOpen(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {children && (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      )}
      <AlertDialogContent
        className={cn(
          "max-w-md gap-0 overflow-hidden rounded-xl p-0 shadow-xl",
          "border border-zinc-200 dark:border-zinc-800"
        )}
      >
        {/* ── Header band ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 border-b border-zinc-100 bg-red-50 px-6 py-5 dark:border-zinc-800 dark:bg-red-950/30">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
            <ShieldAlert className="h-5 w-5" aria-hidden />
          </span>

          <AlertDialogHeader className="gap-1 text-left">
            <AlertDialogTitle className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
              Delete credential
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {credentialName ? (
                <>
                  You are about to permanently delete{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    &ldquo;{credentialName}&rdquo;
                  </span>
                  .{" "}
                </>
              ) : (
                "You are about to permanently delete this credential. "
              )}
              This action{" "}
              <span className="font-medium text-red-600 dark:text-red-400">
                cannot be undone
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* ── Inline error ─────────────────────────────────────────────── */}
        {isError && (
          <div
            role="alert"
            className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
          >
            {error?.message ?? "Something went wrong. Please try again."}
          </div>
        )}

        {/* ── Footer actions ───────────────────────────────────────────── */}
        <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 bg-white px-6 py-4 dark:bg-zinc-950">
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={isPending}
            className={cn(
              "h-9 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium",
              "text-zinc-700 shadow-sm transition-colors",
              "hover:bg-zinc-50 hover:text-zinc-900",
              "focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-50",
              "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
              "dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            )}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "h-9 rounded-lg bg-red-600 px-4 text-sm font-medium text-white shadow-sm",
              "transition-colors hover:bg-red-700 active:bg-red-800",
              "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-70",
              "dark:bg-red-700 dark:hover:bg-red-600"
            )}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Deleting…
              </span>
            ) : (
              "Delete credential"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCredentialDialog