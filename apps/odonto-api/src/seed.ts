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
import { Patient } from './modules/patients/entities/patient.entity';
import { Procedure } from './modules/patients/entities/procedure.entity';
import { Anamnesis } from './modules/patients/entities/anamnesis.entity';
import { Payment, PaymentMethod, PaymentStatus } from './modules/patients/entities/payment.entity';
import { Appointment, AppointmentStatus } from './modules/appointments/entities/appointment.entity';
import { ToothObservation } from './modules/patients/entities/tooth-observation.entity';
import { Budget, BudgetStatus } from './modules/budgets/entities/budget.entity';
import { BudgetItem } from './modules/budgets/entities/budget-item.entity';
import { TreatmentPlan } from './modules/treatment-plans/entities/treatment-plan.entity';
import { TreatmentPlanItem } from './modules/treatment-plans/entities/treatment-plan-item.entity';
import {
  TreatmentPlanStatus,
  TreatmentPlanItemStatus,
} from './modules/treatment-plans/enums/status.enum';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(8, 17), randInt(0, 59), 0, 0);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(randInt(8, 17), randInt(0, 59), 0, 0);
  return d;
}

function weightedPick<T>(options: { value: T; weight: number }[]): T {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (const o of options) {
    r -= o.weight;
    if (r <= 0) return o.value;
  }
  return options[options.length - 1].value;
}

const PATIENT_NAMES = [
  'Ana Clara Souza', 'Bruno Ferreira', 'Carla Mendes', 'Diego Oliveira',
  'Elaine Santos', 'Fábio Costa', 'Gabriela Lima', 'Henrique Alves',
  'Isabela Rocha', 'João Pedro Silva', 'Karen Nascimento', 'Lucas Martins',
  'Mariana Pereira', 'Nicolas Barbosa', 'Olivia Cardoso', 'Paulo Ribeiro',
  'Queila Teixeira', 'Rafael Gomes', 'Sandra Moura', 'Thiago Azevedo',
  'Úrsula Correia', 'Vinícius Machado', 'Wanessa Cunha', 'Xavier Pinto',
  'Yasmin Cavalcanti', 'Zeca Carvalho', 'Alice Freitas', 'Bernardo Lopes',
  'Camila Dias', 'Daniel Nunes', 'Eduarda Monteiro', 'Fernando Araújo',
  'Giovana Campos', 'Humberto Vieira', 'Ingrid Santana', 'Jorge Farias',
  'Kátia Borges', 'Leonardo Ramos', 'Mônica Andrade', 'Nelson Batista',
  'Orlanda Peixoto', 'Pedro Henrique Luz', 'Quênia Marques', 'Rodrigo Sousa',
  'Simone Tavares', 'Tarcísio Neto', 'Uriel Fonseca', 'Vera Cruz',
  'William Leite', 'Ximena Bastos', 'Yuri Medeiros', 'Zilda Matos',
  'Adriana Pinheiro', 'Benedito Queiroz', 'Cecília Drummond', 'Davi Rezende',
  'Emilia Torres', 'Francisco Brito', 'Graça Nogueira', 'Hélio Sampaio',
];

const COMPLAINTS = [
  'Dor de dente no lado direito',
  'Sensibilidade ao frio e calor',
  'Gengiva sangrando ao escovar',
  'Dente quebrado',
  'Quero fazer limpeza e avaliação geral',
  'Dor ao morder',
  'Manchas nos dentes e desejo de clareamento',
  'Mau hálito persistente',
];

const PROCEDURE_TYPES = [
  { type: 'Restauração', cost: 180 },
  { type: 'Extração', cost: 150 },
  { type: 'Tratamento de Canal', cost: 450 },
  { type: 'Limpeza / Profilaxia', cost: 120 },
  { type: 'Aplicação de Flúor', cost: 80 },
  { type: 'Clareamento Dental', cost: 350 },
];

const TOOTH_FACES = ['M', 'D', 'V', 'L', 'O', null];

const TOOTH_DESCRIPTIONS = [
  'Cárie incipiente observada',
  'Fratura de esmalte',
  'Desgaste oclusal por bruxismo',
  'Restauração antiga com infiltração',
  'Lesão periapical visível em radiografia',
  'Hipersensibilidade dentinária',
];

const ADDRESSES = [
  'Rua das Acácias, 45 - São Paulo, SP',
  'Av. Paulista, 1200 - São Paulo, SP',
  'Rua do Comércio, 78 - Campinas, SP',
  'Travessa das Flores, 12 - Belo Horizonte, MG',
  'Rua Sete de Setembro, 300 - Rio de Janeiro, RJ',
  'Alameda Santos, 55 - São Paulo, SP',
  'Rua XV de Novembro, 88 - Curitiba, PR',
];

const CANCELLATION_REASONS = [
  'Compromisso de trabalho',
  'Problema de saúde',
  'Viagem',
  'Esqueceu o agendamento',
];

async function seedDemoData(
  clinic: Clinic,
  dentist: { id: number },
  clinicProcs: ClinicProcedure[],
  dataSource: DataSource,
): Promise<void> {
  const patientRepo = dataSource.getRepository(Patient);
  const procedureRepo = dataSource.getRepository(Procedure);
  const anamnesisRepo = dataSource.getRepository(Anamnesis);
  const paymentRepo = dataSource.getRepository(Payment);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const toothObsRepo = dataSource.getRepository(ToothObservation);
  const budgetRepo = dataSource.getRepository(Budget);
  const budgetItemRepo = dataSource.getRepository(BudgetItem);
  const treatmentPlanRepo = dataSource.getRepository(TreatmentPlan);
  const treatmentPlanItemRepo = dataSource.getRepository(TreatmentPlanItem);

  console.log('\nSeeding demo patients...');

  for (let i = 0; i < PATIENT_NAMES.length; i++) {
    const name = PATIENT_NAMES[i];

    // Idempotência: skip se já existe
    const existing = await patientRepo.findOne({
      where: { name, clinicId: clinic.id },
    });

    let patient: Patient;
    if (existing) {
      patient = existing;
      console.log(`  → [${i + 1}/${PATIENT_NAMES.length}] Paciente já existe: ${name}`);
    } else {
      const birthYear = new Date().getFullYear() - randInt(18, 80);
      const cpfNums = Array.from({ length: 11 }, () => randInt(0, 9));
      const cpf = `${cpfNums.slice(0, 3).join('')}.${cpfNums.slice(3, 6).join('')}.${cpfNums.slice(6, 9).join('')}-${cpfNums.slice(9).join('')}`;
      const emailSlug = name
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[áàâã]/g, 'a')
        .replace(/[éê]/g, 'e')
        .replace(/[í]/g, 'i')
        .replace(/[óô]/g, 'o')
        .replace(/[ú]/g, 'u')
        .replace(/[ç]/g, 'c');

      patient = patientRepo.create({
        name,
        birthDate: new Date(birthYear, randInt(0, 11), randInt(1, 28)),
        document: cpf,
        email: `${emailSlug}${randInt(1, 99)}@email.com`,
        phone: `(${randInt(11, 99)}) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
        address: pick(ADDRESSES),
        clinicId: clinic.id,
      });
      patient = await patientRepo.save(patient);
      console.log(`  → [${i + 1}/${PATIENT_NAMES.length}] Paciente criado: ${name}`);
    }

    // Dados relacionados — cada bloco é idempotente
    await seedProcedures(procedureRepo, patient, clinic.id);
    await seedAnamnesis(anamnesisRepo, patient, clinic.id, i);
    await seedPayments(paymentRepo, patient, clinic.id);
    await seedAppointments(appointmentRepo, patient, clinic.id, dentist.id, i);
    await seedToothObservations(toothObsRepo, patient, clinic.id);
    await seedBudget(budgetRepo, budgetItemRepo, patient, clinic.id, clinicProcs);
    await seedTreatmentPlan(treatmentPlanRepo, treatmentPlanItemRepo, patient, clinic.id, dentist.id);
  }

  console.log('Demo seeding complete!\n');
}

async function seedProcedures(_repo: any, _patient: Patient, _clinicId: number): Promise<void> {}
async function seedAnamnesis(_repo: any, _patient: Patient, _clinicId: number, _idx: number): Promise<void> {}
async function seedPayments(_repo: any, _patient: Patient, _clinicId: number): Promise<void> {}
async function seedAppointments(_repo: any, _patient: Patient, _clinicId: number, _dentistId: number, _idx: number): Promise<void> {}
async function seedToothObservations(_repo: any, _patient: Patient, _clinicId: number): Promise<void> {}
async function seedBudget(_repo: any, _itemRepo: any, _patient: Patient, _clinicId: number, _procs: ClinicProcedure[]): Promise<void> {}
async function seedTreatmentPlan(_repo: any, _itemRepo: any, _patient: Patient, _clinicId: number, _dentistId: number): Promise<void> {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const clinicRepo = dataSource.getRepository(Clinic);
  const userRepo = dataSource.getRepository(User);
  const membershipRepo = dataSource.getRepository(ClinicMembership);
  const procRepo = dataSource.getRepository(ClinicProcedure);

  console.log('Seeding database...');

  // Create Clinic
  let clinic = await clinicRepo.findOne({
    where: { name: 'OdontoTec Default Clinic' },
  });
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
    'Admin User',
    'admin@odontotec.com',
    'admin123',
    UserRole.ADMIN,
    ClinicRole.OWNER,
  );

  // Set clinic owner
  if (!clinic.ownerId) {
    clinic.ownerId = admin.id;
    await clinicRepo.save(clinic);
  }

  // Create Dentist User
  await createUserWithMembership(
    'Dr. Dentist',
    'dentist@odontotec.com',
    'dentist123',
    UserRole.DENTIST,
    ClinicRole.DENTIST,
  );

  // Create Receptionist User
  await createUserWithMembership(
    'Receptionist User',
    'receptionist@odontotec.com',
    'simple123',
    UserRole.SIMPLE,
    ClinicRole.RECEPTIONIST,
  );

  // Create Default Clinic Procedures
  const defaultProcs = [
    {
      name: 'Restauração',
      description: 'Restauração dentária',
      baseValue: 180,
      selectionMode: 'FACE',
    },
    {
      name: 'Extração',
      description: 'Extração de dente',
      baseValue: 150,
      selectionMode: 'TOOTH',
    },
    {
      name: 'Tratamento de Canal',
      description: 'Endodontia',
      baseValue: 450,
      selectionMode: 'TOOTH',
    },
    {
      name: 'Limpeza / Profilaxia',
      description: 'Limpeza completa',
      baseValue: 120,
      selectionMode: 'GENERAL',
    },
    {
      name: 'Aplicação de Flúor',
      description: 'Prevenção',
      baseValue: 80,
      selectionMode: 'GENERAL',
    },
  ];

  for (const pData of defaultProcs) {
    const existing = await procRepo.findOne({
      where: { name: pData.name, clinicId: clinic.id },
    });
    if (!existing) {
      const proc = procRepo.create({ ...pData, clinicId: clinic.id });
      await procRepo.save(proc);
      console.log(
        `  → Procedure created: ${pData.name} (${pData.selectionMode})`,
      );
    }
  }

  // Buscar procedimentos criados para passar ao seedDemoData
  const clinicProcsForSeed = await procRepo.find({ where: { clinicId: clinic.id } });

  // Buscar dentista para passar ao seedDemoData
  const dentistUser = await userRepo.findOne({ where: { email: 'dentist@odontotec.com' } });

  await seedDemoData(clinic, dentistUser!, clinicProcsForSeed, dataSource);

  await app.close();
  console.log('Seeding complete!');
}
bootstrap();
