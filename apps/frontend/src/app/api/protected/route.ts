import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch('http://localhost:3000/api/protected', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      throw new Error('Failed to fetch protected data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching protected data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}