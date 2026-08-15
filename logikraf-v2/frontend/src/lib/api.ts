export const auth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
})

const handleResponse = async (r: Response) => {
  let data: any
  try {
    data = await r.json()
  } catch {
    data = null
  }
  if (!r.ok) {
    const msg = data?.error || data?.message || data?.Message || `Permintaan gagal (HTTP ${r.status})`
    throw new Error(msg)
  }
  return data
}

export const apiGet = (path: string) =>
  fetch(path, { headers: auth() }).then(handleResponse)

export const apiPut = (path: string, body: any) =>
  fetch(path, { method: 'PUT', headers: auth(), body: JSON.stringify(body) }).then(handleResponse)

export const apiPost = (path: string, body: any) =>
  fetch(path, { method: 'POST', headers: auth(), body: JSON.stringify(body) }).then(handleResponse)
