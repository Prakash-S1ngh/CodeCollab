import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002'

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/sessions`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to fetch sessions' },
      { status: error.response?.status || 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Read access token from cookies
    const accessToken = request.cookies.get('accessToken')?.value
    console.log("access token ",accessToken);
    console.log("Body of session ",body);

    const response = await axios.post(`${API_BASE_URL}/api/sessions`, body, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      withCredentials: true,
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || 'Failed to create session' },
      { status: error.response?.status || 500 }
    )
  }
} 