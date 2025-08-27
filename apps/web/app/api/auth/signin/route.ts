import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3002'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const targetUrl = `${API_BASE_URL}/api/auth/signin`

    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      if (key !== 'host') {
        headers[key] = value
      }
    })

    const response = await axios.post(targetUrl, body, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    // Extract tokens from response
    const { accessToken, refreshToken, ...rest } = response.data.data
    // console.log(response.data.data);
    // console.log("accesstoken",accessToken);
    // console.log("refreshtoken",refreshToken);

    const res = NextResponse.json(rest, {
      status: response.status,
      statusText: response.statusText,
    })

    if (accessToken) {
      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: false, // false for localhost
        sameSite: 'none', // lax for localhost
        path: '/',
        maxAge: 60 * 60
      })
    }
    if (refreshToken) {
      res.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
    }
    return res
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