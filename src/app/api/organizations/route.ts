import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/middleware';
import { getUserOrganizations } from '@/lib/organizations';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json([], { status: 200 });
    }

    const organizations = await getUserOrganizations(session.user.id);

    return NextResponse.json(organizations || []);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json([], { status: 200 });
  }
}
