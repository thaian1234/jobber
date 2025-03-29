import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KafkaClient implements OnModuleDestroy, OnModuleInit {
    private readonly logger = new Logger(KafkaClient.name);
    private readonly client: ClientKafka;

    constructor(private readonly configService: ConfigService) {
        this.client = new ClientKafka({
            client: {
                clientId: this.configService.get<string>(
                    'KAFKA_CLIENT_ID',
                    'jobber-client'
                ),
                brokers: this.configService
                    .get<string>('KAFKA_BROKERS', 'localhost:9092')
                    .split(','),
                ssl: this.configService.get<boolean>('KAFKA_SSL', false),
                retry: {
                    initialRetryTime: 300,
                    retries: 5,
                },
            },
            consumer: {
                groupId: this.configService.get<string>(
                    'KAFKA_GROUP_ID',
                    'jobber-consumer-group'
                ),
                allowAutoTopicCreation: true,
            },
            producer: {
                allowAutoTopicCreation: true,
            },
        });
    }
    async onModuleInit() {
        // Connect to the broker when the module initializes
        await this.client.connect();
        this.logger.log('Kafka client connected successfully');
    }

    onModuleDestroy() {
        // Close the connection when the module is destroyed
        this.client.close();
        this.logger.log('Kafka client disconnected');
    }
    /**
     * Emit an event to a Kafka topic
     * @param topic The Kafka topic
     * @param message The message payload
     */
    async emit<T>(topic: string, message: T): Promise<void> {
        try {
            await firstValueFrom(this.client.emit<T>(topic, message));
            this.logger.debug(`Message sent to topic: ${topic}`);
        } catch (error) {
            this.logger.error(
                `Failed to emit message to topic ${topic}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Send a message and wait for the response
     * @param pattern The message pattern
     * @param data The message payload
     * @returns Observable with the response
     */
    send<TRequest, TResponse>(pattern: string, data: TRequest) {
        return this.client.send<TResponse, TRequest>(pattern, data);
    }

    /**
     * Subscribe to a Kafka topic
     * @param topics Array of topics to subscribe to
     */
    async subscribe(topics: string[]): Promise<void> {
        try {
            for (const topic of topics) {
                this.client.subscribeToResponseOf(topic);
                this.logger.debug(`Subscribed to topic: ${topic}`);
            }
        } catch (error) {
            this.logger.error('Failed to subscribe to topics:', error);
            throw error;
        }
    }

    /**
     * Get the underlying Kafka client instance
     */
    getClient(): ClientKafka {
        return this.client;
    }
}
