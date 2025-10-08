import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import HomeTemplate from '@/templates/HomeTemplate';

const HomePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;  

  if (!token) redirect('/login');

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.SIMPLE_LOGIN_SECRET));
  } catch {
    redirect('/login');
  }

  return (
    <div>
      <HomeTemplate />
    </div>
  );
}

export default HomePage
