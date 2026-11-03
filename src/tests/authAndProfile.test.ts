import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository, DEFAULT_GUEST_PROFILE } from '../lib/storage/userRepository';
import { UserProfile } from '../types/nutrition';

describe('Authentication & Profile Management Layer', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    // Clear mock storage
    for (const key of Object.keys(store)) {
      delete store[key];
    }

    // Mock window & localStorage in Node environment
    (global as any).window = {
      crypto: {
        subtle: undefined, // test fallback hashing
      },
    };
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      },
    };

    store['nutriagent_registered_accounts'] = JSON.stringify([]);
    store['nutriagent_meal_logs'] = JSON.stringify([]);
  });

  it('registers a new user and creates an active authenticated session', async () => {
    const regResult = await UserRepository.registerUser(
      'Aarav Patel',
      'aarav@example.com',
      'SecretP@ss123'
    );

    expect(regResult.success).toBe(true);
    expect(regResult.user).toBeDefined();
    expect(regResult.user?.email).toBe('aarav@example.com');
    expect(regResult.user?.name).toBe('Aarav Patel');

    // Verify session
    const session = UserRepository.getCurrentSession();
    expect(session).not.toBeNull();
    expect(session?.user.email).toBe('aarav@example.com');

    // Verify profile
    const activeProfile = UserRepository.getProfile();
    expect(activeProfile.name).toBe('Aarav Patel');
    expect(activeProfile.isGuest).toBe(false);
  });

  it('prevents duplicate account registration with the same email', async () => {
    await UserRepository.registerUser('Aarav Patel', 'aarav@example.com', 'SecretP@ss123');

    const duplicateResult = await UserRepository.registerUser(
      'Another Aarav',
      'AARAV@example.com', // Case-insensitive test
      'DifferentPass123'
    );

    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.error).toContain('already exists');
  });

  it('authenticates valid credentials and rejects incorrect passwords', async () => {
    await UserRepository.registerUser('Diya Sen', 'diya@example.com', 'ValidPass2026');

    // Failed attempt with wrong password
    const failResult = await UserRepository.loginUser('diya@example.com', 'WrongPassword');
    expect(failResult.success).toBe(false);
    expect(failResult.error).toContain('Incorrect password');

    // Successful attempt
    const successResult = await UserRepository.loginUser('diya@example.com', 'ValidPass2026', true);
    expect(successResult.success).toBe(true);
    expect(successResult.user?.name).toBe('Diya Sen');

    // Session persisted
    const session = UserRepository.getCurrentSession();
    expect(session?.user.email).toBe('diya@example.com');
    expect(session?.rememberMe).toBe(true);
  });

  it('calculates profile completion percentage without penalizing non-disclosure of medical records', () => {
    const basicProfile: UserProfile = {
      ...DEFAULT_GUEST_PROFILE,
      name: 'Rohan Verma',
      ageRange: '26-40',
      dietaryGoals: ['muscle_gain', 'improved_protein'],
      dietaryPreferences: ['vegetarian'],
      allergies: ['peanuts'],
      calorieTargetDaily: 2400,
      proteinTargetG: 80,
      healthConsiderations: [], // Voluntary: no conditions disclosed
      documents: [], // Voluntary: no documents uploaded
    };

    const completion = UserRepository.calculateProfileCompletion(basicProfile);
    // All 5 core dietary sections are satisfied -> 100%
    expect(completion.percentage).toBe(100);
    expect(completion.completedCount).toBe(5);
    expect(completion.totalCount).toBe(5);
  });

  it('manages medical documents safely: adds, lists, and deletes files', () => {
    const userDoc = UserRepository.addDocument({
      userId: 'test-usr-1',
      fileName: 'Lipid_Panel_Report.pdf',
      fileType: 'application/pdf',
      fileSize: 1048576,
      documentType: 'lipid_profile',
      notes: 'Doctor recommended reducing saturated fat',
    });

    expect(userDoc.id).toBeDefined();
    expect(userDoc.fileName).toBe('Lipid_Panel_Report.pdf');

    // Retrieve documents
    const list = UserRepository.getDocuments('test-usr-1');
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(userDoc.id);

    // Delete document
    const deleted = UserRepository.deleteDocument(userDoc.id, 'test-usr-1');
    expect(deleted).toBe(true);

    const listAfter = UserRepository.getDocuments('test-usr-1');
    expect(listAfter.length).toBe(0);
  });

  it('clears voluntary medical records without wiping dietary preferences', () => {
    const profile = UserRepository.getProfile();
    profile.healthConsiderations = ['hypertension', 'elevated_cholesterol'];
    profile.medicalNotes = 'Clinician notes on sodium';
    profile.dietaryPreferences = ['jain'];
    UserRepository.saveProfile(profile);

    UserRepository.clearMedicalData();

    const clearedProfile = UserRepository.getProfile();
    expect(clearedProfile.healthConsiderations.length).toBe(0);
    expect(clearedProfile.medicalNotes).toBeUndefined();
    expect(clearedProfile.dietaryPreferences).toContain('jain'); // Preserved!
  });

  it('deletes user account and restores guest mode cleanly', async () => {
    const reg = await UserRepository.registerUser('Kavita Rao', 'kavita@example.com', 'Pass1234');
    const userId = reg.user!.id;

    // Add a document
    UserRepository.addDocument({
      userId,
      fileName: 'Blood_Sugar.pdf',
      fileType: 'application/pdf',
      fileSize: 500000,
      documentType: 'glucose_hba1c',
    });

    const deleted = UserRepository.deleteAccount(userId);
    expect(deleted).toBe(true);

    // Verify account removed
    const accounts = UserRepository.getRegisteredAccounts();
    expect(accounts.some((a) => a.id === userId)).toBe(false);

    // Verify session ended and reset to guest
    const session = UserRepository.getCurrentSession();
    expect(session).toBeNull();

    const activeProfile = UserRepository.getProfile();
    expect(activeProfile.isGuest).toBe(true);
  });
});

