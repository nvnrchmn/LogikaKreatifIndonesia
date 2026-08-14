import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, Input, Button, Table, Modal, Form, Select, Image, Upload, message } from 'antd'
import type { UploadFile } from 'antd/lib/upload/interface'

interface Business {
  id: string
  name: string
  slug: string
  logo?: string
  cover_image?: string
  description?: string
  address?: string
  google_maps?: string
  category?: string
  status?: string
  created_at?: string
  updated_at?: string
}

const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Perumahan Senayan',
    slug: 'senayan-residence',
    logo: '/images/logo.png',
    cover_image: '/images/cover.jpg',
    description: 'Proyek hunian mewah di tengah kota',
    address: 'Jl. Senayan No. 1, Jakarta',
    google_maps: 'https://maps.google.com/maps?q= Jakarta',
    category: 'residential',
    status: 'active',
  }
]

export default function BusinessesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: businesses = mockBusinesses, isLoading } = useQuery(['businesses'], () => Promise.resolve(mockBusinesses))

  const createMutation = useMutation(
    async (data: Business) => { console.log('create', data) },
    { onSuccess: () => { message.success('Created'); setIsModalOpen(false); form.resetFields() } }
  )

  const updateMutation = useMutation(
    async (data: Business) => { console.log('update', data) },
    { onSuccess: () => { message.success('Updated'); setIsModalOpen(false); setEditingBusiness(null); form.resetFields() } }
  )

  const handleCreate = () => {
    form.validateFields().then(values => createMutation.mutate(values))
  }

  const handleUpdate = () => {
    form.validateFields().then(values => updateMutation.mutate({ ...editingBusiness, ...values }))
  }

  const openModal = (biz?: Business) => {
    if (biz) {
      setEditingBusiness(biz)
    } else {
      setEditingBusiness(null)
    }
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log('delete', id)
    message.success('Deleted')
  }

  const columns = [
    { title: 'Nama', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Kategori', dataIndex: 'category', key: 'category' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <span className="text-green-600">{s}</span> },
    { title: 'Action', key: 'action', render: (_: any, rec: Business) => (
      <Button size="small" onClick={() => openModal(rec)}>Edit</Button>
    )},
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Businesses</h1>

      <Button type="primary" onClick={() => openModal()} className="mb-4">Tambah Business</Button>

      <Card>
        <Table 
          columns={columns}
          dataSource={businesses}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        title={editingBusiness ? 'Edit Business' : 'Tambah Business'}
        onCancel={() => setIsModalOpen(false)}
        onOk={editingBusiness ? handleUpdate : handleCreate}
        okText={editingBusiness ? 'Update' : 'Create'}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nama" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="logo" label="Logo"><Input placeholder="URL logo" /></Form.Item>
          <Form.Item name="cover_image" label="Cover Image"><Input placeholder="URL cover image" /></Form.Item>
          <Form.Item name="description" label="Deskripsi"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="address" label="Alamat"><Input /></Form.Item>
          <Form.Item name="google_maps" label="Google Maps URL"><Input /></Form.Item>
          <Form.Item name="category" label="Kategori"><Input /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Tidak Aktif' }]} defaultValue="active" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}