import {
    Controller,
    Get,
    Post,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    UseInterceptors,
    UploadedFiles,
    Body,
    BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ExamsService } from '../services/exams.service';
import { CreateExamDto } from '../dto/create-exam.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { Tenant } from '../../../common/decorators/tenant.decorator';

@ApiTags('Exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Post('upload')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Unsupported file type. Only JPG, PNG and PDF are allowed.'), false);
            }
        }
    }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a clinical exam document' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                patientId: { type: 'number' },
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    }
                },
            },
            required: ['title', 'patientId', 'files']
        },
    })
    @ApiResponse({ status: 201, description: 'The file has been successfully uploaded.' })
    upload(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createExamDto: CreateExamDto,
        @Tenant() clinicId: number
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('At least one file is required');
        }
        return Promise.all(
            files.map(file => this.examsService.create(createExamDto, clinicId, file))
        );
    }

    @Get('patient/:patientId')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'List all exams for a specific patient' })
    findAllByPatient(@Param('patientId', ParseIntPipe) patientId: number, @Tenant() clinicId: number) {
        return this.examsService.findAllByPatient(patientId, clinicId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.DENTIST)
    @ApiOperation({ summary: 'Delete an exam' })
    remove(@Param('id', ParseIntPipe) id: number, @Tenant() clinicId: number) {
        return this.examsService.remove(id, clinicId);
    }
}
