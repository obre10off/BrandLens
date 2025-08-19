export * from './config';
export { createBrandMonitoringWorker } from './processors/brand-monitoring';
export { createEmailReportWorker } from './processors/email-reports';

// Helper to start all workers (for development)
export async function startWorkers() {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'Workers should be started in separate processes in production'
    );
    return;
  }

  const { createBrandMonitoringWorker } = await import(
    './processors/brand-monitoring'
  );
  const { createEmailReportWorker } = await import(
    './processors/email-reports'
  );

  const workers = [createBrandMonitoringWorker(), createEmailReportWorker()];

  console.log(
    'Started queue workers:',
    workers.map(w => w.name)
  );

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing workers...');
    await Promise.all(workers.map(w => w.close()));
    process.exit(0);
  });

  return workers;
}
