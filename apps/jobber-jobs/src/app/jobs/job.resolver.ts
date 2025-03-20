import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Job } from './models/job.model';
import { JobService } from './job.service';
import { ExecuteJobInput } from './dto/execute-job.input';

@Resolver()
export class JobResolver {
    constructor(private readonly jobService: JobService) {}
    @Query(() => [Job], { name: 'jobs' })
    async getJobs() {
        return this.jobService.getJobs();
    }

    @Mutation(() => Job)
    async executeJob(
        @Args('executeJobInput') executeJobInput: ExecuteJobInput
    ) {
        return this.jobService.executeJob(executeJobInput.name);
    }
}
