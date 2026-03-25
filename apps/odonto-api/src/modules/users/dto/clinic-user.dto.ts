import { ApiProperty } from '@nestjs/swagger';

export class ClinicUserDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty({ nullable: true, type: String })
    avatarUrl: string | null;
}
