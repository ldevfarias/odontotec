import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    message: string,
    clinicId: number,
    type: string = 'INFO',
    userId?: number,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      message,
      clinicId,
      type,
      userId,
    });
    return this.notificationsRepository.save(notification);
  }

  async findAll(
    clinicId: number,
    userId?: number,
    role?: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponseDto<Notification>> {
    const query = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.clinicId = :clinicId', { clinicId });

    if (role === 'DENTIST' && userId) {
      // Dentists see common notifications (userId is null) AND their specific ones
      query.andWhere(
        '(notification.userId IS NULL OR notification.userId = :userId)',
        { userId },
      );
    } else if (role === 'ADMIN') {
      // Admins see everything? Or should they just see general + theirs?
      // Let's assume ADMIN sees everything for now to monitor the clinic.
    }

    const [data, total] = await query
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async markAsRead(id: number, clinicId: number): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, clinicId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    await this.notificationsRepository.update(id, { read: true });
  }

  async markAllAsRead(clinicId: number): Promise<void> {
    await this.notificationsRepository.update(
      { clinicId, read: false },
      { read: true },
    );
  }
}
