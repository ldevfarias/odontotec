import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { getClinicId } from '../../../common/get-clinic-id';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
        return this.paymentsService.create(createPaymentDto, getClinicId(req));
    }

    @Get('patient/:patientId')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    findAllByPatient(@Param('patientId', ParseIntPipe) patientId: number, @Request() req) {
        return this.paymentsService.findAllByPatient(patientId, getClinicId(req));
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.paymentsService.findOne(id, getClinicId(req));
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: UpdatePaymentDto, @Request() req) {
        return this.paymentsService.update(id, updatePaymentDto, getClinicId(req));
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.paymentsService.remove(id, getClinicId(req));
    }
}
