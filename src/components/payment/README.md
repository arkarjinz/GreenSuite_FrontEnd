# Payment System Implementation

This directory contains the frontend implementation of the payment system that integrates with the backend payment APIs.

## Components

### PaymentAccount.tsx
Manages user payment accounts, including:
- Account creation and balance viewing
- Quick deposit options (Small, Medium, Large)
- Custom deposit amounts with payment methods
- Account status and transaction limits

### PaymentHistory.tsx
Displays payment transaction history:
- Transaction list with filtering by status
- Payment method icons and transaction details
- Summary statistics (completed, failed, pending, total spent)
- Demo transaction data for testing

### AICreditPricing.tsx
AI credit package selection and purchase:
- Dynamic pricing loaded from backend API
- Payment method selection (Card, Bank Transfer, Wallet)
- Real-time credit purchase through payment system
- Automatic payment account creation if needed
- User credit balance display and updates

### CreditTransactionHistory.tsx
Displays AI credit transaction history:
- Real-time credit transaction data from backend
- Filtering by transaction type (Purchases, Chat Usage, Admin Grants)
- Transaction details with timestamps and conversation IDs
- Summary statistics (total transactions, credits purchased/used, current balance)
- Color-coded transaction types with icons

### AdminPaymentManager.tsx
Admin interface for owners/managers to:
- View all user payment accounts
- Search and filter accounts
- Add funds to user accounts
- Monitor account balances and status

## Backend Integration

The payment system integrates with the following backend endpoints:

### Payment Account Management
- `POST /api/payment/account/create` - Create new payment account
- `GET /api/payment/account/{accountNumber}` - Get account details
- `GET /api/payment/user/{userId}/account` - Get user's payment account
- `POST /api/payment/account/deposit` - Simple deposit
- `POST /api/payment/account/deposit/advanced` - Advanced deposit with payment details
- `POST /api/payment/account/deposit/quick` - Quick predefined deposits

### Credit System
- `GET /api/payment/credits/pricing` - Get credit package pricing
- `POST /api/payment/credits/purchase` - Purchase AI credits
- `GET /api/credits/balance` - Get user's credit balance
- `GET /api/credits/can-chat` - Check if user can chat
- `GET /api/credits/history` - Get credit transaction history

### Admin Functions
- `POST /api/payment/admin/add-funds` - Add funds to any user account
- `GET /api/payment/deposit/options` - Get deposit options and limits

## Data Models

### CreditTransaction
```typescript
interface CreditTransaction {
    id: string;
    type: string; // CHAT_DEDUCTION, CREDIT_PURCHASE, ADMIN_GRANT, REFUND, AUTO_REFILL
    typeDescription: string;
    amount: number; // Positive for credits added, negative for credits deducted
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    conversationId?: string;
    timestamp: string;
}
```

### PaymentAccount
```typescript
interface PaymentAccount {
    accountNumber: string;
    userName: string;
    balance: number;
    creditPoints: number;
    status: string;
    createdDate: string;
}
```

### CreditPackage
```typescript
interface CreditPackage {
    credits: number;
    price: number;
    currency: string;
    description: string;
    bonus?: string;
}
```

## API Integration

The payment system uses the `paymentApi` from `@/lib/api` which includes:

### Account Management
- `createPaymentAccount(initialBalance)` - Create new payment account
- `getPaymentAccount(accountNumber)` - Get account details
- `getUserPaymentAccount(userId)` - Get user's payment account
- `getDepositOptions()` - Get available deposit methods and limits

### Credit Purchases
- `purchaseCredits(purchaseRequest)` - Purchase AI credits using account balance
- `getCreditPricing()` - Get credit package pricing information
- `getCreditBalance()` - Get user's current credit balance
- `canUserChat()` - Check if user has enough credits to chat

### Credit History
- `getCreditTransactionHistory(userId)` - Get credit transaction history

### Deposits
- `depositToAccount(accountNumber, amount)` - Simple deposit
- `depositToAccountAdvanced(depositRequest)` - Advanced deposit with payment details
- `quickDeposit(accountNumber, amountType)` - Quick predefined deposits

### Admin Functions
- `adminAddFunds(accountNumber, amount, reason)` - Add funds to any user account
- `getPaymentHistory(accountNumber)` - Get transaction history

## Pages

### /payment
Main payment center with tabs for:
- Payment Account management
- Payment History viewing
- Credit Transaction History

### /dashboard/owner/payment
Admin payment management for owners/managers

## Features

### Real-time Integration
- All components fetch data from backend APIs
- Automatic error handling and retry mechanisms
- Loading states and user feedback
- Real-time balance updates after transactions

### User Experience
- Responsive design with mobile optimization
- Intuitive navigation and filtering
- Clear visual feedback for all actions
- Comprehensive error handling and messaging

### Security
- Authentication required for all payment operations
- Role-based access control for admin functions
- Secure API communication with proper error handling
- Input validation and sanitization

## Usage Examples

### Purchasing Credits
```typescript
const purchaseRequest = {
    accountNumber: "GreenSuite12345",
    paymentMethod: "CARD",
    creditPackage: "STANDARD",
    creditAmount: 150,
    amount: 12.99
};

const response = await paymentApi.purchaseCredits(purchaseRequest);
```

### Getting Credit History
```typescript
const history = await paymentApi.getCreditTransactionHistory(userId);
```

### Creating Payment Account
```typescript
const account = await paymentApi.createPaymentAccount(50.0);
``` 