import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, Input, Button, Table, Modal, Form, Switch, Image, message } from 'antd'

interface Service {
  id: string
  name: string
  slug: string
  icon?: string
  cover_image?: string
  short_description?: string
  description?: string
  is_published?: boolean
  features?: ServiceFeature[]
  created_at?: string
  updated_at?: string
}

interface ServiceFeature {
  id: string
  title: string
  description?: string
  icon?: string
  order_no?: number
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Bangunan Tinggal',
    slug: 'residential-buildings',
    cover_image: '/images/cover.jpg',
    short_description: 'Properti hunian nyaman',
    is_published: true,
    features: [
      { id: 'f1', title: 'Luas Bangunan', description: '200 m²', order_no: 1 },
      { id: 'f2', title: 'Jumlah Kamar', description: '4 kamar', order_no: 2 },
    ]
  }
]

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form] = Form.useForm()

  const { data: services = mockServices, isLoading } = useQuery(['services'], () => Promise.resolve(mockServices))

  const createMutation = useMutation({
    mutationFn: async () => { console.log('create') },
    onSuccess: () => { message.success('Created'); setIsModalOpen(false); form.resetFields() },
  })

  const updateMutation = useMutation({
    mutationFn: async () => { console.log('update') },
    onSuccess: () => { message.success('Updated'); setIsModalOpen(false); setEditingService(null); form.resetFields() },
  })

  const handleCreate = () => form.validateFields().then(() => createMutation.mutate())
  const handleUpdate = () => form.validateFields().then(() => updateMutation.mutate())

  const openModal = (s?: Service) => {
    setEditingService(s || null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const columns = [
    { title: 'Nama', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Terbitkan', dataIndex: 'is_published', key: 'is_published', render: (v: boolean) => 
      v ? <span className="text-green-600">Ya</span> : <span className="text-gray-500">Tidak</span> 
    },
    { title: 'Action', key: 'action', render: (_: any, rec: Service) => 
      <Button size="small" onClick={() => openModal(rec)}>Edit</Button> 
    },
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Services</h1>

      <Button type="primary" onClick={() => openModal()} className="mb-4">Tambah Service</Button>

      <Card>
        <Table 
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        title={editingService ? 'Edit Service' : 'Tambah Service'}
        onCancel={() => setIsModalOpen(false)}
        onOk={editingService ? handleUpdate : handleCreate}
        okText={editingService ? 'Update' : 'Create'}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nama" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="icon" label="Icon"><Input placeholder="URL icon" /></Form.Item>
          <Form.Item name="cover_image" label="Cover Image"><Input placeholder="URL cover image" /></Form.Item>
          <Form.Item name="short_description" label="Deskripsi Singkat"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="description" label="Deskripsi Panjang"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="is_published" label="Terbitkan" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}