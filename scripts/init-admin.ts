import { getUsers, saveUsers, User } from '../lib/data';
import { hashPassword } from '../lib/auth';

async function initAdmin() {
  const users = await getUsers();
  
  if (users.length > 0) {
    console.log('Users already exist. Skipping initialization.');
    return;
  }

  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await hashPassword(defaultPassword);

  const adminUser: User = {
    id: Date.now().toString(),
    email: 'admin@engjellrraklli.com',
    name: 'Admin User',
    password: hashedPassword,
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(adminUser);
  await saveUsers(users);

  console.log('Admin user created successfully!');
  console.log('Email: admin@engjellrraklli.com');
  console.log(`Password: ${defaultPassword}`);
  console.log('\n⚠️  Please change the default password after first login!');
}

initAdmin().catch(console.error);

