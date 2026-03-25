import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, NotFoundException, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ClinicUserDto } from './dto/clinic-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from './enums/role.enum';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('me/accept-terms')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'Accept terms of use for the logged in user' })
    acceptTerms(@Request() req) {
        return this.usersService.acceptTerms(req.user.sub || req.user.userId);
    }

    @Public()
    @Get('invitation/:token')
    @ApiOperation({ summary: 'Get invitation details by token' })
    async findInvitation(@Param('token') token: string) {
        const invitation = await this.usersService.findInvitationByToken(token);
        if (!invitation) {
            throw new NotFoundException('Invitation not found or expired');
        }
        return invitation;
    }

    @Post('invite')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Invite a new professional' })
    @ApiResponse({ status: 201, description: 'Invitation created and sent.' })
    invite(@Body() inviteUserDto: InviteUserDto, @Tenant() clinicId: number) {
        return this.usersService.invite(inviteUserDto, clinicId);
    }

    @Get('invitations')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all clinic invitations' })
    findAllInvitations(@Tenant() clinicId: number) {
        return this.usersService.findAllInvitations(clinicId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'List all clinic users' })
    @ApiResponse({ status: 200, type: [ClinicUserDto] })
    findAll(@Tenant() clinicId: number): Promise<ClinicUserDto[]> {
        return this.usersService.findAllByClinic(clinicId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update user information' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Deactivate user' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
