import { useState, useEffect } from 'react'
import { BellOutlined } from '@ant-design/icons'
import { Badge, Button, Dropdown, List, Typography, Modal, Form, Input, DatePicker, message } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

const { Text, Title } = Typography

interface Notification {
  id: number
  type: string
  title: string
  message: string
  ref_table: string
  ref_id: number
  is_read: boolean
  created_at: string
}

const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

const fetchNotificationCount = async (): Promise<number> => {
  const res = await fetch('/api/notifications/count', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.count || 0
}

const markRead = async (id: number) => {
  await fetch(`/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
}

const markAllRead = async () => {
  await fetch('/api/notifications/read-all', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
}

const createProjectFromPayment = async (notifId: number, values: any) => {
  const body = {
    name: values.name,
    description: values.description,
    start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
    deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
  }
  const res = await fetch(`/api/notifications/${notifId}/create-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create project')
  return res.json()
}

export function NotificationBell() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null)
  const queryClient = useQueryClient()

  const { data: count = 0 } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: fetchNotificationCount,
    refetchInterval: 30000,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  })

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] })
    },
  })

  const createProjectMutation = useMutation({
    mutationFn: ({ notifId, values }: { notifId: number; values: any }) =>
      createProjectFromPayment(notifId, values),
    onSuccess: () => {
      message.success('Project created successfully')
      setModalOpen(false)
      setSelectedNotif(null)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => {
      message.error('Failed to create project')
    },
  })

  const handleNotifClick = (notif: Notification) => {
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id)
    }
    if (notif.type === 'payment_settled') {
      setSelectedNotif(notif)
      setModalOpen(true)
    }
  }

  const handleCreateProject = (values: any) => {
    if (selectedNotif) {
      createProjectMutation.mutate({ notifId: selectedNotif.id, values })
    }
  }

  const dropdownContent = (
    <div className="w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <Title level={5} style={{ margin: 0 }}>Notifications</Title>
        {count > 0 && (
          <Button type="link" size="small" onClick={() => markAllReadMutation.mutate()}>
            Mark all read
          </Button>
        )}
      </div>
      <List
        dataSource={notifications}
        locale={{ emptyText: 'No new notifications' }}
        renderItem={(notif) => (
          <List.Item
            onClick={() => handleNotifClick(notif)}
            className={`cursor-pointer hover:bg-blue-50 px-4 py-3 ${
              !notif.is_read ? 'bg-blue-50/50' : ''
            }`}
          >
            <List.Item.Meta
              title={
                <Text strong={!notif.is_read} className="text-sm">
                  {notif.title}
                </Text>
              }
              description={
                <Text type="secondary" className="text-xs line-clamp-2">
                  {notif.message}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )

  return (
    <>
      <Dropdown dropdownRender={() => dropdownContent} trigger={['click']} placement="bottomRight">
        <Badge count={count} size="small">
          <Button type="text" icon={<BellOutlined className="text-xl" />} />
        </Badge>
      </Dropdown>

      <Modal
        title="Create Project from Payment"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setSelectedNotif(null)
        }}
        footer={null}
      >
        {selectedNotif && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <Text strong>{selectedNotif.title}</Text>
            <br />
            <Text type="secondary" className="text-sm">
              {selectedNotif.message}
            </Text>
          </div>
        )}
        <Form layout="vertical" onFinish={handleCreateProject}>
          <Form.Item
            label="Project Name"
            name="name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="e.g. Website Redesign for Client" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Project scope and details..." />
          </Form.Item>
          <Form.Item label="Start Date" name="start_date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item label="Deadline" name="deadline">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createProjectMutation.isPending}
              block
            >
              Create Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
