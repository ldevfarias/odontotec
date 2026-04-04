import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/role.enum';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'List clinic notifications' })
    findAll(
        @Tenant() clinicId: number,
        @CurrentUser('userId') userId: number,
        @CurrentUser('role') role: string,
        @Query() pagination: PaginationDto
    ) {
        return this.notificationsService.findAll(clinicId, userId, role, pagination.page, pagination.limit);
    }

    @Patch(':id/read')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'Mark notification as read' })
    markAsRead(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.notificationsService.markAsRead(id, clinicId);
    }

    @Patch('read-all')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'Mark all notifications as read' })
    markAllAsRead(@Tenant() clinicId: number) {
        return this.notificationsService.markAllAsRead(clinicId);
    }
}
