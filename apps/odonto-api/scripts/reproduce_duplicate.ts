import axios from 'axios';

async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@odontotec.com',
            password: 'admin123'
        });
        const token = loginRes.data.access_token;
        console.log('Logged in.');

        // Try to update user 3 (Receptionist) to have the same email as user 1 (Admin)
        console.log('Patching user 3 with duplicate email...');
        const patchRes = await axios.patch('http://localhost:3000/users/3', {
            email: 'admin@odontotec.com'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Patch success:', patchRes.data);
    } catch (error: any) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

run();
