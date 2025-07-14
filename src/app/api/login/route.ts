// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ message: 'ID token is required.' }, { status: 400 });
    }

    // The cookie will be set for 1 day
    const expiresIn = 60 * 60 * 24 * 1000; 
    const options = {
      name: 'idToken',
      value: idToken,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(options);

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
