import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDefaultOrganization } from '@/lib/organizations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call Better Auth signup
    const response = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
      asResponse: true,
    });

    // If signup was successful, create organization
    if (response.status === 200) {
      const data = await response.json();
      if (data.user) {
        await createDefaultOrganization(data.user.id, data.user.email);
      }
    }

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
