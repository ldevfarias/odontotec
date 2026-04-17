import axios from 'axios';

async function run() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:3000/auth/login', {
      email: 'admin@odontotec.com',
      password: 'admin123',
    });
    const token = loginRes.data.access_token;
    console.log('Logged in.');

    // Update user 1's email to a NEW, unique email
    console.log('Updating user 1 email to a new value...');
    const patchRes = await axios.patch(
      'http://localhost:3000/users/1',
      {
        email: 'admin.updated@odontotec.com',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('Update success:', patchRes.data);
  } catch (error: unknown) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

run();
