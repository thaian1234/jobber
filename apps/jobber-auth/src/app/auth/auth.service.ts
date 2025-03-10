import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService) {}
    async login(loginInput: LoginInput, res: Response) {
        const user = await this.verifyUser(
            loginInput.email,
            loginInput.password
        );
    }

    async verifyUser(email: string, password: string) {
        try {
            const user = await this.userService.getUser({
                email,
            });
            const authenticated = await compare(password, user.password);
            if (!authenticated) {
                throw new UnauthorizedException();
            }
            return user;
        } catch (err) {
            throw new UnauthorizedException('Credentials are not valid');
        }
    }
}
