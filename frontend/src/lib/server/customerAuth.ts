import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const getCustomerToken = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieStore = cookies();
  return (
    cookieStore.get('customer_token')?.value ||
    cookieStore.get('sb-access-token')?.value ||
    cookieStore.get('sb:token')?.value ||
    null
  );
};

export const getAuthenticatedCustomerFromRequest = async (request: Request) => {
  const token = getCustomerToken(request);
  if (!token) return null;

  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userData.user?.email) {
    return null;
  }

  const { data: customerById, error: byIdError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!byIdError && customerById) {
    return customerById;
  }

  const { data: customerByEmail, error: byEmailError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('email', userData.user.email)
    .maybeSingle();

  if (byEmailError || !customerByEmail) {
    return null;
  }

  return customerByEmail;
};
