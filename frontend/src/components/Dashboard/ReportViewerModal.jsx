import React from 'react'
import { Download } from 'lucide-react'
import Modal from '@/components/ui/Modal'

const isImage = (url) => /\.(jpg|jpeg|png)$/i.test(url || '')

export default function ReportViewerModal({ isOpen, onClose, reportUrl, title = 'Test Report' }) {
  if (!isOpen || !reportUrl) return null

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      headerActions={
        <a
          href={reportUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Download size={14} /> Download PDF
        </a>
      }
    >
      <div className="border border-border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: '60vh' }}>
        {isImage(reportUrl) ? (
          <img src={reportUrl} alt="Report" className="max-w-full max-h-full object-contain" />
        ) : (
          <iframe src={reportUrl} className="w-full h-full rounded-lg shadow-inner bg-white" title="PDF Report" style={{ height: '70vh' }} />
        )}
      </div>
    </Modal>
  )
}
