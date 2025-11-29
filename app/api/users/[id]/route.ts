import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUsers, saveUsers, User } from '@/lib/data';
import { hashPassword } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { email, name, password, role } = await request.json();
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === params.id);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser: User = {
      ...users[userIndex],
      email: email || users[userIndex].email,
      name: name || users[userIndex].name,
      role: role || users[userIndex].role,
      updatedAt: new Date().toISOString(),
    };

    if (password) {
      updatedUser.password = await hashPassword(password);
    }

    users[userIndex] = updatedUser;
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== params.id);
    
    if (filteredUsers.length === users.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    saveUsers(filteredUsers);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

