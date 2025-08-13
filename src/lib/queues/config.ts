import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

// Create Redis connection for BullMQ
// BullMQ requires ioredis, not @upstash/redis
// Use REDIS_URL (connection string) instead of UPSTASH_REDIS_REST_URL (REST API)
const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Queue names
export const QUEUE_NAMES = {
  brandMonitoring: 'brand-monitoring',
  emailReports: 'email-reports',
  llmQueries: 'llm-queries',
  dataProcessing: 'data-processing',
} as const;

// Create queues
export const queues = {
  brandMonitoring: new Queue(QUEUE_NAMES.brandMonitoring, { connection }),
  emailReports: new Queue(QUEUE_NAMES.emailReports, { connection }),
  llmQueries: new Queue(QUEUE_NAMES.llmQueries, { connection }),
  dataProcessing: new Queue(QUEUE_NAMES.dataProcessing, { connection }),
};

// Queue events for monitoring
export const queueEvents = {
  brandMonitoring: new QueueEvents(QUEUE_NAMES.brandMonitoring, { connection }),
  emailReports: new QueueEvents(QUEUE_NAMES.emailReports, { connection }),
  llmQueries: new QueueEvents(QUEUE_NAMES.llmQueries, { connection }),
  dataProcessing: new QueueEvents(QUEUE_NAMES.dataProcessing, { connection }),
};

// Common job options
export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 3600, // 24 hours
    count: 100,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // 7 days
  },
} as const;

// Helper to add jobs with default options
export async function addJob<T = any>(
  queue: Queue,
  name: string,
  data: T,
  options = {}
) {
  return queue.add(name, data, {
    ...defaultJobOptions,
    ...options,
  });
}

// Helper to schedule recurring jobs
export async function scheduleRecurringJob<T = any>(
  queue: Queue,
  name: string,
  data: T,
  pattern: string, // Cron pattern
  options = {}
) {
  return queue.add(name, data, {
    ...defaultJobOptions,
    repeat: {
      pattern,
      tz: 'America/New_York',
    },
    ...options,
  });
}