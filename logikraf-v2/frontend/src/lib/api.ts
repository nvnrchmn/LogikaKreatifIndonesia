export const auth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
})

export const apiGet = (path: string) =>
  fetch(path, { headers: auth() }).then(r => (r.ok ? r.json() : Promise.reject()))

export const apiPut = (path: string, body: any) =>
  fetch(path, { method: 'PUT', headers: auth(), body: JSON.stringify(body) }).then(r =>
    r.ok ? r.json() : Promise.reject()
  )

export const apiPost = (path: string, body: any) =>
  fetch(path, { method: 'POST', headers: auth(), body: JSON.stringify(body) }).then(r =>
    r.ok ? r.json() : Promise.reject()
  )
