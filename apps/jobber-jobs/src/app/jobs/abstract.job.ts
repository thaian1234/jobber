import { KafkaClient } from '@jobber/kafka';
import { Logger } from '@nestjs/common';

export abstract class AbstractJob {
    protected readonly logger = new Logger(this.constructor.name);
    constructor(private readonly kafkaClient: KafkaClient) {}
    async execute(data: object, jobName: string) {
        try {
            await this.kafkaClient.emit('job.started', {
                name: jobName,
                timestamp: new Date().toISOString(),
                data,
            });
            this.logger.log(`Starting job execution: ${jobName}`);

            const result = await this.process(data);
            await this.kafkaClient.emit('job.completed', {
                name: jobName,
                timestamp: new Date().toISOString(),
                result,
                data,
            });

            this.logger.log(`Job execution completed: ${jobName}`);
        } catch (error) {
            // Emit job failed event
            await this.kafkaClient.emit('job.failed', {
                name: jobName,
                timestamp: new Date().toISOString(),
                error: error.message,
                data,
            });

            this.logger.error(`Job execution failed: ${jobName}`, error.stack);
            throw error;
        }
    }

    protected abstract process(data: object): Promise<any>;
}
