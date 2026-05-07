import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { TreatmentPlansModule } from './modules/treatment-plans/treatment-plans.module';
import { EmailModule } from './modules/email/email.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { ClinicMembershipGuard } from './common/guards/clinic-membership.guard';
import { ClinicProceduresModule } from './modules/clinic-procedures/clinic-procedures.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { StorageModule } from './common/providers/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        const password = configService.get<string>('POSTGRES_PASSWORD');

        if (isProd && !password) {
          throw new Error(
            'FATAL SECURITY ERROR: POSTGRES_PASSWORD is required in production environments to prevent fallback vulnerabilities.',
          );
        }

        return {
          type: 'postgres',
          host:
            configService.get<string>('POSTGRES_HOST') ||
            configService.get<string>('PGHOST') ||
            'localhost',
          port:
            configService.get<number>('POSTGRES_PORT') ||
            configService.get<number>('PGPORT') ||
            5434,
          username:
            configService.get<string>('POSTGRES_USER') ||
            configService.get<string>('PGUSER') ||
            'postgres',
          password: password || 'postgres_password',
          database:
            configService.get<string>('POSTGRES_DB') ||
            configService.get<string>('PGDATABASE') ||
            'odonto_tec',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: !isProd,
          migrationsRun: false,
          migrationsTableName: 'typeorm_migrations',
          ssl: isProd && configService.get<string>('POSTGRES_SSL') !== 'false' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    ClinicsModule,
    UsersModule,
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    TreatmentPlansModule,
    ClinicProceduresModule,
    DashboardModule,
    DocumentsModule,
    EmailModule,
    NotificationsModule,
    SubscriptionModule,
    BudgetsModule,
    StorageModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // Increased to 100 to prevent 429 errors from normal usage
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClinicMembershipGuard,
    },
  ],
})
export class AppModule {}
