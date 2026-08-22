export const auth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
})

export type ApiData = Record<string, unknown>

const handleResponse = async (r: Response): Promise<ApiData | null> => {
  let data: ApiData | null = null
  try {
    data = (await r.json()) as ApiData
  } catch {
    data = null
  }
  if (!r.ok) {
    const msg =
      (data?.error as string) ||
      (data?.message as string) ||
      (data?.Message as string) ||
      `Permintaan gagal (HTTP ${r.status})`
    throw new Error(msg)
  }
  return data
}

export const apiGet = (path: string) => fetch(path, { headers: auth() }).then(handleResponse)

export const apiPut = (path: string, body: unknown) =>
  fetch(path, { method: 'PUT', headers: auth(), body: JSON.stringify(body) }).then(handleResponse)

export const apiPost = (path: string, body: unknown) =>
  fetch(path, { method: 'POST', headers: auth(), body: JSON.stringify(body) }).then(handleResponse)
