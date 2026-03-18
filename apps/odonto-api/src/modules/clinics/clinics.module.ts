import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './entities/clinic.entity';
import { ClinicMembership } from './entities/clinic-membership.entity';

import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';

@Module({
    imports: [TypeOrmModule.forFeature([Clinic, ClinicMembership])],
    controllers: [ClinicsController],
    providers: [ClinicsService],
    exports: [TypeOrmModule, ClinicsService],
})
export class ClinicsModule { }
