import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Clinic } from './modules/clinics/entities/clinic.entity';
import { User } from './modules/users/entities/user.entity';
import { ClinicMembership } from './modules/clinics/entities/clinic-membership.entity';
import { ClinicProcedure } from './modules/clinic-procedures/entities/clinic-procedure.entity';
import { ClinicRole } from './modules/clinics/enums/clinic-role.enum';
import { UserRole } from './modules/users/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    const clinicRepo = dataSource.getRepository(Clinic);
    const userRepo = dataSource.getRepository(User);
    const membershipRepo = dataSource.getRepository(ClinicMembership);
    const procRepo = dataSource.getRepository(ClinicProcedure);

    console.log('Seeding database...');

    // Create Clinic
    let clinic = await clinicRepo.findOne({ where: { name: 'OdontoTec Default Clinic' } });
    if (!clinic) {
        clinic = clinicRepo.create({
            name: 'OdontoTec Default Clinic',
            address: 'Rua das Flores, 123',
            phone: '11999999999',
        });
        clinic = await clinicRepo.save(clinic);
        console.log('Clinic created:', clinic.name, 'ID:', clinic.id);
    } else {
        console.log('Clinic already exists:', clinic.name, 'ID:', clinic.id);
    }

    // Helper: create user + membership
    async function createUserWithMembership(
        name: string,
        email: string,
        rawPassword: string,
        role: UserRole,
        clinicRole: ClinicRole,
    ) {
        let user = await userRepo.findOne({ where: { email } });
        if (!user) {
            const password = await bcrypt.hash(rawPassword, 10);
            user = userRepo.create({ name, email, password, role });
            user = await userRepo.save(user);
            console.log(`${role} user created:`, email);
            console.log(`Password: ${rawPassword}`);
        } else {
            console.log(`${role} user already exists:`, email);
        }

        // Create membership if not exists
        const existing = await membershipRepo.findOne({
            where: { userId: user.id, clinicId: clinic!.id },
        });
        if (!existing) {
            const membership = membershipRepo.create({
                userId: user.id,
                clinicId: clinic!.id,
                role: clinicRole,
                isActive: true,
            });
            await membershipRepo.save(membership);
            console.log(`  → Membership created (${clinicRole}) for ${email}`);
        }

        return user;
    }

    // Create Admin User
    const admin = await createUserWithMembership(
        'Admin User', 'admin@odontotec.com', 'admin123',
        UserRole.ADMIN, ClinicRole.OWNER,
    );

    // Set clinic owner
    if (!clinic.ownerId) {
        clinic.ownerId = admin.id;
        await clinicRepo.save(clinic);
    }

    // Create Dentist User
    await createUserWithMembership(
        'Dr. Dentist', 'dentist@odontotec.com', 'dentist123',
        UserRole.DENTIST, ClinicRole.DENTIST,
    );

    // Create Receptionist User
    await createUserWithMembership(
        'Receptionist User', 'receptionist@odontotec.com', 'simple123',
        UserRole.SIMPLE, ClinicRole.RECEPTIONIST,
    );

    // Create Default Clinic Procedures
    const defaultProcs = [
        { name: 'Restauração', description: 'Restauração dentária', baseValue: 180, selectionMode: 'FACE' },
        { name: 'Extração', description: 'Extração de dente', baseValue: 150, selectionMode: 'TOOTH' },
        { name: 'Tratamento de Canal', description: 'Endodontia', baseValue: 450, selectionMode: 'TOOTH' },
        { name: 'Limpeza / Profilaxia', description: 'Limpeza completa', baseValue: 120, selectionMode: 'GENERAL' },
        { name: 'Aplicação de Flúor', description: 'Prevenção', baseValue: 80, selectionMode: 'GENERAL' },
    ];

    for (const pData of defaultProcs) {
        const existing = await procRepo.findOne({ where: { name: pData.name, clinicId: clinic.id } });
        if (!existing) {
            const proc = procRepo.create({ ...pData, clinicId: clinic.id });
            await procRepo.save(proc);
            console.log(`  → Procedure created: ${pData.name} (${pData.selectionMode})`);
        }
    }

    await app.close();
    console.log('Seeding complete!');
}
bootstrap();
