import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/sessions/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to fetch session' },
      { status: error.response?.status || 500 }
    )
  }
} 