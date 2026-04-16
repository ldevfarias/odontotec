import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicProcedure } from './entities/clinic-procedure.entity';
import { ClinicProceduresService } from './clinic-procedures.service';
import { ClinicProceduresController } from './clinic-procedures.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicProcedure])],
  controllers: [ClinicProceduresController],
  providers: [ClinicProceduresService],
  exports: [ClinicProceduresService],
})
export class ClinicProceduresModule {}
