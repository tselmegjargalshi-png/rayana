import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { DEMO_MODE } from '@/lib/db';
import { DEMO_ADMIN, DEMO_CUSTOMER_PASSWORD } from '@/lib/seed';
export const metadata = { title: 'Нэвтрэх' };
export default function Login() { return <Suspense><AuthForm mode="login" demo={DEMO_MODE} demoLogins={{ admin: DEMO_ADMIN, customer: { email: 'oyunaa1@rayana.demo', password: DEMO_CUSTOMER_PASSWORD } }} /></Suspense>; }
