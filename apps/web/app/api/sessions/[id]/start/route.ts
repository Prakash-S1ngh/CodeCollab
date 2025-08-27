import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sessions/${params.id}/start`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to start session' },
      { status: error.response?.status || 500 }
    )
  }
} 