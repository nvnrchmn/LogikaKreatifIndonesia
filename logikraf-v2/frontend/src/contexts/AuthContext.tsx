import { useState, useEffect, createContext, useContext } from 'react'

interface AuthContextType {
	token: string | null
	role: string | null
	name: string | null
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
	loading: boolean
}

const AuthContext = createContext<AuthContextType>({
	token: null,
	role: null,
	name: null,
	login: async () => false,
	logout: () => {},
	loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
	const [role, setRole] = useState<string | null>(localStorage.getItem('role'))
	const [name, setName] = useState<string | null>(localStorage.getItem('name'))
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (token) {
			fetch('/health', { headers: { Authorization: `Bearer ${token}` } })
				.then(r => r.ok ? null : clear())
				.finally(() => setLoading(false))
		} else {
			setLoading(false)
		}
	}, [])

	const clear = () => {
		setToken(null)
		setRole(null)
		setName(null)
		localStorage.removeItem('token')
		localStorage.removeItem('role')
		localStorage.removeItem('name')
	}

	const login = async (email: string, password: string) => {
		const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
		if (!res.ok) return false
		const data = await res.json()
		setToken(data.token)
		setRole(data.role)
		setName(data.name)
		localStorage.setItem('token', data.token)
		localStorage.setItem('role', data.role)
		localStorage.setItem('name', data.name)
		return true
	}

	const logout = () => {
		clear()
	}

	return (
		<AuthContext.Provider value={{ token, role, name, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
