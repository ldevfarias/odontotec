import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClinicProceduresService } from './clinic-procedures.service';
import { CreateClinicProcedureDto, UpdateClinicProcedureDto } from './dto/clinic-procedure.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { getClinicId } from '../../common/get-clinic-id';

@ApiTags('Clinic Procedures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clinic-procedures')
export class ClinicProceduresController {
    constructor(private readonly service: ClinicProceduresService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    create(@Body() dto: CreateClinicProcedureDto, @Request() req) {
        return this.service.create(dto, getClinicId(req));
    }

    @Get()
    findAll(@Request() req) {
        return this.service.findAll(getClinicId(req));
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.service.findOne(id, getClinicId(req));
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClinicProcedureDto, @Request() req) {
        return this.service.update(id, dto, getClinicId(req));
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.service.remove(id, getClinicId(req));
    }
}
