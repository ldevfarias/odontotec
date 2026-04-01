import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { Patient } from '../patients/entities/patient.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        @InjectRepository(Clinic)
        private clinicRepository: Repository<Clinic>,
        private emailService: EmailService,
        private jwtService: JwtService,
        private notificationsService: NotificationsService,
    ) { }

    async create(createAppointmentDto: CreateAppointmentDto, clinicId: number): Promise<Appointment> {
        const { date, duration = 30, dentistId, patientId } = createAppointmentDto;

        await this.checkConflict(new Date(date), duration, clinicId, dentistId, patientId);

        const appointment = this.appointmentsRepository.create({
            ...createAppointmentDto,
            duration,
            clinicId,
        });
        const saved = await this.appointmentsRepository.save(appointment);

        // Fetch details for email
        const patient = await this.patientRepository.findOne({ where: { id: saved.patientId } });
        const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
        const dentist = await this.appointmentsRepository.manager.getRepository('User').findOne({ where: { id: saved.dentistId } }) as any;

        if (patient?.email) {
            const token = this.jwtService.sign(
                { appointmentId: saved.id, clinicId, action: 'appointment_action' },
                { expiresIn: '7d' }
            );

            this.emailService.sendAppointmentConfirmation(
                patient.email,
                patient.name,
                clinic?.name || 'Clínica',
                new Date(saved.date).toLocaleString('pt-BR'),
                dentist?.name || 'Profissional',
                saved.id,
                token
            );
        }

        // Notify Dentist
        const dateStr = new Date(saved.date).toLocaleString('pt-BR');
        await this.notificationsService.create(
            `Novo agendamento com ${patient?.name || 'Paciente'} em ${dateStr}.`,
            clinicId,
            'INFO',
            saved.dentistId
        );

        return saved;
    }

    async updateStatusPublic(id: number, token: string, status: AppointmentStatus): Promise<void> {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.appointmentId !== id || payload.action !== 'appointment_action') {
                throw new BadRequestException('Token inválido para esta ação');
            }

            const appointment = await this.appointmentsRepository.findOne({
                where: { id },
                relations: ['patient']
            });

            if (!appointment) {
                throw new NotFoundException('Agendamento não encontrado');
            }

            if (payload.clinicId && appointment.clinicId !== payload.clinicId) {
                throw new BadRequestException('Token inválido para esta clínica');
            }

            // If already cancelled, just return success to be idempotent
            if (appointment.status === AppointmentStatus.CANCELLED) {
                return;
            }

            await this.appointmentsRepository.update(id, {
                status,
                cancelledBy: 'PATIENT',
                cancellationReason: 'Cancelado via link público de email'
            });

            // Create notification for the clinic AND the dentist
            const dateStr = new Date(appointment.date).toLocaleString('pt-BR');
            await this.notificationsService.create(
                `O paciente ${appointment.patient.name} cancelou o agendamento de ${dateStr}.`,
                appointment.clinicId,
                'WARNING',
                appointment.dentistId
            );
        } catch (e) {
            console.error('Erro ao cancelar agendamento público:', e);
            throw new BadRequestException('Token expirado ou inválido');
        }
    }

    async findAll(clinicId: number, role?: string, userId?: number, options?: { date?: string; startDate?: string; endDate?: string; dentistId?: number; patientId?: number; includeOccurrences?: boolean; page?: number; limit?: number }): Promise<PaginatedResponseDto<Appointment>> {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 50;

        const query = this.appointmentsRepository.createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.dentist', 'dentist')
            .where('appointment.clinicId = :clinicId', { clinicId });

        if (!options?.includeOccurrences) {
            query.andWhere('appointment.status NOT IN (:...badStatus)', { badStatus: [AppointmentStatus.CANCELLED, AppointmentStatus.ABSENT] });
        }

        // Role-based filtering (override if explicitly requested by admin/simple but dentists only see their own by default)
        if (role === 'DENTIST') {
            query.andWhere('appointment.dentistId = :userId', { userId });
        } else if (options?.dentistId) {
            query.andWhere('appointment.dentistId = :dentistId', { dentistId: options.dentistId });
        }

        if (options?.patientId) {
            query.andWhere('appointment.patientId = :patientId', { patientId: options.patientId });
        }

        if (options?.startDate && options?.endDate) {
            const start = new Date(`${options.startDate}T00:00:00.000Z`);
            const end = new Date(`${options.endDate}T23:59:59.999Z`);
            query.andWhere('appointment.date BETWEEN :start AND :end', { start, end });
        } else if (options?.date) {
            const start = new Date(`${options.date}T00:00:00.000Z`);
            const end = new Date(`${options.date}T23:59:59.999Z`);
            query.andWhere('appointment.date BETWEEN :start AND :end', { start, end });
        }

        const [data, total] = await query
            .orderBy('appointment.date', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit };
    }

    async findOne(id: number, clinicId: number): Promise<Appointment> {
        const appointment = await this.appointmentsRepository.findOne({ where: { id, clinicId }, relations: ['patient', 'dentist'] });
        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }
        return appointment;
    }

    async update(id: number, updateAppointmentDto: UpdateAppointmentDto, clinicId: number): Promise<Appointment> {
        const before = await this.findOne(id, clinicId);

        if (updateAppointmentDto.date || updateAppointmentDto.duration || updateAppointmentDto.dentistId) {
            const date = updateAppointmentDto.date ? new Date(updateAppointmentDto.date) : before.date;
            const duration = updateAppointmentDto.duration ?? before.duration;
            const dentistId = updateAppointmentDto.dentistId ?? before.dentistId;
            const patientId = updateAppointmentDto.patientId ?? before.patientId;

            await this.checkConflict(date, duration, clinicId, dentistId, patientId, id);
        }

        await this.appointmentsRepository.update({ id, clinicId }, updateAppointmentDto);
        const after = await this.findOne(id, clinicId);

        await this.notifyAppointmentChanges(before, after, clinicId);
        return after;
    }

    private async notifyAppointmentChanges(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
        await this.notifyIfPatientChanged(before, after, clinicId);
        await this.notifyIfRescheduled(before, after, clinicId);
        await this.notifyIfDentistChanged(before, after, clinicId);
        await this.notifyIfCancelled(before, after, clinicId);
    }

    private async notifyIfPatientChanged(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
        if (before.patientId === after.patientId) return;
        const originalDate = new Date(before.date).toLocaleString('pt-BR');
        await this.notificationsService.create(
            `O paciente do agendamento de ${originalDate} foi alterado para ${after.patient?.name ?? 'Paciente'}.`,
            clinicId,
            'WARNING',
            after.dentistId,
        );
    }

    private async notifyIfRescheduled(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
        if (new Date(before.date).toISOString() === new Date(after.date).toISOString()) return;
        const newDate = new Date(after.date).toLocaleString('pt-BR');
        await this.notificationsService.create(
            `O agendamento com ${after.patient?.name ?? 'Paciente'} foi reagendado para ${newDate}.`,
            clinicId,
            'WARNING',
            after.dentistId,
        );
    }

    private async notifyIfDentistChanged(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
        if (before.dentistId === after.dentistId) return;
        const dateStr = new Date(after.date).toLocaleString('pt-BR');
        await Promise.all([
            this.notificationsService.create(
                `O agendamento com ${after.patient?.name ?? 'Paciente'} em ${dateStr} foi transferido para outro profissional.`,
                clinicId,
                'WARNING',
                before.dentistId,
            ),
            this.notificationsService.create(
                `Você recebeu um novo agendamento com ${after.patient?.name ?? 'Paciente'} em ${dateStr}.`,
                clinicId,
                'INFO',
                after.dentistId,
            ),
        ]);
    }

    private async notifyIfCancelled(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
        if (before.status === AppointmentStatus.CANCELLED || after.status !== AppointmentStatus.CANCELLED) return;
        const dateStr = new Date(after.date).toLocaleString('pt-BR');
        await this.notificationsService.create(
            `O agendamento com ${after.patient?.name ?? 'Paciente'} em ${dateStr} foi cancelado.`,
            clinicId,
            'WARNING',
            after.dentistId,
        );
    }

    async checkAvailability(clinicId: number, dentistId: number, date: string, duration: number, excludeId?: number, patientId?: number): Promise<{ available: boolean }> {
        try {
            await this.checkConflict(new Date(date), duration, clinicId, dentistId, patientId, excludeId);
            return { available: true };
        } catch (e) {
            return { available: false };
        }
    }

    private async checkConflict(startDate: Date, duration: number, clinicId: number, dentistId?: number, patientId?: number, excludeId?: number): Promise<void> {
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const query = this.appointmentsRepository.createQueryBuilder('appointment')
            .where('appointment.clinicId = :clinicId', { clinicId })
            .andWhere('appointment.status NOT IN (:...badStatus)', { badStatus: [AppointmentStatus.CANCELLED] })
            .andWhere('appointment.date < :endDate', { endDate })
            .andWhere("appointment.date + (appointment.duration * interval '1 minute') > :startDate", { startDate });

        if (dentistId && patientId) {
            query.andWhere(new Brackets(qb => {
                qb.where('appointment.dentistId = :dentistId', { dentistId })
                    .orWhere('appointment.patientId = :patientId', { patientId });
            }));
        } else if (dentistId) {
            query.andWhere('appointment.dentistId = :dentistId', { dentistId });
        } else if (patientId) {
            query.andWhere('appointment.patientId = :patientId', { patientId });
        }

        if (excludeId) {
            query.andWhere('appointment.id != :excludeId', { excludeId });
        }

        const conflict = await query.getOne();

        if (conflict) {
            console.log('CONFLICT DETECTED:', conflict, 'START_DATE:', startDate, 'END_DATE:', endDate);
            if (conflict.dentistId === dentistId) {
                throw new BadRequestException('Dentist has a conflicting appointment at this time');
            } else {
                throw new BadRequestException('Patient has a conflicting appointment at this time');
            }
        }
    }

    async remove(id: number, clinicId: number): Promise<void> {
        await this.appointmentsRepository.update({ id, clinicId }, { status: AppointmentStatus.CANCELLED });
    }

    async getAvailableSlots(clinicId: number, dentistId: number, dateStr: string, duration: number = 30, patientId?: number): Promise<string[]> {
        // Parse the date to get start and end of day in local time
        // Removing 'Z' makes new Date() parse it as local time.
        const startOfDay = new Date(`${dateStr}T00:00:00.000`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999`);

        // Fetch all non-cancelled appointments for this dentist on this day
        const query = this.appointmentsRepository.createQueryBuilder('appointment')
            .where('appointment.clinicId = :clinicId', { clinicId })
            .andWhere('appointment.status NOT IN (:...badStatus)', { badStatus: [AppointmentStatus.CANCELLED] })
            .andWhere('appointment.date BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay });

        if (patientId) {
            query.andWhere(new Brackets(qb => {
                qb.where('appointment.dentistId = :dentistId', { dentistId })
                    .orWhere('appointment.patientId = :patientId', { patientId });
            }));
        } else {
            query.andWhere('appointment.dentistId = :dentistId', { dentistId });
        }

        const appointments = await query.orderBy('appointment.date', 'ASC').getMany();

        // System business hours: 08:00 to 19:00 local time
        const workingHourStart = 8;
        const workingHourEnd = 19;

        const availableSlots: string[] = [];

        let currentSlotTime = new Date(startOfDay);
        currentSlotTime.setHours(workingHourStart, 0, 0, 0);

        const endOfWorkingDay = new Date(startOfDay);
        endOfWorkingDay.setHours(workingHourEnd, 0, 0, 0);

        const now = new Date();
        const isToday = now.getFullYear() === startOfDay.getFullYear() &&
            now.getMonth() === startOfDay.getMonth() &&
            now.getDate() === startOfDay.getDate();

        // If the requested date is strictly before today (local), all slots are in the past
        const isPastDay = startOfDay.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        while (currentSlotTime < endOfWorkingDay) {
            const slotStart = new Date(currentSlotTime);
            const slotEnd = new Date(slotStart.getTime() + duration * 60000); // add duration in ms

            // Check if this slot exceeds working hours
            if (slotEnd > endOfWorkingDay) {
                break;
            }

            // Check for conflict with existing appointments
            let hasConflict = false;
            for (const appt of appointments) {
                const apptStart = new Date(appt.date);
                const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000);

                if (slotStart < apptEnd && slotEnd > apptStart) {
                    hasConflict = true;
                    break;
                }
            }

            let isPast = false;
            if (isPastDay) {
                isPast = true;
            } else if (isToday) {
                const slotHour = slotStart.getHours();
                const slotMinute = slotStart.getMinutes();
                if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                    isPast = true;
                }
            }

            if (!hasConflict && !isPast) {
                // format as HH:mm
                const hours = slotStart.getHours().toString().padStart(2, '0');
                const minutes = slotStart.getMinutes().toString().padStart(2, '0');
                availableSlots.push(`${hours}:${minutes}`);
            }

            // Advance slot time by 30 mins
            currentSlotTime.setTime(currentSlotTime.getTime() + 30 * 60000);
        }

        return availableSlots;
    }
}
