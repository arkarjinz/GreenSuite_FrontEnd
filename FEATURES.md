# GreenSuite Frontend Features

This document outlines the new features that have been implemented to connect the frontend with the backend controllers.

## New Features

### 1. AI Chat Interface
- **Location**: `/ai-chat`
- **Component**: `ChatInterface.tsx`
- **Backend**: Connects to `AIChatController`
- **Features**:
  - Real-time chat with Rin Kazuki (AI environmental expert)
  - Tsundere personality with relationship tracking
  - Environmental tips and advice
  - Chat history management
  - Conversation persistence

### 2. Reapply System
- **Location**: `/reapply`
- **Component**: `ReapplyPage.tsx`
- **Backend**: Connects to `AuthController.reapply()`
- **Features**:
  - Form for rejected users to submit new applications
  - Company search functionality
  - Validation and error handling
  - Automatic redirect to pending page after submission

### 3. Rejected Users Management (Owner Only)
- **Location**: `/dashboard/owner/rejected`
- **Component**: `RejectedUsersManager.tsx`
- **Backend**: Connects to `OwnerController`
- **Features**:
  - View list of rejected users
  - View rejection history for each user
  - Reapprove rejected users
  - Detailed rejection reasons

### 4. Enhanced User Management (Owner Only)
- **Location**: `/dashboard/owner/users`
- **Backend**: Connects to `OwnerController`
- **Enhancements**:
  - Rejection reason modal
  - Improved user approval/rejection workflow
  - Better error handling and user feedback

### 5. Rejected User Page
- **Location**: `/rejected`
- **Component**: `RejectedPage.tsx`
- **Features**:
  - Information page for rejected users
  - Clear next steps and guidance
  - Direct link to reapply form
  - Common rejection reasons explanation

## API Integration

### New API Functions Added

#### AI Chat API (`aiChatApi`)
```typescript
- chat(message, conversationId?, userId?, sessionId?)
- streamChat(message, conversationId?, userId?, sessionId?)
- getChatHistory(conversationId, userId?, sessionId?)
- clearChatHistory(conversationId, userId?, sessionId?)
- getRinPersonality(conversationId, userId?, sessionId?)
- getEnvironmentalTips()
```

#### Enhanced Auth API (`authApi`)
```typescript
- reapply(reapplyDto)
```

#### Enhanced Owner API (`ownerApi`)
```typescript
- rejectUser(userId, reason?)
- getUserRejectionHistory(userId)
- getCompanyStats()
```

## Navigation Updates

### New Navigation Links
- **AI Assistant**: Available to all authenticated users
- **Rejected Users**: Available only to company owners
- **Enhanced User Management**: Improved owner dashboard

### Dashboard Cards
- Quick access cards for all major features
- Role-based visibility (owner-specific cards)
- Direct links to AI chat, user management, and other features

## User Flow

### For Rejected Users
1. User logs in with rejected status
2. Automatically redirected to `/rejected`
3. Views rejection information and guidance
4. Clicks "Submit New Application" to go to `/reapply`
5. Fills out new application form
6. Submits and gets redirected to `/pending`

### For Company Owners
1. Access user management via dashboard or navigation
2. View pending users and approve/reject with reasons
3. Access rejected users management to view history
4. Reapprove users if needed
5. View company statistics

### For All Users
1. Access AI chat via dashboard or navigation
2. Chat with Rin Kazuki about environmental topics
3. Get personalized environmental tips
4. View relationship level and personality state

## Technical Implementation

### Components Created
- `ChatInterface.tsx` - AI chat interface
- `ReapplyForm.tsx` - Reapplication form
- `RejectedUsersManager.tsx` - Owner rejected users management
- `RejectedPage.tsx` - Rejected user information page

### Pages Created
- `/ai-chat` - AI chat page
- `/reapply` - Reapplication page
- `/rejected` - Rejected user page
- `/dashboard/owner/rejected` - Owner rejected users management

### Context Updates
- Enhanced `AuthContext` to handle rejected status
- Automatic redirects based on approval status

## Backend Integration

The frontend now fully integrates with the following backend controllers:

1. **AIChatController** - AI chat functionality with Rin Kazuki personality
2. **AuthController** - Authentication and reapplication functionality
3. **OwnerController** - User management and rejection handling

All API calls include proper error handling, loading states, and user feedback. 