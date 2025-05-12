"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import type { ProjectExpense } from "@/types/project"

interface ViewReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: ProjectExpense
}

export function ViewReceiptDialog({ open, onOpenChange, expense }: ViewReceiptDialogProps) {
  const receiptUrl = expense?.receipt || ""
  const isImage = receiptUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null
  const isPdf = receiptUrl.match(/\.(pdf)$/i) !== null

  const handleDownload = () => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Receipt for {expense.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4">
          {!receiptUrl && (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <FileText className="h-16 w-16 mb-4" />
              <p>No receipt available</p>
            </div>
          )}

          {isImage && receiptUrl && (
            <img
              src={receiptUrl || "/placeholder.svg"}
              alt={`Receipt for ${expense.title}`}
              className="max-w-full max-h-[60vh] object-contain border rounded"
            />
          )}

          {isPdf && receiptUrl && (
            <div className="flex flex-col items-center justify-center p-8">
              <FileText className="h-16 w-16 mb-4 text-red-500" />
              <p className="mb-4">PDF Receipt</p>
              <div className="flex gap-4">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={() => window.open(receiptUrl, "_blank")}>View PDF</Button>
              </div>
            </div>
          )}

          {receiptUrl && !isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center p-8">
              <FileText className="h-16 w-16 mb-4" />
              <p className="mb-4">Receipt File</p>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
