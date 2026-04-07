import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Procedure } from './entities/procedure.entity';
import { Anamnesis } from './entities/anamnesis.entity';
import { Payment } from './entities/payment.entity';
import { Exam } from './entities/exam.entity';
import { ToothObservation } from './entities/tooth-observation.entity';
import { PatientsService } from './patients.service';
import { ProceduresService } from './services/procedures.service';
import { AnamnesisService } from './services/anamnesis.service';
import { PaymentsService } from './services/payments.service';
import { ExamsService } from './services/exams.service';
import { ToothObservationsService } from './services/tooth-observations.service';
import { PatientsController } from './patients.controller';
import { ProceduresController } from './controllers/procedures.controller';
import { AnamnesisController } from './controllers/anamnesis.controller';
import { PaymentsController } from './controllers/payments.controller';
import { ExamsController } from './controllers/exams.controller';
import { ToothObservationsController } from './controllers/tooth-observations.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Patient, Procedure, Anamnesis, Payment, Exam, ToothObservation])],
    controllers: [
        PatientsController,
        ProceduresController,
        AnamnesisController,
        PaymentsController,
        ExamsController,
        ToothObservationsController,
    ],
    providers: [
        PatientsService,
        ProceduresService,
        AnamnesisService,
        PaymentsService,
        ExamsService,
        ToothObservationsService,
    ],
    exports: [
        PatientsService,
        PaymentsService
    ],
})
export class PatientsModule { }
