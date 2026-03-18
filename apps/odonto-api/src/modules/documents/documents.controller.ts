import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreatePatientDocumentDto, UpdatePatientDocumentDto } from './dto/patient-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Create a new patient document' })
    create(@Body() createDto: CreatePatientDocumentDto, @Tenant() clinicId: number) {
        return this.documentsService.create(createDto, clinicId);
    }

    @Get()
    @ApiOperation({ summary: 'List all documents in the clinic' })
    findAll(@Tenant() clinicId: number, @Query('patientId') patientId?: string) {
        return this.documentsService.findAll(clinicId, patientId ? Number(patientId) : undefined);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document details' })
    findOne(@Param('id') id: string, @Tenant() clinicId: number) {
        return this.documentsService.findOne(Number(id), clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Update document' })
    update(@Param('id') id: string, @Body() updateDto: UpdatePatientDocumentDto, @Tenant() clinicId: number) {
        return this.documentsService.update(Number(id), updateDto, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Remove document' })
    remove(@Param('id') id: string, @Tenant() clinicId: number) {
        return this.documentsService.remove(Number(id), clinicId);
    }
}
