import React, { useState, useEffect } from 'react'
import { Download, ExternalLink } from 'lucide-react'
import Modal from '@/components/ui/Modal'

const isImage = (url) => /\.(jpg|jpeg|png)$/i.test(url || '')

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function ReportViewerModal({ isOpen, onClose, reportUrl, title = 'Test Report' }) {
  const isMobile = useIsMobile()

  if (!isOpen || !reportUrl) return null

  if (isMobile && !isImage(reportUrl)) {
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
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ExternalLink size={28} className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            PDF preview is optimized for desktop viewing.
          </p>
          <a
            href={reportUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            <ExternalLink size={14} /> Open PDF
          </a>
        </div>
      </Modal>
    )
  }

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
      <div className="border border-border rounded-lg overflow-hidden bg-gray-50" style={{ height: '70vh', minHeight: '400px' }}>
        {isImage(reportUrl) ? (
          <img src={reportUrl} alt="Report" className="w-full h-full object-contain" />
        ) : (
          <iframe
            src={reportUrl}
            className="w-full h-full bg-white border-0"
            title="PDF Report"
          />
        )}
      </div>
    </Modal>
  )
}
