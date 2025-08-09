export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
  companyRole: Role;
  globalAdmin: boolean;
  approvalStatus: ApprovalStatus;
}