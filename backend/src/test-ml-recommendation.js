const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function makeRequest(url, method = 'POST', body = null, token = null) {
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

async function testMLRecommendationEndpoint() {
  console.log('🧪 Testing ML Workout Recommendation REST API (POST /api/recommendations/workout)...\n');

  // 1. Authenticate Demo User
  const loginRes = await makeRequest(`${API_BASE}/auth/login`, 'POST', {
    email: 'alex@fitminds.app',
    password: 'Password123!',
  });

  const token = loginRes.body.data?.token;
  if (!token) {
    console.error('❌ Authentication failed');
    return;
  }

  // 2. Request ML Workout Recommendation
  const recRes = await makeRequest(`${API_BASE}/recommendations/workout`, 'POST', null, token);
  
  console.log(`Response HTTP Status: ${recRes.status}`);
  console.log('Returned Data:');
  console.log(JSON.stringify(recRes.body, null, 2));

  if (recRes.body.success && recRes.body.data?.recommendedWorkout) {
    console.log('\n✅ ML Workout Recommendation API Test PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ ML Recommendation Test FAILED');
  }
}

testMLRecommendationEndpoint().catch(console.error);
