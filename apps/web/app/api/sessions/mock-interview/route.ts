import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await axios.post(`${API_BASE_URL}/api/sessions/mock-interview`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Error creating mock interview:', error)
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to create mock interview' },
      { status: error.response?.status || 500 }
    )
  }
} 