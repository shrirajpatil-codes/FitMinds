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

async function testCoachApi() {
  console.log('🧪 Testing AI Coach REST API Endpoint with multiple exercise queries...\n');

  // Login
  const loginRes = await makeRequest(`${API_BASE}/auth/login`, 'POST', {
    email: 'alex@fitminds.app',
    password: 'Password123!',
  });

  const token = loginRes.body.data?.token;
  if (!token) {
    console.error('❌ Failed to obtain token');
    return;
  }

  // 1. Pushup Question
  const res1 = await makeRequest(`${API_BASE}/coach/ask`, 'POST', { message: 'how to do pushup' }, token);
  console.log('1️⃣ Question: "how to do pushup"');
  console.log('Reply:\n', res1.body.data?.reply);
  console.log('\n-----------------------------------\n');

  // 2. Squat Question
  const res2 = await makeRequest(`${API_BASE}/coach/ask`, 'POST', { message: 'how to do squat' }, token);
  console.log('2️⃣ Question: "how to do squat"');
  console.log('Reply:\n', res2.body.data?.reply);
  console.log('\n-----------------------------------\n');

  // 3. Biceps Question
  const res3 = await makeRequest(`${API_BASE}/coach/ask`, 'POST', { message: 'best biceps workout for student' }, token);
  console.log('3️⃣ Question: "best biceps workout for student"');
  console.log('Reply:\n', res3.body.data?.reply);
  console.log('\n-----------------------------------\n');

  console.log('✅ AI Coach Test Completed Successfully!');
}

testCoachApi().catch(console.error);
