// Shared mock users storage for development
export const mockUsers = new Map()

export const addMockUser = (email: string, user: any) => {
  mockUsers.set(email, user)
}

export const getMockUser = (email: string) => {
  return mockUsers.get(email)
}

export const findMockUserById = (id: string) => {
  for (const [email, user] of mockUsers.entries()) {
    if (user.id === id) {
      return user
    }
  }
  return null
}

export const getAllMockUsers = () => {
  return Array.from(mockUsers.entries()).map(([email, user]) => ({
    email,
    id: user.id,
    username: user.username,
    displayName: user.displayName
  }))
} 