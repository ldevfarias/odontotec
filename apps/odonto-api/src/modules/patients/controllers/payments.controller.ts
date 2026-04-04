import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Tenant } from '../../../common/decorators/tenant.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    create(@Body() createPaymentDto: CreatePaymentDto, @Tenant() clinicId: number) {
        return this.paymentsService.create(createPaymentDto, clinicId);
    }

    @Get('patient/:patientId')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    findAllByPatient(@Param('patientId', ParseIntPipe) patientId: number, @Tenant() clinicId: number) {
        return this.paymentsService.findAllByPatient(patientId, clinicId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SIMPLE, UserRole.DENTIST)
    findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.paymentsService.findOne(id, clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: UpdatePaymentDto, @Tenant() clinicId: number) {
        return this.paymentsService.update(id, updatePaymentDto, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.paymentsService.remove(id, clinicId);
    }
}
