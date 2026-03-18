import { BadRequestException } from '@nestjs/common';

/**
 * Extracts the clinicId from the X-Clinic-Id header.
 * All tenant-scoped endpoints must use this instead of req.user.clinicId.
 */
export function getClinicId(req: any): number {
    const raw = req.headers['x-clinic-id'];
    const clinicId = Number(raw);
    if (!raw || isNaN(clinicId)) {
        throw new BadRequestException('Missing or invalid X-Clinic-Id header');
    }
    return clinicId;
}
