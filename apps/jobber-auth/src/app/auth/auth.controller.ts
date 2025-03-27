import { Controller, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
 
import {
    AuthenticateRequest,
    AuthServiceController,
    AuthServiceControllerMethods,
    User,
} from 'types/proto/auth';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './dto/token-payload.interface';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
    constructor(private readonly userService: UsersService) {}
    @UseGuards(JwtAuthGuard)
    authenticate(
        request: AuthenticateRequest & { user: TokenPayload }
    ): Promise<User> | Observable<User> | User {
        return this.userService.getUser({
            id: request.user.userId,
        });
    }
}
