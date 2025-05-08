import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { SocketIoInstrumentation } from '@opentelemetry/instrumentation-socket.io';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Create OpenTelemetry SDK
export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'twinkiesdraw-server',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
    }),
    exportIntervalMillis: 60000, // 1 minute
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable specific instrumentations if needed
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
    new ExpressInstrumentation(),
    new HttpInstrumentation(),
    new RedisInstrumentation(),
    new SocketIoInstrumentation(),
  ],
});

// Initialize OpenTelemetry
export const initOpenTelemetry = () => {
  // Start the SDK
  otelSDK.start()
    .then(() => console.log('OpenTelemetry initialized'))
    .catch((error) => console.error('Error initializing OpenTelemetry', error));

  // Graceful shutdown
  process.on('SIGTERM', () => {
    otelSDK.shutdown()
      .then(() => console.log('OpenTelemetry SDK shut down'))
      .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });
};

export default initOpenTelemetry;