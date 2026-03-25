import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserInvitation } from './entities/user-invitation.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicMembership } from '../clinics/entities/clinic-membership.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserInvitation, PendingRegistration, Clinic, ClinicMembership])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule { }
