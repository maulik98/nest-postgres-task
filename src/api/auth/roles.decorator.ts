import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'src/utils/constants';

export const Roles = (...roles: ROLES[]) => SetMetadata('roles', roles);
