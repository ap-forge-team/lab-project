import React from 'react'
import { Camera, Image } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'

const LabAssistantSampleModal = ({
  showSampleModal,
  setShowSampleModal,
  sampleImages,
  setSampleImages,
  assistantNotes,
  setAssistantNotes,
  handleSampleUpload,
  uploadingSample,
}) => {
  return (
    <Modal
      open={showSampleModal}
      onClose={() => {
        setShowSampleModal(false)
        setSampleImages([])
      }}
      title="Upload Sample"
      subtitle="Upload blood sample tube image"
      size="lg"
    >
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="group border border-dashed border-border hover:border-primary rounded-xl p-5 bg-primary/10 hover:bg-primary/10 transition cursor-pointer flex flex-col items-center text-center">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                if (e.target.files[0]) {
                  setSampleImages((prev) => [...prev, e.target.files[0]])
                }
              }}
            />
            <div className="w-12 h-12 rounded-[10px] bg-primary/10 group-hover:bg-primary transition flex items-center justify-center text-primary group-hover:text-white mb-3">
              <Camera size={22} />
            </div>
            <h2 className="text-sm font-serif text-foreground">Capture Sample</h2>
            <p className="text-muted-foreground text-[10px] mt-1 leading-relaxed">
              Open camera and capture blood tube image
            </p>
          </label>

          <label className="group border border-dashed border-border hover:border-primary rounded-xl p-5 bg-primary/10 hover:bg-primary/10 transition cursor-pointer flex flex-col items-center text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                setSampleImages((prev) => [...prev, ...Array.from(e.target.files)])
              }}
            />
            <div className="w-12 h-12 rounded-[10px] bg-primary/10 group-hover:bg-primary transition flex items-center justify-center text-primary group-hover:text-white mb-3">
              <Image size={22} />
            </div>
            <h2 className="text-sm font-serif text-foreground">Upload Images</h2>
            <p className="text-muted-foreground text-[10px] mt-1 leading-relaxed">
              Select multiple sample images from gallery
            </p>
          </label>
        </div>

        {sampleImages.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-foreground">Selected Images</h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {sampleImages.length} Images
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sampleImages.map((image, index) => (
                <div key={index} className="relative flex-shrink-0 p-1.5">
                  <img
                    src={URL.createObjectURL(image)}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="danger"
                    onClick={() => {
                      setSampleImages(sampleImages.filter((_, i) => i !== index))
                    }}
                    className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center p-0"
                  >
                    <span className="text-[10px] leading-none">✕</span>
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSampleImages([])}
              className="mt-2 text-red-600 text-xs font-medium"
            >
              Remove All
            </Button>
          </div>
        )}

        <div className="mt-4">
          <Textarea
            label="Assistant Notes"
            rows={2}
            placeholder="Assistant notes..."
            value={assistantNotes}
            onChange={(e) => setAssistantNotes(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <Button
            variant="primary"
            fullWidth
            loading={uploadingSample}
            disabled={uploadingSample || sampleImages.length === 0}
            onClick={handleSampleUpload}
          >
            {uploadingSample ? 'Uploading...' : 'Upload Sample'}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setShowSampleModal(false)
              setSampleImages([])
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default LabAssistantSampleModal
