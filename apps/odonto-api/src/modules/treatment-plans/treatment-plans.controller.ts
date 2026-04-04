import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from './dto/treatment-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Treatment Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('treatment-plans')
export class TreatmentPlansController {
    constructor(private readonly treatmentPlansService: TreatmentPlansService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Create a new treatment plan' })
    @ApiResponse({ status: 201, description: 'The treatment plan has been successfully created.' })
    create(@Body() createDto: CreateTreatmentPlanDto, @Tenant() clinicId: number) {
        return this.treatmentPlansService.create(createDto, clinicId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'Get all treatment plans for the clinic' })
    findAll(@Tenant() clinicId: number, @Query() pagination: PaginationDto) {
        return this.treatmentPlansService.findAll(clinicId, pagination.page, pagination.limit);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'Get a treatment plan by id' })
    findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.treatmentPlansService.findOne(id, clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Update a treatment plan' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTreatmentPlanDto, @Tenant() clinicId: number) {
        return this.treatmentPlansService.update(id, updateDto, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a treatment plan' })
    remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.treatmentPlansService.remove(id, clinicId);
    }
}
