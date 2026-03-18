import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetItem } from './entities/budget-item.entity';
import { ClinicProcedure } from '../clinic-procedures/entities/clinic-procedure.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Budget, BudgetItem, ClinicProcedure])],
    controllers: [BudgetsController],
    providers: [BudgetsService],
    exports: [BudgetsService],
})
export class BudgetsModule { }
