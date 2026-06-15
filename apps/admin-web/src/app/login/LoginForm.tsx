'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput, BRAND_PHONE, BRAND_PHONE_HREF } from '@mc-labor/shared';
import { login, getRedirectPath } from '@/lib/auth';
import { BrandLogo, PhoneIcon } from '@/components/brand';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import './login.css';

const inputClassName =
  'rounded-xl border-gray-200 bg-gray-50/80 px-4 py-2.5 text-base transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      router.push(getRedirectPath(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const message = searchParams.get('message');

  return (
    <div className="login-page relative flex min-h-screen flex-col">
      <div className="login-page__bg pointer-events-none absolute inset-0">
        <Image
          src={BRAND_HERO_IMAGES.contact}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-primary-dark/45 to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(51,129,203,0.25),transparent_55%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <BrandLogo priority href="https://www.mclabor.com" className="max-w-[200px] drop-shadow-md sm:max-w-[240px]" />
        <a
          href={BRAND_PHONE_HREF}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:text-base"
        >
          <PhoneIcon className="h-4 w-4 shrink-0 text-sky-200" />
          {BRAND_PHONE}
        </a>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="login-card w-full max-w-[440px]">
          <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="relative h-36 sm:h-40">
              <Image
                src={BRAND_HERO_IMAGES.contact}
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="440px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-slate-900/30" />
              <div className="absolute inset-x-0 bottom-0 px-8 pb-5">
                <p className="text-[11px] font-medium tracking-[0.2em] text-primary">Secure portal</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                  Sign in
                </h1>
              </div>
            </div>

            <div className="px-7 py-7 sm:px-8 sm:py-8">
              <p className="mb-6 text-sm leading-relaxed text-gray-500">
                Enter your email and password to access the workforce management portal.
              </p>

              {message === 'worker-mobile' && (
                <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm leading-relaxed text-blue-800">
                  Worker accounts use the mobile app. Please sign in with the MC Labor mobile app.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormField label="Email" error={errors.email?.message}>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={inputClassName}
                    {...register('email')}
                  />
                </FormField>

                <FormField label="Password" error={errors.password?.message}>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={inputClassName}
                    {...register('password')}
                  />
                </FormField>

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 w-full rounded-xl py-3 normal-case tracking-normal"
                  loading={loading}
                >
                  Sign in
                </Button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm leading-relaxed text-white/85">
            Workforce Management Platform for administrators, customers, and supervisors.
          </p>
        </div>
      </main>

      <footer className="relative z-10 px-4 pb-6 text-center text-xs text-white/55">
        <span>&copy; {new Date().getFullYear()} MC Labor Sources Inc.</span>
        <span className="mx-2" aria-hidden="true">
          ·
        </span>
        <Link href="https://www.mclabor.com" className="text-white/70 underline-offset-2 hover:text-white hover:underline">
          mclabor.com
        </Link>
      </footer>
    </div>
  );
}
