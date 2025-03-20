import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class GqlAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        const gqlCtx = GqlExecutionContext.create(context);
        return gqlCtx.getContext().req;
    }
}
