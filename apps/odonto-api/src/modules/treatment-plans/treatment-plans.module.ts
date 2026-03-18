import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentPlansService } from './treatment-plans.service';
import { TreatmentPlansController } from './treatment-plans.controller';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { TreatmentPlanItem } from './entities/treatment-plan-item.entity';
import { Payment } from '../patients/entities/payment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TreatmentPlan, TreatmentPlanItem, Payment])],
    controllers: [TreatmentPlansController],
    providers: [TreatmentPlansService],
    exports: [TreatmentPlansService],
})
export class TreatmentPlansModule { }
