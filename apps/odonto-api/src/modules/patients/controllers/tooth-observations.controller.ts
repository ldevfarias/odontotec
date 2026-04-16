import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { Tenant } from '../../../common/decorators/tenant.decorator';
import { ToothObservationsService } from '../services/tooth-observations.service';
import { CreateToothObservationDto } from '../dto/create-tooth-observation.dto';

@ApiTags('ToothObservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tooth-observations')
export class ToothObservationsController {
  constructor(private readonly service: ToothObservationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  create(@Body() dto: CreateToothObservationDto, @Tenant() clinicId: number) {
    return this.service.create(dto, clinicId);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
  findAllByPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Tenant() clinicId: number,
  ) {
    return this.service.findAllByPatient(patientId, clinicId);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
    return this.service.remove(id, clinicId);
  }
}
