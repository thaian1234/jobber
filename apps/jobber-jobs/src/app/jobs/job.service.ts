import {
    DiscoveredClassWithMeta,
    DiscoveryService,
} from '@golevelup/nestjs-discovery';
import {
    BadRequestException,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { JOB_METADATA_KEY } from '../decorators/job.decorators';
import { JobMetadata } from '../interfaces/job-metadata.interface';
import { AbstractJob } from './abstract.job';
import { KafkaClient } from '@jobber/kafka';

@Injectable()
export class JobService implements OnModuleInit {
    private jobs: DiscoveredClassWithMeta<JobMetadata>[] = [];
    private readonly logger = new Logger(JobService.name);

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly kafkaClient: KafkaClient
    ) {}

    async onModuleInit() {
        this.jobs =
            await this.discoveryService.providersWithMetaAtKey<JobMetadata>(
                JOB_METADATA_KEY
            );
    }

    getJobs() {
        return this.jobs.map((job) => job.meta);
    }
    async executeJob(name: string, data: object = {}) {
        const job = this.jobs.find((job) => job.meta.name === name);
        if (!job) {
            const error = `Job ${name} does not exist.`;
            // Publish error to Kafka
            await this.kafkaClient.emit('job.error', {
                name,
                error,
                timestamp: new Date().toISOString(),
            });
            throw new BadRequestException(`Job ${name} does not exist.`);
        }
        await this.kafkaClient.emit('job.queued', {
            name: job.meta.name,
            timestamp: new Date().toISOString(),
            data,
        });
        // Execute the job
        const result = await (
            job.discoveredClass.instance as AbstractJob
        ).execute(data, job.meta.name);

        return { ...job.meta, result };
    }
}
