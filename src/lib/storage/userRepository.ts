import {
  UserProfile,
  ExtractedProduct,
  FoodAssessment,
  ProductComparison,
  LoggedMealItem,
  DailyMealSummary,
  MealType,
  UserDocument,
  AuthUser,
  AuthSession,
  MedicalDocumentType,
} from '@/types/nutrition';
import { SAMPLE_PRODUCTS } from '../sampleProducts';
import { AssessmentEngine } from '../assessment/rulesEngine';

const STORAGE_KEYS = {
  PROFILE: 'nutriagent_profile',
  HISTORY: 'nutriagent_history',
  COMPARISONS: 'nutriagent_comparisons',
  ACTIVE_PRODUCT: 'nutriagent_active_product',
  ACTIVE_ASSESSMENT: 'nutriagent_active_assessment',
  SAVED_PRODUCTS: 'nutriagent_saved_products',
  MEAL_LOGS: 'nutriagent_meal_logs',
  SYNC_STATUS: 'nutriagent_sync_status',
  ACCOUNTS: 'nutriagent_registered_accounts',
  SESSION: 'nutriagent_auth_session',
  DOCUMENTS: 'nutriagent_medical_documents',
  ENTERED: 'nutriagent_entered',
};

interface StoredAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'guest-user-default',
  name: 'Student Explorer',
  isGuest: true,
  ageRange: '18-25',
  dietaryPreferences: ['vegetarian'],
  primaryGoal: 'balanced_eating',
  allergies: ['peanuts'],
  healthConsiderations: ['hypertension'],
  customIngredientsToAvoid: ['palm oil', 'high fructose corn syrup'],
  maxSodiumPerServingMg: 350,
  maxAddedSugarPerServingG: 6,
  calorieTargetDaily: 2000,
  privacySettings: {
    storeImagesConsent: false,
    telemetryConsent: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class UserRepository {
  // --- Profile Methods ---
  public static getProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_GUEST_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read profile from localStorage:', e);
    }
    // Initialize default profile
    this.saveProfile(DEFAULT_GUEST_PROFILE);
    return DEFAULT_GUEST_PROFILE;
  }

  public static saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }

  // --- Scan & Assessment History ---
  public static getHistory(): FoodAssessment[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read history from localStorage:', e);
    }

    // Seed history with 2 sample assessments for great first-run UX in demo mode
    const defaultHistory = this.seedInitialDemoHistory();
    return defaultHistory;
  }

  private static seedInitialDemoHistory(): FoodAssessment[] {
    const profile = DEFAULT_GUEST_PROFILE;
    const a1 = AssessmentEngine.assess(SAMPLE_PRODUCTS[0], profile); // Granola bar
    const a2 = AssessmentEngine.assess(SAMPLE_PRODUCTS[1], profile); // Chobani yogurt
    const initialList = [a1, a2];
    this.saveAllHistory(initialList);
    return initialList;
  }

  public static saveAssessment(assessment: FoodAssessment): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      // Prepend newest
      const filtered = history.filter((h) => h.id !== assessment.id);
      filtered.unshift(assessment);
      this.saveAllHistory(filtered);
    } catch (e) {
      console.error('Failed to save assessment to history:', e);
    }
  }

  public static deleteAssessment(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      const updated = history.filter((h) => h.id !== id);
      this.saveAllHistory(updated);
    } catch (e) {
      console.error('Failed to delete assessment:', e);
    }
  }

  public static saveAllHistory(assessments: FoodAssessment[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(assessments));
    } catch (e) {
      console.error('Failed to persist history array:', e);
    }
  }

  // --- Active / Staged Data for Review & Results ---
  public static setActiveProduct(product: ExtractedProduct): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PRODUCT, JSON.stringify(product));
  }

  public static getActiveProduct(): ExtractedProduct | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRODUCT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static setActiveAssessment(assessment: FoodAssessment): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ASSESSMENT, JSON.stringify(assessment));
  }

  public static getActiveAssessment(): FoodAssessment | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_ASSESSMENT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // --- Comparisons ---
  public static getComparisons(): ProductComparison[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPARISONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveComparison(comparison: ProductComparison): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getComparisons().filter((c) => c.id !== comparison.id);
      list.unshift(comparison);
      localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save comparison:', e);
    }
  }

  // --- Saved / Favorite Products ---
  public static getSavedProducts(): ExtractedProduct[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static toggleSavedProduct(product: ExtractedProduct): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const list = this.getSavedProducts();
      const existingIndex = list.findIndex((p) => p.id === product.id);
      let isSavedNow = false;

      if (existingIndex >= 0) {
        list.splice(existingIndex, 1);
        isSavedNow = false;
      } else {
        list.unshift(product);
        isSavedNow = true;
      }
      localStorage.setItem(STORAGE_KEYS.SAVED_PRODUCTS, JSON.stringify(list));
      return isSavedNow;
    } catch (e) {
      console.error('Failed to toggle saved product:', e);
      return false;
    }
  }

  public static isProductSaved(productId: string): boolean {
    if (typeof window === 'undefined') return false;
    const list = this.getSavedProducts();
    return list.some((p) => p.id === productId);
  }

  // --- Meal Planner & Food Diary Storage ---
  private static getAllMealLogs(): LoggedMealItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      return [];
    }

    // Seed default sample meals for today if empty
    const seeded = this.seedInitialMealLogs();
    return seeded;
  }

  private static seedInitialMealLogs(): LoggedMealItem[] {
    const today = new Date().toISOString().split('T')[0];
    const initialMeals: LoggedMealItem[] = [
      {
        id: `meal-${Date.now()}-1`,
        mealType: 'breakfast',
        productId: 'sample-greek-yogurt',
        name: 'Chobani Zero Sugar Mixed Berry Non-Fat Greek Yogurt',
        brand: 'Chobani',
        servingsCount: 1,
        servingDescription: '1 cup (150g)',
        calories: 60,
        proteinG: 12,
        carbsG: 5,
        fatG: 0,
        sugarG: 0,
        sodiumMg: 65,
        fiberG: 1,
        loggedAt: `${today}T08:30:00Z`,
      },
      {
        id: `meal-${Date.now()}-2`,
        mealType: 'snack',
        productId: 'sample-granola-bar',
        name: "Nature Valley Oats 'n Honey Crunchy Granola Bars",
        brand: 'Nature Valley',
        servingsCount: 1,
        servingDescription: '2 bars (42g)',
        calories: 190,
        proteinG: 3,
        carbsG: 29,
        fatG: 7,
        sugarG: 12,
        sodiumMg: 140,
        fiberG: 2,
        loggedAt: `${today}T11:00:00Z`,
      },
    ];
    this.saveAllMealLogs(initialMeals);
    return initialMeals;
  }

  public static saveAllMealLogs(logs: LoggedMealItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save meal logs:', e);
    }
  }

  public static addMealEntry(
    item: Omit<LoggedMealItem, 'id' | 'loggedAt'>,
    customDate?: string
  ): LoggedMealItem {
    const all = this.getAllMealLogs();
    const todayStr = customDate || new Date().toISOString().split('T')[0];
    const newEntry: LoggedMealItem = {
      ...item,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      loggedAt: `${todayStr}T${new Date().toTimeString().split(' ')[0]}Z`,
    };

    all.unshift(newEntry);
    this.saveAllMealLogs(all);
    return newEntry;
  }

  public static deleteMealEntry(id: string): void {
    const all = this.getAllMealLogs();
    const updated = all.filter((m) => m.id !== id);
    this.saveAllMealLogs(updated);
  }

  public static getMealsByDate(dateString: string): DailyMealSummary {
    const all = this.getAllMealLogs();
    const filtered = all.filter((m) => m.loggedAt.startsWith(dateString));

    const totals = filtered.reduce(
      (acc, cur) => ({
        calories: acc.calories + (cur.calories || 0),
        proteinG: Math.round((acc.proteinG + (cur.proteinG || 0)) * 10) / 10,
        carbsG: Math.round((acc.carbsG + (cur.carbsG || 0)) * 10) / 10,
        fatG: Math.round((acc.fatG + (cur.fatG || 0)) * 10) / 10,
        sugarG: Math.round((acc.sugarG + (cur.sugarG || 0)) * 10) / 10,
        sodiumMg: acc.sodiumMg + (cur.sodiumMg || 0),
        fiberG: Math.round((acc.fiberG + (cur.fiberG || 0)) * 10) / 10,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0, sodiumMg: 0, fiberG: 0 }
    );

    return {
      date: dateString,
      items: filtered,
      totals,
    };
  }

  public static getWeeklyMealTrends(): { date: string; calories: number; proteinG: number; carbsG: number; fatG: number; sodiumMg: number; sugarG: number }[] {
    const results = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const summary = this.getMealsByDate(dateStr);
      results.push({
        date: dateStr,
        ...summary.totals,
      });
    }

    return results;
  }

  // --- Privacy & Data Management ---
  public static exportAllData(): string {
    const exportData = {
      profile: this.getProfile(),
      history: this.getHistory(),
      savedProducts: this.getSavedProducts(),
      mealLogs: this.getAllMealLogs(),
      comparisons: this.getComparisons(),
      exportedAt: new Date().toISOString(),
      app: 'NutriAgent',
      version: '1.0.0',
    };
    return JSON.stringify(exportData, null, 2);
  }

  // --- Account & Authentication Methods ---
  public static async hashPassword(password: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch {
        // Fallback below
      }
    }
    // Safe deterministic fallback for non-crypto or Node environments
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 'sha256_fallback_' + Math.abs(hash).toString(16);
  }

  public static getRegisteredAccounts(): StoredAccount[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (data) return JSON.parse(data);
    } catch {
      return [];
    }
    return [];
  }

  private static saveRegisteredAccounts(accounts: StoredAccount[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts:', e);
    }
  }

  public static async registerUser(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const accounts = this.getRegisteredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
      };
    }

    const passwordHash = await this.hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAccount: StoredAccount = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    this.saveRegisteredAccounts(accounts);

    const authUser: AuthUser = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      createdAt: newAccount.createdAt,
    };

    // Initialize dedicated profile for this registered user
    const userProfile: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      id: userId,
      name: cleanName,
      email: cleanEmail,
      isGuest: false,
      dietaryGoals: ['healthy_eating'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveProfile(userProfile);
    this.saveUserProfileById(userId, userProfile);

    // Create active session (30-day session by default)
    const session: AuthSession = {
      user: authUser,
      token: `tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      rememberMe: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.saveSession(session);

    return { success: true, user: authUser };
  }

  public static async loginUser(
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const accounts = this.getRegisteredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      // First-time local login auto-convenience or invalid credentials check
      return {
        success: false,
        error: 'Invalid credentials. If you are new to NutriAgent, please register first.',
      };
    }

    const inputHash = await this.hashPassword(password);
    if (account.passwordHash !== inputHash) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    const authUser: AuthUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      createdAt: account.createdAt,
    };

    // Load user's saved profile or restore from id-based storage
    let profile = this.getUserProfileById(account.id);
    if (!profile) {
      profile = {
        ...DEFAULT_GUEST_PROFILE,
        id: account.id,
        name: account.name,
        email: account.email,
        isGuest: false,
        updatedAt: new Date().toISOString(),
      };
      this.saveUserProfileById(account.id, profile);
    }

    profile.isGuest = false;
    this.saveProfile(profile);

    // Save session with proper expiration
    const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session: AuthSession = {
      user: authUser,
      token: `tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      rememberMe,
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
    };
    this.saveSession(session);

    return { success: true, user: authUser };
  }

  public static saveSession(session: AuthSession): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }

  public static getCurrentSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;
      const session: AuthSession = JSON.parse(data);
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        this.logoutUser();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

// "Entered" = the visitor has signed in, registered, or chosen Continue as Guest.
  public static markEntered(): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEYS.ENTERED, '1'); } catch {}
  }

  public static hasEntered(): boolean {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(STORAGE_KEYS.ENTERED) === '1'; } catch { return false; }
  }

  public static clearEntered(): void {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(STORAGE_KEYS.ENTERED); } catch {}
  }

  public static logoutUser(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch {}

    // Reset active profile to guest state
    const guest = {
      ...DEFAULT_GUEST_PROFILE,
      id: '', //guest-user-default
      name: '',//Guest Explorer
      // isGuest: true,
      // email: undefined,
    };
    this.saveProfile(guest);
  }

  public static deleteAccount(userId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const accounts = this.getRegisteredAccounts().filter((a) => a.id !== userId);
      this.saveRegisteredAccounts(accounts);
      localStorage.removeItem(`nutriagent_profile_${userId}`);
      localStorage.removeItem(`nutriagent_documents_${userId}`);
      this.logoutUser();
      return true;
    } catch (e) {
      console.error('Failed to delete account:', e);
      return false;
    }
  }

  public static getUserProfileById(userId: string): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`nutriagent_profile_${userId}`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  public static saveUserProfileById(userId: string, profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`nutriagent_profile_${userId}`, JSON.stringify(profile));
    } catch {}
  }

  // --- Medical Documents Methods ---
  public static getDocuments(userId?: string): UserDocument[] {
    if (typeof window === 'undefined') return [];
    try {
      const targetUserId = userId || this.getProfile().id;
      const key = `nutriagent_documents_${targetUserId}`;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      // Check legacy shared documents
      const shared = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (shared) {
        const all: UserDocument[] = JSON.parse(shared);
        return all.filter((d) => d.userId === targetUserId);
      }
    } catch {}
    return [];
  }

  public static addDocument(doc: Omit<UserDocument, 'id' | 'uploadedAt'>): UserDocument {
    const targetUserId = doc.userId || this.getProfile().id;
    const all = this.getDocuments(targetUserId);

    const newDoc: UserDocument = {
      ...doc,
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: targetUserId,
      uploadedAt: new Date().toISOString(),
    };

    all.unshift(newDoc);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nutriagent_documents_${targetUserId}`, JSON.stringify(all));
      } catch (e) {
        console.error('Failed to store document metadata:', e);
      }
    }

    // Also sync document list to user profile
    const profile = this.getProfile();
    if (profile.id === targetUserId) {
      profile.documents = all;
      this.saveProfile(profile);
    }

    return newDoc;
  }

  public static deleteDocument(documentId: string, userId?: string): boolean {
    const targetUserId = userId || this.getProfile().id;
    const all = this.getDocuments(targetUserId);
    const updated = all.filter((d) => d.id !== documentId);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`nutriagent_documents_${targetUserId}`, JSON.stringify(updated));
      } catch (e) {
        return false;
      }
    }

    const profile = this.getProfile();
    if (profile.id === targetUserId) {
      profile.documents = updated;
      this.saveProfile(profile);
    }
    return true;
  }

  public static clearMedicalData(): void {
    const profile = this.getProfile();
    profile.healthConsiderations = [];
    profile.medicalConditions = [];
    profile.medicalNotes = undefined;
    profile.documents = [];
    this.saveProfile(profile);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(`nutriagent_documents_${profile.id}`);
    }
  }

  // --- Profile Completion Meter ---
  public static calculateProfileCompletion(profile: UserProfile): {
    percentage: number;
    completedCount: number;
    totalCount: number;
    sections: { id: string; title: string; completed: boolean; optional: boolean }[];
  } {
    const sections = [
      {
        id: 'basic',
        title: 'Basic Information',
        completed: Boolean(profile.name && profile.name.trim() !== 'Student Explorer' && (profile.ageRange || profile.dateOfBirth || profile.heightCm || profile.weightKg)),
        optional: false,
      },
      {
        id: 'goals',
        title: 'Dietary Goals',
        completed: Boolean((profile.dietaryGoals && profile.dietaryGoals.length > 0) || profile.primaryGoal),
        optional: false,
      },
      {
        id: 'preferences',
        title: 'Dietary Preferences',
        completed: Boolean(profile.dietaryPreferences && profile.dietaryPreferences.length > 0),
        optional: false,
      },
      {
        id: 'allergies',
        title: 'Allergies & Intolerances',
        completed: Boolean(profile.allergies !== undefined && profile.allergies.length >= 0), // reviewing allergies is completed once user reviews
        optional: false,
      },
      {
        id: 'targets',
        title: 'Nutrition Targets',
        completed: Boolean(profile.calorieTargetDaily || profile.proteinTargetG || profile.maxSodiumPerServingMg || profile.fiberTargetG),
        optional: false,
      },
    ];

    const completedCount = sections.filter((s) => s.completed).length;
    const totalCount = sections.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return { percentage, completedCount, totalCount, sections };
  }

  public static deleteAllUserData(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.COMPARISONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PRODUCT);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ASSESSMENT);
      localStorage.removeItem(STORAGE_KEYS.SAVED_PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.MEAL_LOGS);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    } catch (e) {
      console.error('Failed to clear user data:', e);
    }
  }
}
