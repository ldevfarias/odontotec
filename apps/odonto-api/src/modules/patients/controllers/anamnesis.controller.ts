import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnamnesisService } from '../services/anamnesis.service';
import { CreateAnamnesisDto } from '../dto/create-anamnesis.dto';
import { UpdateAnamnesisDto } from '../dto/update-anamnesis.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { Tenant } from '../../../common/decorators/tenant.decorator';

@ApiTags('Anamnesis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('anamnesis')
export class AnamnesisController {
    constructor(private readonly anamnesisService: AnamnesisService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Create a new anamnesis record' })
    @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
    create(@Body() createAnamnesisDto: CreateAnamnesisDto, @Tenant() clinicId: number) {
        return this.anamnesisService.create(createAnamnesisDto, clinicId);
    }

    @Get('patient/:patientId')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'List all anamnesis records for a specific patient' })
    findAllByPatient(@Param('patientId', ParseIntPipe) patientId: number, @Tenant() clinicId: number) {
        return this.anamnesisService.findAllByPatient(patientId, clinicId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Get a single anamnesis record' })
    findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.anamnesisService.findOne(id, clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Update an anamnesis record' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateAnamnesisDto: UpdateAnamnesisDto, @Tenant() clinicId: number) {
        return this.anamnesisService.update(id, updateAnamnesisDto, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Delete an anamnesis record' })
    remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.anamnesisService.remove(id, clinicId);
    }
}
