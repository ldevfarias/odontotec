import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, ParseIntPipe, NotFoundException, Request, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { UpdateUserDto, UsersQueryDto, ChangeRoleDto, DeactivateUserDto } from './dto/user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ClinicUserDto } from './dto/clinic-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from './enums/role.enum';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { ImageMagicNumberValidator } from '../../common/validators/image-magic-number.validator';


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

    @Put('me/avatar')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    @ApiOperation({ summary: 'Upload profile avatar for active clinic', operationId: 'usersControllerUploadAvatar' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiResponse({ status: 200, schema: { type: 'object', properties: { avatarUrl: { type: 'string' } } } })
    uploadAvatar(
        @Request() req,
        @Tenant() clinicId: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
                    new ImageMagicNumberValidator({}),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        const userId = req.user.sub || req.user.userId;
        return this.usersService.uploadAvatar(userId, clinicId, file);
    }

    @Delete('me/avatar')
    @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SIMPLE)
    @ApiOperation({ summary: 'Remove profile avatar for active clinic', operationId: 'usersControllerRemoveAvatar' })
    @ApiResponse({ status: 200, schema: { type: 'object', properties: { avatarUrl: { type: 'string', nullable: true } } } })
    removeAvatar(@Request() req, @Tenant() clinicId: number) {
        const userId = req.user.sub || req.user.userId;
        return this.usersService.removeAvatar(userId, clinicId);
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
    @ApiResponse({ status: 200 })
    findAll(@Tenant() clinicId: number, @Query() query: UsersQueryDto) {
        return this.usersService.findAllByClinic(clinicId, query.page, query.limit, query.role);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update user information' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/role')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Change user role' })
    changeRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() changeRoleDto: ChangeRoleDto,
        @Tenant() clinicId: number,
    ) {
        return this.usersService.changeRole(id, changeRoleDto.role, clinicId);
    }

    @Patch(':id/active')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Activate or deactivate a user' })
    setActive(
        @Param('id', ParseIntPipe) id: number,
        @Body() deactivateUserDto: DeactivateUserDto,
        @Tenant() clinicId: number,
    ) {
        return this.usersService.setActive(id, deactivateUserDto.isActive, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Deactivate user' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
