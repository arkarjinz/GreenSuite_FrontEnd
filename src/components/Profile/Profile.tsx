// src/components/Profile/Profile.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Camera, Building, Briefcase, Mail, Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { UserProfileDto, Role, ApprovalStatus } from '../../types/user'; // Go up 2 levels from components/Profile/
import { UserService } from '../../lib/api/userService'; // Go up 2 levels from components/Profile/

function Profile() {
  const [profileData, setProfileData] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await UserService.getUserProfile();
        setProfileData(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const getApprovalStatusDisplay = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: 'Approved',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case ApprovalStatus.PENDING:
        return {
          icon: <Clock className="w-4 h-4 text-yellow-600" />,
          text: 'Pending',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        };
      case ApprovalStatus.REJECTED:
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          text: 'Rejected',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-gray-600" />,
          text: 'Unknown',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  const getRoleDisplay = (role: Role) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  const approvalStatus = getApprovalStatusDisplay(profileData.approvalStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/GS logo(1).png" alt="Green Suite" className="w-8 h-8" />
              <h1 className="text-xl font-semibold text-gray-900">Green Suite</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Dashboard</a>
              <a href="#" className="text-green-600 font-medium">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-green-600">
                  <Camera className="w-4 h-4 text-green-600" />
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  {profileData.globalAdmin && (
                    <div className="flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3 mr-1" />
                      Global Admin
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-1">@{profileData.userName}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span>{getRoleDisplay(profileData.companyRole)}</span>
                  <span className="mx-2">•</span>
                  <Building className="w-4 h-4 mr-1" />
                  <span>{profileData.companyName}</span>
                </div>
                
                {/* Approval Status */}
                <div className="mt-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${approvalStatus.bgColor} ${approvalStatus.textColor}`}>
                    {approvalStatus.icon}
                    <span className="ml-1">Status: {approvalStatus.text}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">
                  Personal Information
                </h3>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm">
                    {profileData.id}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.userName}
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.firstName}
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.lastName}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.email}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">
                  Professional Information
                </h3>

                {/* Company ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company ID
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm">
                    {profileData.companyId}
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Company Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.companyName}
                  </div>
                </div>

                {/* Company Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Role
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {getRoleDisplay(profileData.companyRole)}
                  </div>
                </div>

                {/* Global Admin Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Global Admin
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.globalAdmin ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </div>
                </div>

                {/* Approval Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${approvalStatus.bgColor} ${approvalStatus.textColor}`}>
                      {approvalStatus.icon}
                      <span className="ml-1">{approvalStatus.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;