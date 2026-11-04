import { Suspense } from 'react';
import { AuthForm } from '@/components/AuthForm';
export const metadata = { title: 'Бүртгүүлэх' };
export default function Register() { return <Suspense><AuthForm mode="register" demo={false} demoLogins={{ admin: { email: '', password: '' }, customer: { email: '', password: '' } }} /></Suspense>; }
