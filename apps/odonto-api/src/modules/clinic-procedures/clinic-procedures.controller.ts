import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClinicProceduresService } from './clinic-procedures.service';
import {
  CreateClinicProcedureDto,
  UpdateClinicProcedureDto,
} from './dto/clinic-procedure.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Clinic Procedures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinic-procedures')
export class ClinicProceduresController {
  constructor(private readonly service: ClinicProceduresService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  create(@Body() dto: CreateClinicProcedureDto, @Tenant() clinicId: number) {
    return this.service.create(dto, clinicId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
  findAll(@Tenant() clinicId: number) {
    return this.service.findAll(clinicId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
  findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
    return this.service.findOne(id, clinicId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClinicProcedureDto,
    @Tenant() clinicId: number,
  ) {
    return this.service.update(id, dto, clinicId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
    return this.service.remove(id, clinicId);
  }
}
