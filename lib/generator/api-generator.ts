import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function generateAPIRoutes(outputPath: string) {
  await mkdir(join(outputPath, 'app', 'api', 'data'), { recursive: true });
  await mkdir(join(outputPath, 'app', 'api', 'verify'), { recursive: true });

  const dataRouteTs = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const endpoint = searchParams.get('endpoint') || '/api/data';
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '10';

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 401 }
    );
  }

  try {
    const targetUrl = new URL(endpoint, request.url);
    targetUrl.searchParams.set('token', token);
    targetUrl.searchParams.set('page', page);
    targetUrl.searchParams.set('pageSize', pageSize);

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data', details: await response.text() },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const body = await request.json();

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 401 }
    );
  }

  try {
    const endpoint = body.endpoint || '/api/data';
    const targetUrl = new URL(endpoint, request.url);

    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
      },
      body: JSON.stringify(body.data),
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to submit data', details: await response.text() },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

  const verifyRouteTs = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'Token is required' },
      { status: 401 }
    );
  }

  try {
    const verifyUrl = new URL('/api/verify', request.url);
    verifyUrl.searchParams.set('token', token);

    const response = await fetch(verifyUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ valid: true, ...data });
    }

    return NextResponse.json(
      { valid: false, error: 'Invalid or expired token' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'Token is required' },
      { status: 401 }
    );
  }

  try {
    const verifyUrl = new URL('/api/verify', request.url);

    const response = await fetch(verifyUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`,
      },
      body: JSON.stringify({ token }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ valid: true, ...data });
    }

    return NextResponse.json(
      { valid: false, error: 'Invalid or expired token' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
`;

  await writeFile(join(outputPath, 'app', 'api', 'data', 'route.ts'), dataRouteTs);
  await writeFile(join(outputPath, 'app', 'api', 'verify', 'route.ts'), verifyRouteTs);
}
