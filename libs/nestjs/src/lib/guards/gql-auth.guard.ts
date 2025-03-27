import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';

import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, Observable, of } from 'rxjs';

import {
    AUTH_PACKAGE_NAME,
    AUTH_SERVICE_NAME,
    AuthServiceClient,
} from 'types/proto/auth';

@Injectable()
export class GqlAuthGuard implements CanActivate, OnModuleInit {
    private readonly logger = new Logger(GqlAuthGuard.name);
    private authService: AuthServiceClient;
    constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const token = this.getRequest(context).cookies?.Authentication;

        if (!token) {
            return false;
        }

        return this.authService
            .authenticate({
                token: token,
            })
            .pipe(
                map((res) => {
                    this.getRequest(context).user = res;
                    return true;
                }),
                catchError((err) => {
                    this.logger.error(err);
                    return of(false);
                })
            );
    }

    onModuleInit() {
        this.authService =
            this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    }

    private getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
}
