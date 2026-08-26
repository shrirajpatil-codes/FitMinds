const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = { ...require('../utils/response') };
const { calculateBMI, getBMICategory } = require('../utils/bmi');

async function register(req, res, next) {
  try {
    const { name, email, password, heightCm, weightKg, targetWeightKg, fitnessGoal, age } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email, and password.', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email already exists.', 409);
    }

    const passwordHash = await hashPassword(password);

    // Calculate BMI & Category if height and weight provided
    const parsedHeight = heightCm ? parseFloat(heightCm) : null;
    const parsedWeight = weightKg ? parseFloat(weightKg) : null;
    const parsedTargetWeight = targetWeightKg ? parseFloat(targetWeightKg) : null;
    const bmi = calculateBMI(parsedWeight, parsedHeight);
    const bmiCategory = bmi ? getBMICategory(bmi) : null;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        profile: {
          create: {
            age: age ? parseInt(age, 10) : 22,
            heightCm: parsedHeight,
            weightKg: parsedWeight,
            targetWeightKg: parsedTargetWeight,
            bmi: bmi,
            bmiCategory: bmiCategory,
            fitnessGoal: fitnessGoal || 'FITNESS',
            onboardingCompleted: !!(parsedHeight && parsedWeight),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const token = generateToken(user.id);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingCompleted: user.profile?.onboardingCompleted || false,
        },
        profile: user.profile,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    const token = generateToken(user.id);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingCompleted: user.profile?.onboardingCompleted || false,
        },
        profile: user.profile,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      onboardingCompleted: user.profile?.onboardingCompleted || false,
      profile: user.profile,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
