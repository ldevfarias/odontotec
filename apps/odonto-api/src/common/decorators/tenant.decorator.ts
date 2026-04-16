import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const raw = request.headers['x-clinic-id'];
    const clinicId = Number(raw);
    if (!raw || isNaN(clinicId)) {
      throw new BadRequestException('Missing or invalid X-Clinic-Id header');
    }
    return clinicId;
  },
);
