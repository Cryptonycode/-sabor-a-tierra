import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'admin_token';

const getBackendApiUrl = () => {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
}

export const getAuthenticatedAdmin = async (): Promise<AuthenticatedAdmin | null> => {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const backendResponse = await fetch(`${getBackendApiUrl()}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({}),
      cache: 'no-store'
    });

    const data = await backendResponse.json();
    if (!backendResponse.ok || !data?.success || !data?.admin) {
      return null;
    }

    return data.admin as AuthenticatedAdmin;
  } catch {
    return null;
  }
};
