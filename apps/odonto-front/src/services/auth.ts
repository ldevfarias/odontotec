import { api } from '@/lib/api';
import { RegisterTenantDto } from '@/generated/ts/RegisterTenantDto';

export interface ClinicInfo {
    id: number;
    name: string;
    role: string;
}

export interface RegisterTenantResponse {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        clinicName?: string;
    };
    clinics?: ClinicInfo[];
    access_token: string;
    refresh_token: string;
}

export const registerTenant = async (data: RegisterTenantDto): Promise<RegisterTenantResponse> => {
    const response = await api.post<RegisterTenantResponse>('/auth/register-tenant', data);
    return response.data;
};

export interface InitiateRegistrationDto {
    name: string;
    email: string;
}

export interface InitiateRegistrationResponse {
    message: string;
    devToken?: string;
}

export const initiateRegistration = async (data: InitiateRegistrationDto): Promise<InitiateRegistrationResponse> => {
    const response = await api.post<InitiateRegistrationResponse>('/auth/initiate-registration', data);
    return response.data;
};

export interface VerifyEmailDto {
    token: string;
    password: string;
    confirmPassword: string;
}

export const verifyEmail = async (data: VerifyEmailDto): Promise<RegisterTenantResponse> => {
    const response = await api.post<RegisterTenantResponse>('/auth/verify-email', data);
    return response.data;
};

export interface CompleteClinicDto {
    clinicName: string;
    clinicPhone?: string;
    clinicAddress?: string;
}

export interface CompleteClinicResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    clinics: ClinicInfo[];
}

export const completeClinicSetup = async (data: CompleteClinicDto): Promise<CompleteClinicResponse> => {
    const response = await api.post<CompleteClinicResponse>('/auth/complete-clinic', data);
    return response.data;
};

export const acceptTerms = async (): Promise<void> => {
    await api.post('/users/me/accept-terms');
};
