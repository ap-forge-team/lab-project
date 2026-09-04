import { useState } from 'react'
import { MapPin, Map, Pencil, Home, Building2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import LocationPicker from '@/components/LocationPicker'
import { toast } from 'react-toastify'

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

export default function BookingAddressSection({
  formData,
  errors,
  handleChange,
  mapLocation,
  setMapLocation,
  showMap,
  setShowMap,
  getCurrentLocation,
  openMap,
  reverseGeocode,
}) {
  const [addressType, setAddressType] = useState('home')
  const hasLocation = mapLocation?.lat && mapLocation?.lng
  const selectedAddress = formData.address || ''

  return (
    <div className="space-y-6">
      {/* Select Location */}
      <fieldset className="border border-border rounded-xl p-5">
        <legend className="text-sm font-semibold text-foreground px-2">Select Location</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex flex-col items-center gap-2 p-5 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition cursor-pointer"
          >
            <MapPin size={24} className="text-primary" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Use Current Location</p>
              <p className="text-xs text-muted-foreground">Detect my location</p>
            </div>
          </button>
          <button
            type="button"
            onClick={openMap}
            className="flex flex-col items-center gap-2 p-5 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition cursor-pointer"
          >
            <Map size={24} className="text-primary" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Select on Map</p>
              <p className="text-xs text-muted-foreground">Pick location on map</p>
            </div>
          </button>
        </div>
      </fieldset>

      {/* Selected Location Display */}
      {hasLocation && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground mb-0.5">Selected Location</p>
            <p className="text-sm text-muted-foreground">{selectedAddress || 'Location selected'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lat: {mapLocation.lat?.toFixed(4)}, Long: {mapLocation.lng?.toFixed(4)}
            </p>
          </div>
          <button
            type="button"
            onClick={openMap}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 shrink-0"
          >
            <Pencil size={12} /> Change Location
          </button>
        </div>
      )}

      {/* Map Modal */}
      <Modal
        open={showMap}
        onClose={() => setShowMap(false)}
        title="Select Patient Location"
        size="full"
      >
        <LocationPicker
          location={mapLocation}
          setLocation={setMapLocation}
          onLocationSelect={reverseGeocode}
        />
        <Button
          onClick={() => {
            if (!mapLocation?.lat) {
              toast.error('Please select location')
              return
            }
            setShowMap(false)
          }}
          fullWidth
          variant="success"
          className="mt-4"
        >
          Confirm Location
        </Button>
      </Modal>

      {/* Address Details */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Address Details</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Flat / House No. *"
              type="text"
              name="flatNo"
              value={formData.flatNo}
              onChange={handleChange}
              required
              error={errors.flatNo}
              placeholder="101"
            />
            <Input
              label="Apartment / Building / Society *"
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              required
              placeholder="Sai Apartments"
            />
          </div>
          <Input
            label="Area / Street *"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            error={errors.address}
            placeholder="Lane No. 5, Baner"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City *"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              error={errors.city}
              placeholder="Pune"
            />
            <Select
              label="State *"
              name="state"
              value={formData.state || ''}
              onChange={handleChange}
              required
              error={errors.state}
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Input
              label="Pincode *"
              type="text"
              name="pincode"
              maxLength={6}
              value={formData.pincode}
              onChange={handleChange}
              required
              error={errors.pincode}
              placeholder="411045"
            />
          </div>
        </div>
      </div>

      {/* Address Type */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-3 block">Address Type</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAddressType('home')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition ${
              addressType === 'home'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            <Home size={16} /> Home
          </button>
          <button
            type="button"
            onClick={() => setAddressType('work')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition ${
              addressType === 'work'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            <Building2 size={16} /> Work
          </button>
        </div>
      </div>
    </div>
  )
}
