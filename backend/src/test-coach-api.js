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
  console.log('🧪 Testing AI Coach REST API Endpoint...\n');

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

  // Ask Weight Gain
  const res1 = await makeRequest(`${API_BASE}/coach/ask`, 'POST', { message: 'How do I gain weight and build muscle?' }, token);
  console.log('1️⃣ Question: Weight Gain & Muscle');
  console.log('Response Status:', res1.status);
  console.log('Reply:\n', res1.body.data?.reply);
  console.log('\n-----------------------------------\n');

  // Ask Weight Loss
  const res2 = await makeRequest(`${API_BASE}/coach/ask`, 'POST', { message: 'What is the best weight loss plan?' }, token);
  console.log('2️⃣ Question: Weight Loss');
  console.log('Response Status:', res2.status);
  console.log('Reply:\n', res2.body.data?.reply);
  console.log('\n-----------------------------------\n');

  console.log('✅ AI Coach API Test Completed Successfully!');
}

testCoachApi().catch(console.error);
