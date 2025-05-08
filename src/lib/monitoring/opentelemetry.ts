'use client';

import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';

// Initialize OpenTelemetry
export const initOpenTelemetry = () => {
  // Only initialize in browser environment
  if (typeof window === 'undefined') return;

  const exporter = new OTLPTraceExporter({
    url: process.env.NEXT_PUBLIC_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  });

  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'twinkiesdraw-frontend',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    }),
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  // Initialize the provider
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        ignoreUrls: [/localhost:4318/], // Ignore telemetry server itself
        propagateTraceHeaderCorsUrls: [
          new RegExp(`${process.env.NEXT_PUBLIC_API_URL}/.*`),
        ],
      }),
      new UserInteractionInstrumentation(),
    ],
  });

  console.log('OpenTelemetry initialized');
};

// Create a tracer
export const tracer = trace.getTracer('twinkiesdraw-tracer');

// Create a span
export const createSpan = (name: string, fn: () => Promise<any> | any) => {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

// Add attributes to current span
export const addSpanAttributes = (attributes: Record<string, string | number | boolean>) => {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    Object.entries(attributes).forEach(([key, value]) => {
      currentSpan.setAttribute(key, value);
    });
  }
};

// Record error in current span
export const recordSpanError = (error: Error) => {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    currentSpan.recordException(error);
    currentSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  }
};