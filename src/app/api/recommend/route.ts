import { NextResponse } from 'next/server';
import { getToolRecommendations } from '@/lib/openrouter';

export async function POST(request: Request) {
  try {
    const { useCase } = await request.json();

    if (!useCase) {
      return NextResponse.json({ error: 'useCase is required' }, { status: 400 });
    }

    const { recommendations } = await getToolRecommendations(useCase);

    if (!recommendations || recommendations.length < 2) {
      return NextResponse.json({ error: 'Failed to generate sufficient recommendations' }, { status: 500 });
    }

    return NextResponse.json({ data: { recommendations } });
  } catch (error) {
    console.error('Error in /api/recommend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
