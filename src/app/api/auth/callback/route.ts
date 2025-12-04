import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Default to dashboard ('/') if no specific 'next' param is provided
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    // FIX: Added 'await' here. This is required because createSupabaseServerClient is async.
    const supabase = await createSupabaseServerClient(cookieStore)
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful login! Redirect to the dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Login failed? Redirect to an error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}