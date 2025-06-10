'use client';

import { SupabaseTest } from '@/components/SupabaseTest';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader title="Supabase Test" description="Testing Supabase connection" />
      <SupabaseTest />
    </div>
  );
}