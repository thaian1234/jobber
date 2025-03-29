import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaClient } from './kafka.client';

@Module({})
export class KafkaModule {
    static register(): DynamicModule {
        return {
            module: KafkaModule,
            imports: [ConfigModule],
            providers: [KafkaClient],
            exports: [KafkaClient],
        };
    }
}
