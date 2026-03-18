import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'Create a new appointment' })
    @ApiResponse({ status: 201, description: 'The appointment has been successfully created.' })
    @ApiResponse({ status: 400, description: 'Conflict: Dentist occupied.' })
    create(
        @Body() createAppointmentDto: CreateAppointmentDto,
        @Tenant() clinicId: number,
        @CurrentUser('role') role: string,
        @CurrentUser('userId') userId: number,
    ) {
        // If the logged-in user is a DENTIST, force the dentistId to be themselves
        if (role === UserRole.DENTIST) {
            createAppointmentDto.dentistId = userId;
        }
        return this.appointmentsService.create(createAppointmentDto, clinicId);
    }

    @Get('public/cancel')
    @Public()
    @ApiOperation({ summary: 'Cancel appointment via public link' })
    async publicCancel(@Query('id') id: string, @Query('token') token: string) {
        return this.appointmentsService.updateStatusPublic(Number(id), token, AppointmentStatus.CANCELLED);
    }

    @Get('check-availability')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'Check dentist availability' })
    @ApiQuery({ name: 'date', required: true, type: String })
    @ApiQuery({ name: 'duration', required: true, type: Number })
    @ApiQuery({ name: 'dentistId', required: true, type: Number })
    @ApiQuery({ name: 'excludeId', required: false, type: Number })
    @ApiQuery({ name: 'patientId', required: false, type: Number })
    checkAvailability(
        @Tenant() clinicId: number,
        @Query('date') date: string,
        @Query('duration', ParseIntPipe) duration: number,
        @Query('dentistId', ParseIntPipe) dentistId: number,
        @Query('excludeId', new ParseIntPipe({ optional: true })) excludeId?: number,
        @Query('patientId', new ParseIntPipe({ optional: true })) patientId?: number
    ) {
        return this.appointmentsService.checkAvailability(clinicId, dentistId, date, duration, excludeId, patientId);
    }

    @Get('available-slots')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'Get available time slots for a dentist on a specific date' })
    @ApiQuery({ name: 'date', required: true, type: String, description: 'YYYY-MM-DD' })
    @ApiQuery({ name: 'dentistId', required: true, type: Number })
    @ApiQuery({ name: 'duration', required: false, type: Number, description: 'Duration in minutes (default 30)' })
    @ApiQuery({ name: 'patientId', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Returns an array of time strings (HH:mm)', type: [String] })
    getAvailableSlots(
        @Tenant() clinicId: number,
        @Query('date') date: string,
        @Query('dentistId', ParseIntPipe) dentistId: number,
        @Query('duration', new ParseIntPipe({ optional: true })) duration?: number,
        @Query('patientId', new ParseIntPipe({ optional: true })) patientId?: number
    ) {
        return this.appointmentsService.getAvailableSlots(clinicId, dentistId, date, duration, patientId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'List clinic appointments' })
    @ApiQuery({ name: 'date', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'dentistId', required: false, type: Number })
    @ApiQuery({ name: 'patientId', required: false, type: Number })
    @ApiQuery({ name: 'includeOccurrences', required: false, type: Boolean })
    findAll(
        @Tenant() clinicId: number,
        @CurrentUser('role') role: string,
        @CurrentUser('userId') userId: number,
        @Query('date') date?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('dentistId') dentistId?: number,
        @Query('patientId') patientId?: number,
        @Query('includeOccurrences', new ParseBoolPipe({ optional: true })) includeOccurrences?: boolean
    ) {
        return this.appointmentsService.findAll(clinicId, role, userId, { date, startDate, endDate, dentistId, patientId, includeOccurrences });
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'Get appointment details' })
    findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.appointmentsService.findOne(id, clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    @ApiOperation({ summary: 'Update appointment' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAppointmentDto: UpdateAppointmentDto,
        @Tenant() clinicId: number,
        @CurrentUser('role') role: string,
        @CurrentUser('userId') userId: number,
    ) {
        // If the logged-in user is a DENTIST, force the dentistId to be themselves
        if (role === UserRole.DENTIST && updateAppointmentDto.dentistId !== undefined) {
            updateAppointmentDto.dentistId = userId;
        }
        return this.appointmentsService.update(id, updateAppointmentDto, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE)
    @ApiOperation({ summary: 'Cancel appointment' })
    remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.appointmentsService.remove(id, clinicId);
    }
}
