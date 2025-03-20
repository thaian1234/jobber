import { Module } from '@nestjs/common';
import { FibonacciJob } from './fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobService } from './job.service';
import { JobResolver } from './job.resolver';

@Module({
    imports: [DiscoveryModule],
    providers: [FibonacciJob, JobService, JobResolver],
})
export class JobModule {}
