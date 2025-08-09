import React from 'react';
import { User, Camera, Building, Briefcase, Mail } from 'lucide-react';

interface ProfileData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyName: string;
  industry: string;
}

function App() {
  const profileData: ProfileData = {
    username: 'john.doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    role: 'Sustainability Manager',
    companyName: 'Green Tech Solutions',
    industry: 'Technology'
  };

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
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-gray-600 mt-1">@{profileData.username}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span>{profileData.role}</span>
                  <span className="mx-2">•</span>
                  <Building className="w-4 h-4 mr-1" />
                  <span>{profileData.companyName}</span>
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

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.username}
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

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.role}
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

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.industry}
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

export default App;