import { Controller, Post, Get, Body, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterInvitationDto } from './dto/register-invitation.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { InitiateRegistrationDto } from './dto/initiate-registration.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CompleteClinicDto } from './dto/complete-clinic.dto';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieDomain = process.env.COOKIE_DOMAIN; // e.g. '.odontoehtec.com' in production

        const base = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            ...(cookieDomain && { domain: cookieDomain }),
        };

        res.cookie('access_token', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
        res.cookie('refresh_token', refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Return JWT tokens' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);
        this.setCookies(res, result.access_token, result.refresh_token);
        return result;
    }

    @Public()
    @Post('register-invitation')
    @ApiOperation({ summary: 'Register from invitation token' })
    @ApiResponse({ status: 201, description: 'User created and logged in' })
    async register(@Body() registerDto: RegisterInvitationDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.registerByInvitation(registerDto);
        this.setCookies(res, result.access_token, result.refresh_token);
        return result;
    }

    @Public()
    @Post('register-tenant')
    @ApiOperation({ summary: 'Register a new clinic and admin user' })
    @ApiResponse({ status: 201, description: 'Clinic and User created, returns tokens' })
    async registerTenant(@Body() registerDto: RegisterTenantDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.registerTenant(registerDto);
        this.setCookies(res, result.access_token, result.refresh_token);
        return result;
    }

    @Public()
    @Post('initiate-registration')
    @ApiOperation({ summary: 'Initiate account registration' })
    @ApiResponse({ status: 201, description: 'Verification email sent' })
    async initiateRegistration(@Body() dto: InitiateRegistrationDto) {
        return this.authService.initiateRegistration(dto);
    }

    @Public()
    @Post('verify-email')
    @ApiOperation({ summary: 'Verify email and create user' })
    @ApiResponse({ status: 201, description: 'User created, returns tokens' })
    async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyEmailAndSetPassword(dto);
        this.setCookies(res, result.access_token, result.refresh_token);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post('complete-clinic')
    @ApiOperation({ summary: 'Complete clinic setup' })
    @ApiResponse({ status: 201, description: 'Clinic setup completed' })
    async completeClinicSetup(@Request() req, @Body() dto: CompleteClinicDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.completeClinicSetup(req.user.userId, dto);
        this.setCookies(res, result.access_token, result.refresh_token);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({ status: 200, description: 'User logged out' })
    async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.user.userId);
        const cookieDomain = process.env.COOKIE_DOMAIN;
        const clearOptions = cookieDomain ? { domain: cookieDomain } : {};
        res.clearCookie('access_token', clearOptions);
        res.clearCookie('refresh_token', clearOptions);
        return { message: 'Logged out successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user and clinics' })
    @ApiResponse({ status: 200, description: 'User data and clinics' })
    async getMe(@Request() req) {
        return this.authService.getMe(req.user.userId);
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Return new JWT tokens' })
    async refreshTokens(@Request() req, @Res({ passthrough: true }) res: Response) {
        const userId = req.user.userId || req.user.sub;
        const refreshToken = req.user.refreshToken;
        const result = await this.authService.refreshTokens(Number(userId), refreshToken);
        this.setCookies(res, result.access_token, result.refresh_token);
        return result;
    }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Public()
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset email' })
    @ApiResponse({ status: 200, description: 'Email sent if user exists' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Public()
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using token' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
    }
}
