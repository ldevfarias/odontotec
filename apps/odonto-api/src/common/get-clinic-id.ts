import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export function getClinicId(req: Request): number {
  const raw = req.headers['x-clinic-id'];
  const clinicId = Number(raw);
  if (!raw || isNaN(clinicId)) {
    throw new BadRequestException('Missing or invalid X-Clinic-Id header');
  }
  return clinicId;
}
