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
    aiCredits?: number;
    roles?: string[];
    // Ban and rejection tracking
    rejectionCount?: number;
    remainingAttempts?: number;
    isBanned?: boolean;
    banReason?: string;
    bannedAt?: string;
    warning?: string;
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

