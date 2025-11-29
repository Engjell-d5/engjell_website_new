import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUsers, saveUsers, User } from '@/lib/data';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const users = (await getUsers()).map(({ password, ...user }) => user);
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { email, name, password, role } = await request.json();

    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const users = await getUsers();
    
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'editor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

