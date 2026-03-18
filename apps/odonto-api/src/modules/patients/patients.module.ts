import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Procedure } from './entities/procedure.entity';
import { Anamnesis } from './entities/anamnesis.entity';
import { Payment } from './entities/payment.entity';
import { Exam } from './entities/exam.entity';
import { PatientsService } from './patients.service';
import { ProceduresService } from './services/procedures.service';
import { AnamnesisService } from './services/anamnesis.service';
import { PaymentsService } from './services/payments.service';
import { ExamsService } from './services/exams.service';
import { PatientsController } from './patients.controller';
import { ProceduresController } from './controllers/procedures.controller';
import { AnamnesisController } from './controllers/anamnesis.controller';
import { PaymentsController } from './controllers/payments.controller';
import { ExamsController } from './controllers/exams.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Patient, Procedure, Anamnesis, Payment, Exam])],
    controllers: [
        PatientsController,
        ProceduresController,
        AnamnesisController,
        PaymentsController,
        ExamsController
    ],
    providers: [
        PatientsService,
        ProceduresService,
        AnamnesisService,
        PaymentsService,
        ExamsService
    ],
    exports: [
        PatientsService,
        PaymentsService
    ],
})
export class PatientsModule { }
