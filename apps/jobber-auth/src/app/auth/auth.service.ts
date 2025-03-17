import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './dto/token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {}
    async login(loginInput: LoginInput, res: Response) {
        const user = await this.verifyUser(
            loginInput.email,
            loginInput.password
        );
        const expires = new Date();
        expires.setMilliseconds(
            expires.getTime() +
                parseInt(
                    this.configService.getOrThrow<string>('JWT_EXPIRATION_MS')
                )
        );
        const tokenPayload: TokenPayload = {
            userId: user.id,
        };
        const accessToken = this.jwtService.sign(tokenPayload);
        res.cookie('Authentication', accessToken, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            expires,
        });
        return user;
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
            console.error(err);
            throw new UnauthorizedException('Credentials are not valid');
        }
    }
}
