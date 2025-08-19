import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envStatus = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      REDIS_URL: !!process.env.REDIS_URL,
      BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      success: true,
      environment: envStatus,
      message: 'Environment variables check',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check environment',
      },
      { status: 500 }
    );
  }
}
