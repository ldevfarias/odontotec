import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully.' })
  create(@Body() createBudgetDto: CreateBudgetDto, @Tenant() clinicId: number) {
    return this.budgetsService.create(clinicId, createBudgetDto);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
  @ApiOperation({ summary: 'Get all budgets for a patient' })
  findAllByPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Tenant() clinicId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.budgetsService.findAllByPatient(
      clinicId,
      patientId,
      pagination.page,
      pagination.limit,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
  @ApiOperation({ summary: 'Get a budget by id' })
  findOne(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
    return this.budgetsService.findOne(id, clinicId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Update a budget' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Tenant() clinicId: number,
  ) {
    return this.budgetsService.update(id, clinicId, updateBudgetDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
    return this.budgetsService.remove(id, clinicId);
  }
}
