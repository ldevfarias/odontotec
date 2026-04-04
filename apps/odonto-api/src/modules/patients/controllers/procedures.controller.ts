import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProceduresService } from '../services/procedures.service';
import { CreateProcedureDto } from '../dto/create-procedure.dto';
import { UpdateProcedureDto } from '../dto/update-procedure.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Tenant } from '../../../common/decorators/tenant.decorator';

@ApiTags('Procedures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('procedures')
export class ProceduresController {
    constructor(private readonly proceduresService: ProceduresService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    create(@Body() createProcedureDto: CreateProcedureDto, @Tenant() clinicId: number) {
        return this.proceduresService.create(createProcedureDto, clinicId);
    }

    @Get('patient/:patientId')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    findAllByPatient(@Param('patientId', ParseIntPipe) patientId: number, @Tenant() clinicId: number) {
        return this.proceduresService.findAllByPatient(patientId, clinicId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.proceduresService.findOne(id, clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProcedureDto: UpdateProcedureDto, @Tenant() clinicId: number) {
        return this.proceduresService.update(id, updateProcedureDto, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.proceduresService.remove(id, clinicId);
    }
}
