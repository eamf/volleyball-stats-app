'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, Building2 } from 'lucide-react';

export function Profile() {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="font-medium text-gray-900">{profile?.full_name}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium text-gray-900">{profile?.email}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium text-gray-900">{profile?.phone || 'Not provided'}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Role</div>
                <div className="font-medium text-gray-900 capitalize">{profile?.role}</div>
              </div>
            </div>

            {profile?.club && (
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Club</div>
                  <div className="font-medium text-gray-900">{profile.club.name}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Account Status</div>
              <div className="text-sm text-gray-600">Your account is active and verified</div>
            </div>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="font-medium text-gray-900 mb-2">Data & Privacy</div>
            <p className="text-sm text-gray-600 mb-4">
              Your data is securely stored and used only for volleyball statistics tracking and analysis.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}