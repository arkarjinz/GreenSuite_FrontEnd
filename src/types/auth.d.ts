export type LoginDto = {
    email: string;
    password: string;
};

export type RegisterDto = {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    companyRole: 'OWNER' | 'MANAGER' | 'EMPLOYEE';
    companyId?: string;
    companyName?: string;
    companyAddress?: string;
    industry?: string;
};

export type AuthUser = {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    companyId?: string;
    companyName?: string;
    companyRole: string;
    globalAdmin?: boolean;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt?: string;
    lastActive?: string;
    streakCount?: number;
    roles?: string[];
    
    // AI Credits
    aiCredits?: number;
    canChat?: boolean;
    maxPossibleChats?: number;
    isLowOnCredits?: boolean;
    
    // Credit tracking from backend
    totalCreditsPurchased?: number;
    totalCreditsUsed?: number;
    lastCreditPurchase?: string;
    subscriptionTier?: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
    maxCredits?: number;
    canReceiveCredits?: boolean;
    
    // Auto-refill feature
    autoRefillEnabled?: boolean;
    lastAutoRefill?: string;
    nextAutoRefill?: string;
    
    // Ban and rejection tracking
    rejectionCount?: number;
    remainingAttempts?: number;
    banned?: boolean;
    banReason?: string;
    bannedAt?: string;
    approachingBan?: boolean;
    warning?: boolean;
    lastRejectionAt?: string;
};

export type AICreditInfo = {
    currentCredits: number;
    chatCost: number;
    canChat: boolean;
    possibleChats: number;
    isLowOnCredits: boolean;
    warning?: string | boolean;
    
    // Enhanced credit info
    totalCreditsPurchased?: number;
    totalCreditsUsed?: number;
    subscriptionTier?: string;
    maxCredits?: number;
    canReceiveCredits?: boolean;
    
    // Auto-refill info
    autoRefillEnabled?: boolean;
    lastAutoRefill?: string;
    nextAutoRefill?: string;
    autoRefillRate?: number; // credits per refill
    autoRefillInterval?: number; // minutes between refills
};

export type CreditPurchaseRequest = {
    amount: number;
    paymentMethod: string;
};

export type CreditStats = {
    currentCredits: number;
    chatCost: number;
    canChat: boolean;
    possibleChats: number;
    isLowOnCredits: boolean;
    warning?: string | null;
    
    // Enhanced stats
    totalCreditsPurchased?: number;
    totalCreditsUsed?: number;
    subscriptionTier?: string;
    maxCredits?: number;
    canReceiveCredits?: boolean;
    
    // Auto-refill stats
    autoRefillEnabled?: boolean;
    lastAutoRefill?: string;
    nextAutoRefill?: string;
    autoRefillRate?: number;
    autoRefillInterval?: number;
};

export type ReapplyRequest = {
    token: string;
    companyName: string;
    companyRole: 'MANAGER' | 'EMPLOYEE';
    password: string;
};

export type SecurityQuestionsRequest = {
    questions: Record<string, string>;
};

export type VerifyAnswersRequest = {
    email: string;
    answers: Record<string, string>;
};

export type ResetPasswordRequest = {
    resetToken: string;
    newPassword: string;
};

