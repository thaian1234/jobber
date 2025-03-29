import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Job } from './models/job.model';
import { JobService } from './job.service';
import { ExecuteJobInput } from './dto/execute-job.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@jobber/nestjs';

@Resolver()
export class JobResolver {
    constructor(private readonly jobService: JobService) {}
    @Query(() => [Job], { name: 'jobs' })
    @UseGuards(GqlAuthGuard)
    async getJobs() {
        return this.jobService.getJobs();
    }

    @Mutation(() => Job)
    @UseGuards(GqlAuthGuard)
    async executeJob(
        @Args('executeJobInput') executeJobInput: ExecuteJobInput
    ) {
        return this.jobService.executeJob(executeJobInput.name);
    }
}
