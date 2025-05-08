import {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetDistributionCommand,
  UpdateDistributionCommand,
} from '@aws-sdk/client-cloudfront';

// Initialize CloudFront client
const cloudFrontClient = new CloudFrontClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Create CloudFront invalidation
export const createInvalidation = async (
  distributionId: string,
  paths: string[] = ['/*']
) => {
  try {
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    });
    const response = await cloudFrontClient.send(command);
    console.log('CloudFront invalidation created:', response);
    return response;
  } catch (error) {
    console.error('Error creating CloudFront invalidation:', error);
    throw error;
  }
};

// Get CloudFront distribution
export const getDistribution = async (distributionId: string) => {
  try {
    const command = new GetDistributionCommand({
      Id: distributionId,
    });
    const response = await cloudFrontClient.send(command);
    return response.Distribution;
  } catch (error) {
    console.error('Error getting CloudFront distribution:', error);
    throw error;
  }
};

// Update CloudFront distribution
export const updateDistribution = async (
  distributionId: string,
  updateFn: (config: any) => any
) => {
  try {
    // Get current distribution config
    const distribution = await getDistribution(distributionId);
    
    if (!distribution || !distribution.DistributionConfig) {
      throw new Error('Distribution not found or invalid');
    }
    
    // Apply updates to the distribution config
    const updatedConfig = updateFn(distribution.DistributionConfig);
    
    // Update the distribution
    const command = new UpdateDistributionCommand({
      Id: distributionId,
      IfMatch: distribution.ETag,
      DistributionConfig: updatedConfig,
    });
    
    const response = await cloudFrontClient.send(command);
    console.log('CloudFront distribution updated:', response);
    return response;
  } catch (error) {
    console.error('Error updating CloudFront distribution:', error);
    throw error;
  }
};

// Add CORS headers to CloudFront distribution
export const addCorsHeaders = async (distributionId: string, origins: string[]) => {
  return updateDistribution(distributionId, (config) => {
    // Update default cache behavior
    if (config.DefaultCacheBehavior) {
      if (!config.DefaultCacheBehavior.ResponseHeadersPolicyId) {
        // Create a new response headers policy if one doesn't exist
        // Note: In a real implementation, you would create a response headers policy first
        console.log('No response headers policy found. You need to create one first.');
      }
    }
    
    return config;
  });
};

// Enable CloudFront logging
export const enableLogging = async (
  distributionId: string,
  bucketName: string,
  prefix: string = 'cloudfront-logs/'
) => {
  return updateDistribution(distributionId, (config) => {
    config.Logging = {
      Enabled: true,
      IncludeCookies: false,
      Bucket: `${bucketName}.s3.amazonaws.com`,
      Prefix: prefix,
    };
    
    return config;
  });
};