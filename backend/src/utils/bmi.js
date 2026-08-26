/**
 * FITMINDS Body Mass Index (BMI) & Category Calculation Utility
 */

function calculateBMI(weightKg, heightCm) {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);

  if (!w || !h || w <= 0 || h <= 0) {
    return null;
  }

  // BMI = weight(kg) / (height(m)^2)
  const heightM = h / 100.0;
  const bmi = w / (heightM * heightM);
  return Math.round(bmi * 100) / 100;
}

function getBMICategory(bmi) {
  if (bmi === null || bmi === undefined || isNaN(bmi)) {
    return 'Normal weight';
  }

  if (bmi < 18.5) {
    return 'Underweight';
  } else if (bmi >= 18.5 && bmi < 25.0) {
    return 'Normal weight';
  } else if (bmi >= 25.0 && bmi < 30.0) {
    return 'Overweight';
  } else {
    return 'Obese';
  }
}

module.exports = {
  calculateBMI,
  getBMICategory,
};
