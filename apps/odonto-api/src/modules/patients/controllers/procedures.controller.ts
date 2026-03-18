import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ProceduresService } from '../services/procedures.service';
import { CreateProcedureDto } from '../dto/create-procedure.dto';
import { UpdateProcedureDto } from '../dto/update-procedure.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { getClinicId } from '../../../common/get-clinic-id';

@ApiTags('Procedures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('procedures')
export class ProceduresController {
    constructor(private readonly proceduresService: ProceduresService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    create(@Body() createProcedureDto: CreateProcedureDto, @Request() req) {
        return this.proceduresService.create(createProcedureDto, getClinicId(req));
    }

    @Get('patient/:patientId')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    findAllByPatient(@Param('patientId', ParseIntPipe) patientId: number, @Request() req) {
        return this.proceduresService.findAllByPatient(patientId, getClinicId(req));
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.proceduresService.findOne(id, getClinicId(req));
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateProcedureDto: UpdateProcedureDto, @Request() req) {
        return this.proceduresService.update(id, updateProcedureDto, getClinicId(req));
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.proceduresService.remove(id, getClinicId(req));
    }
}
