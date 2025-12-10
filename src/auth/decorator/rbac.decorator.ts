import { Reflector } from '@nestjs/core';
import { Role } from '../../users/entities/user.entity';

export const RBAC = Reflector.createDecorator<Role>();
