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
import { MapPin, Map } from 'lucide-react'
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
            {labOwnerData.labAddress && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <div className="text-xs font-medium text-green-700 flex items-center gap-1.5">
                  <MapPin size={13} /> Lab Location Selected
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{labOwnerData.labAddress}</div>
              </div>
            )}
            {errors.labAddress && (
              <p className="text-destructive text-xs mt-1.5 font-medium mb-2">{errors.labAddress}</p>
            )}
            <button
              type="button"
              onClick={() => setShowLabMap(true)}
              className="w-full bg-primary/10 text-primary py-3 rounded-lg text-xs font-semibold hover:bg-primary/20 transition"
            >
              <Map size={14} className="inline mr-2" />
              Select Lab Location On Map
            </button>
            <Modal
              open={showLabMap}
              onClose={() => setShowLabMap(false)}
              title="Select Lab Location"
              size="lg"
            >
              <LocationPicker
                location={{
                  lat: Number(labOwnerData.latitude) || 18.5204,
                  lng: Number(labOwnerData.longitude) || 73.8567,
                }}
                setLocation={(loc) => {
                  setLabOwnerData((prev) => ({
                    ...prev,
                    latitude: loc.lat,
                    longitude: loc.lng,
                  }))
                }}
                onLocationSelect={async (lat, lng) => {
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                  )
                  const data = await response.json()
                  setLabOwnerData((prev) => ({
                    ...prev,
                    labAddress: data.display_name,
                    latitude: lat,
                    longitude: lng,
                  }))
                }}
              />
              <Button onClick={() => setShowLabMap(false)} fullWidth variant="success" className="mt-4">
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

      {/* Lab Owners Table */}
      <div ref={labOwnersRef} className="bg-white border border-border rounded-xl shadow-card mt-8 p-5 md:p-6">
        <DashboardSectionHeader title="Lab Owners" subtitle="Manage all laboratory owners" />
        {labOwners.length === 0 ? (
          <EmptyState text="No Lab Owners Found" />
        ) : (
          <div className="mt-4">
            <DataTable
              columns={labOwnerColumns}
              data={labOwners}
              enablePagination={true}
              enableSorting={true}
              pageSize={10}
            />
          </div>
        )}

        {/* Edit Modal */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Assigned Lab">
          <div className="space-y-4">
            <Select value={selectedLab} onChange={(e) => setSelectedLab(e.target.value)} label="Lab Owner">
              <option value="">Select Lab Owner</option>
              {labOwners.map((lab) => (
                <option key={lab._id} value={lab._id}>
                  {lab.name}
                </option>
              ))}
            </Select>
            <Button onClick={handleUpdateLab} disabled={!selectedLab} loading={saving} fullWidth>
              Save Changes
            </Button>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default AdminUsersSection
