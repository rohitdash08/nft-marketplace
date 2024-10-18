import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In a real application, you would validate the token and fetch user data from your database
    // For this example, we'll just return mock data
    const userData = {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe',
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}