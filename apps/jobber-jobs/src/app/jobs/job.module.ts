import { Module } from '@nestjs/common';
import { FibonacciJob } from './fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobService } from './job.service';
import { JobResolver } from './job.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AUTH_PACKAGE_NAME } from 'types/proto/auth';
import { join } from 'path';
import { KafkaModule } from '@jobber/kafka';

@Module({
    imports: [
        DiscoveryModule,
        KafkaModule.register(),
        ClientsModule.register([
            {
                name: AUTH_PACKAGE_NAME,
                transport: Transport.GRPC,
                options: {
                    package: AUTH_PACKAGE_NAME,
                    protoPath: join(__dirname, 'proto/auth.proto'),
                },
            },
        ]),
    ],
    providers: [FibonacciJob, JobService, JobResolver],
})
export class JobModule {}
