import { Controller, Get, Body, Patch, Post, UseGuards, Request, Put, UseInterceptors, UploadedFile, Inject, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { STORAGE_PROVIDER } from '../../common/providers/storage/storage.provider.interface';
import type { IStorageProvider } from '../../common/providers/storage/storage.provider.interface';

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Controller('clinics')
@UseGuards(JwtAuthGuard)
export class ClinicsController {
    constructor(
        private readonly clinicsService: ClinicsService,
        @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
    ) { }

    @Get('mine')
    async getMyClinics(@Request() req) {
        return this.clinicsService.findAllByUser(req.user.userId);
    }

    @Get('active')
    async getActive(@Request() req) {
        const clinicId = req.headers['x-clinic-id'];
        if (!clinicId) {
            return { error: 'Missing X-Clinic-Id header' };
        }
        const membership = await this.clinicsService.getUserMembership(req.user.userId, Number(clinicId));
        if (!membership) {
            return { error: 'No access to this clinic' };
        }
        return this.clinicsService.findOne(Number(clinicId));
    }

    @Post()
    async create(@Request() req, @Body() createClinicDto: CreateClinicDto) {
        return this.clinicsService.createForUser(req.user.userId, createClinicDto);
    }

    @Patch('active')
    async updateActive(@Request() req, @Body() updateClinicDto: UpdateClinicDto) {
        const clinicId = req.headers['x-clinic-id'];
        if (!clinicId) {
            return { error: 'Missing X-Clinic-Id header' };
        }
        return this.clinicsService.update(Number(clinicId), updateClinicDto);
    }

    @Put('active/logo')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async uploadLogo(
        @Request() req,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: MAX_LOGO_SIZE_BYTES }),
                    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        const clinicId = req.headers['x-clinic-id'];
        const logoUrl = await this.storage.upload(file.buffer, file.originalname, file.mimetype, `clinics/${clinicId}/logos`);
        return this.clinicsService.updateLogo(Number(clinicId), logoUrl);
    }
}
