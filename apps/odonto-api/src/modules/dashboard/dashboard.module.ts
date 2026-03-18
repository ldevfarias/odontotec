import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AppointmentsModule } from '../appointments/appointments.module';
import { PatientsModule } from '../patients/patients.module';
import { TreatmentPlansModule } from '../treatment-plans/treatment-plans.module';

@Module({
    imports: [
        AppointmentsModule,
        PatientsModule,
        TreatmentPlansModule
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
