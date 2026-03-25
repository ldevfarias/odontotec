'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { activeClinic, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && activeClinic?.role === 'DENTIST') {
            router.push('/dashboard');
        }
    }, [activeClinic, isLoading, router]);

    if (isLoading || activeClinic?.role === 'DENTIST') {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return <>{children}</>;
}
