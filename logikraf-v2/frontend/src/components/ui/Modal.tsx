import { Modal as AntModal } from 'antd'
import type { ReactNode } from 'react'

/**
 * Reusable modal wrapper around antd Modal (already a project dependency).
 * Nielsen #2 Match: uses existing design language.
 * Nielsen #3 User control: closeable + ESC + backdrop click.
 * Nielsen #7 Flexibility: title/footer are caller-provided.
 */
interface Props {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  width?: number
  footer?: ReactNode
}

export default function Modal({ open, onClose, title, children, width = 512, footer = null }: Props) {
  return (
    <AntModal
      open={open}
      onCancel={onClose}
      footer={footer}
      width={width}
      styles={{ body: { maxHeight: '85vh', overflowY: 'auto' } }}
      title={title}
    >
      {children}
    </AntModal>
  )
}
