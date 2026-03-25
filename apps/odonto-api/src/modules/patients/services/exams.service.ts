import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../entities/exam.entity';
import { CreateExamDto } from '../dto/create-exam.dto';
import { Inject } from '@nestjs/common';
import { STORAGE_PROVIDER } from '../../../common/providers/storage/storage.provider.interface';
import type { IStorageProvider } from '../../../common/providers/storage/storage.provider.interface';

@Injectable()
export class ExamsService {
    constructor(
        @InjectRepository(Exam)
        private examsRepository: Repository<Exam>,
        @Inject(STORAGE_PROVIDER)
        private storageProvider: IStorageProvider,
    ) { }

    async create(
        createExamDto: CreateExamDto,
        clinicId: number,
        file: Express.Multer.File
    ): Promise<Exam> {
        // Upload file to the storage provider (S3 or local)
        const fileUrl = await this.storageProvider.upload(
            file.buffer,
            file.originalname,
            file.mimetype,
            `clinics/${clinicId}/patients/${createExamDto.patientId}/exams`
        );

        const exam = this.examsRepository.create({
            ...createExamDto,
            clinicId,
            fileUrl,
            fileType: file.mimetype,
        });
        return this.examsRepository.save(exam);
    }

    async findAllByPatient(patientId: number, clinicId: number): Promise<Exam[]> {
        return this.examsRepository.find({
            where: { patientId, clinicId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number, clinicId: number): Promise<Exam> {
        const exam = await this.examsRepository.findOne({
            where: { id, clinicId },
        });
        if (!exam) {
            throw new NotFoundException(`Exam with ID ${id} not found`);
        }
        return exam;
    }

    async remove(id: number, clinicId: number): Promise<void> {
        const exam = await this.findOne(id, clinicId);

        // Delete the file from storage
        await this.storageProvider.delete(exam.fileUrl);

        await this.examsRepository.remove(exam);
    }
}
