import axios from 'axios';

async function testTreatmentPlans() {
    const baseUrl = 'http://localhost:3000';
    console.log('--- Testing Treatment Plans Module ---');

    try {
        // 1. Login as Admin to get token and clinic context
        console.log('1. Logging in as admin...');
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@odontotec.com',
            password: 'admin123'
        });
        const token = loginRes.data.access_token;
        const clinicId = 1; // From seed

        // 2. Create a Patient
        console.log('2. Creating a Patient...');
        const createPatientRes = await axios.post(`${baseUrl}/patients`, {
            name: 'Paciente de Teste',
            contact: '11988887777',
            document: '123456789'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const patientId = createPatientRes.data.id;
        console.log(`✅ Patient created with ID: ${patientId}`);

        // 3. Create a Treatment Plan
        console.log('3. Creating a Treatment Plan...');
        const createPlanRes = await axios.post(`${baseUrl}/treatment-plans`, {
            patientId: patientId,
            dentistId: 1,
            notes: 'Extração de siso e limpeza',
            items: [
                { description: 'Extração de Siso', value: 350.50, toothNumber: 18 },
                { description: 'Limpeza Completa', value: 150.00 }
            ]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const planId = createPlanRes.data.id;
        console.log(`✅ Plan created with ID: ${planId}, Total: ${createPlanRes.data.totalAmount}`);

        if (createPlanRes.data.totalAmount != 500.50) {
            console.error('❌ Total amount calculation mismatch!');
        }

        // 3. List Treatment Plans
        console.log('3. Listing Treatment Plans...');
        const listRes = await axios.get(`${baseUrl}/treatment-plans`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${listRes.data.length} plans.`);

        // 4. Update Treatment Plan Status
        console.log('4. Updating Plan Status to APPROVED...');
        const updateRes = await axios.patch(`${baseUrl}/treatment-plans/${planId}`, {
            status: 'APPROVED'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Status updated to: ${updateRes.data.status}`);

        // 5. Verify Tenancy
        console.log('5. Verifying Tenancy (attempting to access from non-existent clinic)...');
        // We can't easily test this without another clinic, but we can verify the data has clinicId
        if (createPlanRes.data.clinicId !== clinicId) {
            console.error('❌ ClinicId mismatch!');
        } else {
            console.log('✅ ClinicId correctly assigned.');
        }

    } catch (error: any) {
        console.error('❌ Verification FAILED!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testTreatmentPlans();
