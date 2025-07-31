import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      )
    }

    const targetUrl = `${API_BASE_URL}/api/auth/logout`
    
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      if (key !== 'host') {
        headers[key] = value
      }
    })

    const response = await axios.post(targetUrl, {}, {
      headers: {
        ...headers,
        'Authorization': authHeader,
      },
      withCredentials: true,
    })

    return NextResponse.json(response.data, {
      status: response.status,
      statusText: response.statusText,
    })
  } catch (error: any) {
    console.error('API proxy error:', error)
    
    if (error.response) {
      return NextResponse.json(
        error.response.data || { success: false, message: 'Request failed' },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 