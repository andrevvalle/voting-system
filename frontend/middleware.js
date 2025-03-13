import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function middleware(request) {
  const response = NextResponse.next();
  
  if (!request.cookies.has('voter_id')) {
    const voterId = uuidv4();
    response.cookies.set('voter_id', voterId, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    );
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api/auth|_next|_static|_vercel|favicon.ico|robots.txt).*)',
  ],
};