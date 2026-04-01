import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from './dto/treatment-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { getClinicId } from '../../common/get-clinic-id';
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
    create(@Body() createDto: CreateTreatmentPlanDto, @Request() req) {
        return this.treatmentPlansService.create(createDto, getClinicId(req));
    }

    @Get()
    @ApiOperation({ summary: 'Get all treatment plans for the clinic' })
    findAll(@Request() req, @Query() pagination: PaginationDto) {
        return this.treatmentPlansService.findAll(getClinicId(req), pagination.page, pagination.limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a treatment plan by id' })
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.treatmentPlansService.findOne(id, getClinicId(req));
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Update a treatment plan' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTreatmentPlanDto, @Request() req) {
        return this.treatmentPlansService.update(id, updateDto, getClinicId(req));
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a treatment plan' })
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.treatmentPlansService.remove(id, getClinicId(req));
    }
}
