import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { createTest } from '@/services/test.service'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import useFormErrors from '@/hooks/useFormErrors'

const AdminTestsSection = ({ open, onClose, onCreated }) => {
  const [creating, setCreating] = useState(false)
  const { errors, validate, onFieldChange } = useFormErrors()
  const [testData, setTestData] = useState({
    title: '',
    category: '',
    price: '',
    reportTime: '',
    description: '',
    image: '',
  })

  const buildErrors = (t) => ({
    title: !t.title ? 'Test title is required' : '',
    category: !t.category ? 'Category is required' : '',
    price: !t.price ? 'Price is required' : '',
    reportTime: !t.reportTime ? 'Report time is required' : '',
    description: !t.description ? 'Description is required' : '',
    image: !t.image ? 'Image URL is required' : '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...testData, [name]: value }
    setTestData(next)
    onFieldChange(name, buildErrors(next))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (creating) return
    if (!validate(buildErrors(testData))) return
    try {
      setCreating(true)
      await createTest(testData)
      toast.success('Test Created Successfully')
      onCreated()
      onClose()
      setTestData({
        title: '',
        category: '',
        price: '',
        reportTime: '',
        description: '',
        image: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Create Test"
      subtitle="Fill all required details"
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          required
          type="text"
          name="title"
          placeholder="Test Title"
          value={testData.title}
          onChange={handleChange}
          error={errors.title}
        />
        <Input
          required
          type="text"
          name="category"
          placeholder="Category"
          value={testData.category}
          onChange={handleChange}
          error={errors.category}
        />
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            required
            type="number"
            name="price"
            placeholder="Price"
            value={testData.price}
            onChange={handleChange}
            error={errors.price}
          />
          <Input
            required
            type="text"
            name="reportTime"
            placeholder="Report Time"
            value={testData.reportTime}
            onChange={handleChange}
            error={errors.reportTime}
          />
        </div>
        <Textarea
          rows="4"
          name="description"
          placeholder="Description"
          value={testData.description}
          onChange={handleChange}
          error={errors.description}
        />
        <Input
          type="text"
          name="image"
          placeholder="Image URL"
          value={testData.image}
          onChange={handleChange}
          error={errors.image}
        />
        <Button type="submit" loading={creating} fullWidth>
          Create Test
        </Button>
      </form>
    </Modal>
  )
}

export default AdminTestsSection
