import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { createLabOwner } from '@/services/user.service'
import { updateBookingLab } from '@/services/booking.service'
import { DashboardSectionHeader, EmptyState } from '@/components/Dashboard'
import { DataTable } from '@/components/ui/data-table'
import { labOwnerColumns } from '@/features/admin/columns/lab-owners.columns'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import LocationPicker from '@/components/LocationPicker'
import { MapPin, Map, Pencil } from 'lucide-react'
import useFormErrors from '@/hooks/useFormErrors'
import Can from '@/components/Can'

const AdminUsersSection = ({
  labOwners,
  onRefresh,
  showLabMap,
  setShowLabMap,
  showEditModal,
  setShowEditModal,
  selectedBooking,
  selectedLab,
  setSelectedLab,
  labOwnersRef,
  open,
  onClose,
}) => {
  const [creating, setCreating] = useState(false)
  const { errors, validate, onFieldChange } = useFormErrors()
  const [labOwnerData, setLabOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    servicePincodes: '',
    labAddress: '',
    latitude: '',
    longitude: '',
  })

  const buildErrors = (d) => ({
    name: !d.name ? 'Full name is required' : '',
    email:
      !d.email
        ? 'Email is required'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)
          ? 'Enter a valid email'
          : '',
    phone:
      !d.phone
        ? 'Phone number is required'
        : !/^[6-9]\d{9}$/.test(d.phone)
          ? 'Enter a valid 10-digit mobile number'
          : '',
    password:
      !d.password
        ? 'Password is required'
        : d.password.length < 6
          ? 'Password must be at least 6 characters'
          : '',
    servicePincodes: !d.servicePincodes ? 'Service pincodes are required' : '',
    labAddress: !d.labAddress ? 'Lab location is required' : '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...labOwnerData, [name]: value }
    setLabOwnerData(next)
    onFieldChange(name, buildErrors(next))
  }

  const handleCreateLabOwner = async (e) => {
    e.preventDefault()
    if (creating) return
    if (!validate(buildErrors(labOwnerData))) return
    try {
      setCreating(true)
      await createLabOwner({
        ...labOwnerData,
        servicePincodes: labOwnerData.servicePincodes.split(',').map((item) => item.trim()),
      })
      toast.success('Lab Owner Created Successfully')
      onRefresh()
      onClose()
      setLabOwnerData({
        name: '',
        email: '',
        phone: '',
        password: '',
        servicePincodes: '',
        labAddress: '',
        latitude: '',
        longitude: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const [saving, setSaving] = useState(false)

  const handleUpdateLab = async () => {
    try {
      setSaving(true)
      await updateBookingLab(selectedBooking._id, selectedLab)
      toast.success('Lab Updated Successfully')
      setShowEditModal(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to Update Lab')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Can resource="lab_owners" action="create">
        <Modal
          open={open}
          title="Create Lab Owner"
          subtitle="Add new laboratory owner"
          onClose={onClose}
          size="lg"
        >
        <form onSubmit={handleCreateLabOwner} className="space-y-4">
          <Input required type="text" name="name" placeholder="Full Name" value={labOwnerData.name} onChange={handleChange} error={errors.name} />
          <Input required type="email" name="email" placeholder="Email" value={labOwnerData.email} onChange={handleChange} error={errors.email} />
          <Input
            required
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={labOwnerData.phone}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={10}
            error={errors.phone}
          />
          <Input required type="password" name="password" placeholder="Password" value={labOwnerData.password} onChange={handleChange} error={errors.password} />
          <Input required type="text" name="servicePincodes" placeholder="411033, 411044" value={labOwnerData.servicePincodes} onChange={handleChange} error={errors.servicePincodes} />
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Lab Location *</label>
            <fieldset className="border border-border rounded-xl p-5">
              <legend className="text-sm font-semibold text-foreground px-2">Select Location</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      toast.error('Geolocation is not supported by your browser')
                      return
                    }
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const lat = pos.coords.latitude
                        const lng = pos.coords.longitude
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                          const data = await res.json()
                          setLabOwnerData((prev) => ({ ...prev, labAddress: data.display_name, latitude: lat, longitude: lng }))
                          toast.success('Location detected successfully')
                        } catch {
                          setLabOwnerData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                        }
                      },
                      () => toast.error('Unable to retrieve your location')
                    )
                  }}
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
                  onClick={() => setShowLabMap(true)}
                  className="flex flex-col items-center gap-2 p-5 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition cursor-pointer"
                >
                  <Map size={24} className="text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Select on Map</p>
                    <p className="text-xs text-muted-foreground">Pick lab location on map</p>
                  </div>
                </button>
              </div>
            </fieldset>
            {labOwnerData.latitude && labOwnerData.longitude && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 mt-3">
                <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground mb-0.5">Selected Location</p>
                  <p className="text-sm text-muted-foreground">{labOwnerData.labAddress || 'Location selected'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Lat: {Number(labOwnerData.latitude).toFixed(4)}, Long: {Number(labOwnerData.longitude).toFixed(4)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLabMap(true)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 shrink-0"
                >
                  <Pencil size={12} /> Change
                </button>
              </div>
            )}
            {errors.labAddress && (
              <p className="text-destructive text-xs mt-1.5 font-medium">{errors.labAddress}</p>
            )}
            <Modal
              open={showLabMap}
              onClose={() => setShowLabMap(false)}
              title="Select Lab Location"
              size="full"
            >
              <LocationPicker
                location={{
                  lat: Number(labOwnerData.latitude) || 18.5204,
                  lng: Number(labOwnerData.longitude) || 73.8567,
                }}
                setLocation={(loc) => {
                  setLabOwnerData((prev) => ({ ...prev, latitude: loc.lat, longitude: loc.lng }))
                }}
                onLocationSelect={async (lat, lng) => {
                  try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    const data = await res.json()
                    setLabOwnerData((prev) => ({ ...prev, labAddress: data.display_name, latitude: lat, longitude: lng }))
                  } catch {
                    setLabOwnerData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!labOwnerData.latitude) {
                    toast.error('Please select a location')
                    return
                  }
                  setShowLabMap(false)
                }}
                fullWidth
                variant="success"
                className="mt-4"
              >
                Confirm Location
              </Button>
            </Modal>
          </div>
          <Button type="submit" loading={creating} fullWidth>
            Create Lab Owner
          </Button>
        </form>
        </Modal>
      </Can>

      
    </>
  )
}

export default AdminUsersSection
