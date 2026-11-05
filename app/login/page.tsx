import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { DEMO_MODE } from '@/lib/db';
import { DEMO_ADMIN, DEMO_ADMIN_PASSWORD_CUSTOM, DEMO_CUSTOMER_PASSWORD } from '@/lib/seed';
export const metadata = { title: 'Нэвтрэх' };
export default function Login() { return <Suspense><AuthForm mode="login" demo={DEMO_MODE} demoLogins={DEMO_MODE ? { admin: DEMO_ADMIN_PASSWORD_CUSTOM ? { email: '', password: '' } : DEMO_ADMIN, customer: { email: 'oyunaa1@rayana.demo', password: DEMO_CUSTOMER_PASSWORD } } : { admin: { email: '', password: '' }, customer: { email: '', password: '' } }} /></Suspense>; }
