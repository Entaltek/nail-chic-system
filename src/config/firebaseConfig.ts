/**
 * Firebase Configuration
 * 
 * INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Firestore Database
 * 3. Enable Authentication (Email/Password)
 * 4. Enable Storage (for design images)
 * 5. Copy your config object below
 * 6. Uncomment the initialization code
 * 
 * SECURITY RULES (Firestore):
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     match /inventory/{doc} {
 *       allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
 *     }
 *     match /services/{doc} {
 *       allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
 *     }
 *     match /transactions/{doc} {
 *       allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
 *     }
 *   }
 * }
 */

// Firebase configuration object - Replace with your values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Uncomment when ready to use Firebase:
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';
// import { getStorage } from 'firebase/storage';

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// export const auth = getAuth(app);
// export const storage = getStorage(app);

// Placeholder exports for development
export const db = null;
export const auth = null;
export const storage = null;

export default firebaseConfig;

/**
 * Suggested Firestore Collections Structure:
 * 
 * users/{uid}
 *   - email: string
 *   - businessName: string
 *   - role: 'owner' | 'employee'
 *   - createdAt: timestamp
 *   - config: {
 *       monthlyWorkHours: number
 *       desiredMonthlySalary: number
 *       includeAguinaldo: boolean
 *       annualInsurance: number
 *     }
 *   - fixedExpenses: FixedExpense[]
 *   - teamMembers: TeamMember[]
 *   - savingsBuckets: SavingsBucket[]
 * 
 * inventory/{docId}
 *   - userId: string (reference to users)
 *   - name: string
 *   - category: string
 *   - totalStock: number
 *   - unit: string
 *   - minStock: number
 *   - purchaseCost: number
 *   - totalApplications: number
 *   - weeklyUsageRate: number
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 * 
 * services/{docId}
 *   - userId: string
 *   - name: string
 *   - basePrice: number
 *   - estimatedMinutes: number
 *   - needsLength: boolean
 *   - materialCost: number
 *   - recipe: ServiceRecipe[]
 * 
 * transactions/{docId}
 *   - userId: string
 *   - date: timestamp
 *   - serviceId: string
 *   - serviceName: string
 *   - estimatedMinutes: number
 *   - realMinutes: number
 *   - chargedAmount: number
 *   - materialCost: number
 *   - profit: number
 *   - teamMemberId: string
 *   - paymentMethod: 'cash' | 'card' | 'transfer'
 *   - addOns: string[]
 *   - createdAt: timestamp
 * 
 * designs/{docId}
 *   - userId: string
 *   - imageUrl: string (Firebase Storage URL)
 *   - complexityLevel: 1 | 2 | 3 | 4
 *   - realMinutes: number
 *   - chargedPrice: number
 *   - tags: string[]
 *   - createdAt: timestamp
 */
