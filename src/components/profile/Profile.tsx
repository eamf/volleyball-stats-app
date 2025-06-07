'use client';

import { useAuth } from '@/contexts/AuthContext';

export function Profile() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-gray-900">{profile?.full_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{profile?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-gray-900 capitalize">{profile?.role}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-gray-900">{profile?.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-gray-500">Profile editing functionality will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}