import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto, PatientResponseDto } from './dto/patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'Create a new patient' })
    @ApiResponse({ status: 201, description: 'The patient has been successfully created.' })
    create(@Body() createPatientDto: CreatePatientDto, @Tenant() clinicId: number) {
        return this.patientsService.create(createPatientDto, clinicId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'List all patients in the clinic' })
    @ApiResponse({ status: 200, description: 'Return all patients with their latest procedure and next appointment dates.', type: PatientResponseDto, isArray: true })
    findAll(@Tenant() clinicId: number): Promise<PatientResponseDto[]> {
        return this.patientsService.findAll(clinicId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'Get patient details' })
    findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.patientsService.findOne(id, clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update patient information' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updatePatientDto: UpdatePatientDto, @Tenant() clinicId: number) {
        return this.patientsService.update(id, updatePatientDto, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a patient' })
    remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.patientsService.remove(id, clinicId);
    }
}
