import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, Input, Button, Select, message } from 'antd'

interface Setting {
  key: string
  value: string
}

const SETTINGS_KEYS = [
  'site_name',
  'site_description',
  'company_email',
  'company_phone',
  'company_address',
  'company_name',
  'smtp_host',
  'smtp_port',
  'smtp_user',
  'smtp_password',
]

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'identity' | 'contact' | 'smtp' | 'payment'>('identity')

  const { data: settings = [], isLoading } = useQuery(['settings'], async () => {
    const res = await fetch('/api/settings')
    return res.json()
  })

  const updateMutation = useMutation(
    async (s: Setting) => {
      const res = await fetch(`/api/settings/${s.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      return res.json()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['settings'])
        message.success('Disimpan')
      },
      onError: () => message.error('Gagal disimpan'),
    }
  )

  const getValue = (key: string) => settings.find(s => s.key === key)?.value || ''

  const handleChange = (key: string, value: string) => 
    updateMutation.mutate({ key, value })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pengaturan Situs</h1>
      
      <div className="flex gap-2 mb-4">
        <Button 
          type={activeTab === 'identity' ? 'primary' : 'default'}
          onClick={() => setActiveTab('identity')}
        >
          Identitas
        </Button>
        <Button 
          type={activeTab === 'contact' ? 'primary' : 'default'}
          onClick={() => setActiveTab('contact')}
        >
          Kontak
        </Button>
        <Button 
          type={activeTab === 'smtp' ? 'primary' : 'default'}
          onClick={() => setActiveTab('smtp')}
        >
          SMTP
        </Button>
        <Button 
          type={activeTab === 'payment' ? 'primary' : 'default'}
          onClick={() => setActiveTab('payment')}
        >
          Payment Gateway
        </Button>
      </div>

      <Card>
        {activeTab === 'identity' && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="Nama Situs" 
              value={getValue('site_name')}
              onChange={e => handleChange('site_name', e.target.value)}
            />
            <Input 
              placeholder="Deskripsi Singkat" 
              value={getValue('site_description')}
              onChange={e => handleChange('site_description', e.target.value)}
            />
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="Email Perusahaan" 
              value={getValue('company_email')}
              onChange={e => handleChange('company_email', e.target.value)}
            />
            <Input 
              placeholder="No. Telepon" 
              value={getValue('company_phone')}
              onChange={e => handleChange('company_phone', e.target.value)}
            />
            <Input 
              placeholder="Alamat" 
              value={getValue('company_address')}
              onChange={e => handleChange('company_address', e.target.value)}
              className="col-span-2"
            />
          </div>
        )}

        {activeTab === 'smtp' && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="SMTP Host" 
              value={getValue('smtp_host')}
              onChange={e => handleChange('smtp_host', e.target.value)}
            />
            <Input 
              placeholder="SMTP Port" 
              value={getValue('smtp_port')}
              onChange={e => handleChange('smtp_port', e.target.value)}
            />
            <Input 
              placeholder="Username" 
              value={getValue('smtp_user')}
              onChange={e => handleChange('smtp_user', e.target.value)}
            />
            <Input 
              type="password"
              placeholder="Password" 
              value={getValue('smtp_password')}
              onChange={e => handleChange('smtp_password', e.target.value)}
            />
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="grid grid-cols-2 gap-4">
            <Select 
              placeholder="Pilih Gateway"
              value={getValue('payment_gateway') || 'midtrans'}
              onChange={(v) => handleChange('payment_gateway', v)}
              options={[
                { label: 'Midtrans', value: 'midtrans' },
                { label: 'Xendit', value: 'xendit' },
              ]}
            />
          </div>
        )}
      </Card>
    </div>
  )
}