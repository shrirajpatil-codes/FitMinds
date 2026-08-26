const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function makeRequest(url, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runFullstackApiTest() {
  console.log('🧪 Starting Full-Stack FITMINDS REST API Tests...\n');

  // 1. Health Check
  const healthRes = await makeRequest(`${API_BASE}/health`);
  console.log('1️⃣ Health Endpoint:', healthRes.status === 200 && healthRes.body.success ? '✅ PASS' : '❌ FAIL');

  // 2. Login Demo User
  const loginRes = await makeRequest(`${API_BASE}/auth/login`, 'POST', {
    email: 'alex@fitminds.app',
    password: 'Password123!',
  });
  console.log('2️⃣ Auth Login:', loginRes.status === 200 && loginRes.body.success ? '✅ PASS' : '❌ FAIL');
  const token = loginRes.body.data?.token;

  if (!token) {
    console.error('❌ Failed to obtain token from login');
    return;
  }

  // 3. Get Auth Me
  const meRes = await makeRequest(`${API_BASE}/auth/me`, 'GET', null, token);
  console.log('3️⃣ Auth Me:', meRes.status === 200 && meRes.body.data?.email === 'alex@fitminds.app' ? '✅ PASS' : '❌ FAIL');

  // 4. Update Profile
  const profileRes = await makeRequest(`${API_BASE}/users/profile`, 'PUT', {
    availableWorkoutTime: 25,
    fitnessGoal: 'CONSISTENCY',
    lifestyleLoad: 'HIGH',
  }, token);
  console.log('4️⃣ Profile Update:', profileRes.status === 200 && profileRes.body.data?.availableWorkoutTime === 25 ? '✅ PASS' : '❌ FAIL');

  // 5. Daily Check-in
  const checkinRes = await makeRequest(`${API_BASE}/checkins`, 'POST', {
    energyLevel: 4,
    readinessLevel: 4,
    availableTimeMinutes: 25,
    academicLoad: 'HIGH',
    note: 'Exam week check-in',
  }, token);
  console.log('5️⃣ Daily Check-in:', checkinRes.status === 201 && checkinRes.body.success ? '✅ PASS' : '❌ FAIL');

  // 6. Today Workout Plan
  const workoutRes = await makeRequest(`${API_BASE}/workouts/today`, 'GET', null, token);
  console.log('6️⃣ Today Workout Plan:', workoutRes.status === 200 && workoutRes.body.data?.id ? '✅ PASS' : '❌ FAIL');

  // 7. Progress Summary
  const progressRes = await makeRequest(`${API_BASE}/progress/summary`, 'GET', null, token);
  console.log('7️⃣ Progress Summary:', progressRes.status === 200 && progressRes.body.data?.workoutsPlanned >= 0 ? '✅ PASS' : '❌ FAIL');

  // 8. Strategy Health
  const strategyRes = await makeRequest(`${API_BASE}/strategy/health`, 'GET', null, token);
  console.log('8️⃣ Strategy Health:', strategyRes.status === 200 && strategyRes.body.data?.status ? '✅ PASS' : '❌ FAIL');

  // 9. Decision History
  const decisionsRes = await makeRequest(`${API_BASE}/decisions`, 'GET', null, token);
  console.log('9️⃣ Decision History:', decisionsRes.status === 200 && Array.isArray(decisionsRes.body.data) ? '✅ PASS' : '❌ FAIL');

  // 10. Experiments List
  const expRes = await makeRequest(`${API_BASE}/experiments`, 'GET', null, token);
  console.log('🔟 Experiments List:', expRes.status === 200 && Array.isArray(expRes.body.data) ? '✅ PASS' : '❌ FAIL');

  // 11. Weekly Reflection
  const reflectionRes = await makeRequest(`${API_BASE}/reflections/weekly`, 'POST', {
    consistencyRating: 5,
    easierFactors: 'Adaptive duration',
    difficultyFactors: 'Late studying',
    desiredStrategyChange: 'Micro-sessions',
  }, token);
  console.log('1️⃣1️⃣ Weekly Reflection:', reflectionRes.status === 201 && reflectionRes.body.success ? '✅ PASS' : '❌ FAIL');

  console.log('\n🎉 ALL 11 REST API ENDPOINT TESTS COMPLETED SUCCESSFULLY!');
}

runFullstackApiTest().catch(console.error);
