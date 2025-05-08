import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// Upload file to S3
export const uploadToS3 = async (
  bucketName: string,
  key: string,
  body: Buffer | string,
  contentType: string
) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    const response = await s3Client.send(command);
    console.log('File uploaded to S3:', response);
    return response;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Get file from S3
export const getFromS3 = async (bucketName: string, key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw error;
  }
};

// Delete file from S3
export const deleteFromS3 = async (bucketName: string, key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    console.log('File deleted from S3:', response);
    return response;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

// List files in S3 bucket
export const listS3Files = async (bucketName: string, prefix?: string) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files in S3:', error);
    throw error;
  }
};

// Generate presigned URL for S3 object
export const generatePresignedUrl = async (
  bucketName: string,
  key: string,
  expiresIn: number = 3600
) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

// Upload drawing to S3
export const uploadDrawing = async (
  userId: string,
  drawingId: string,
  imageData: string,
  metadata: Record<string, any>
) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'twinkiesdraw-assets';
  const key = `drawings/${userId}/${drawingId}.png`;
  
  // Convert base64 image data to buffer
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Upload image
  await uploadToS3(bucketName, key, buffer, 'image/png');
  
  // Upload metadata
  const metadataKey = `drawings/${userId}/${drawingId}.json`;
  await uploadToS3(
    bucketName,
    metadataKey,
    JSON.stringify(metadata),
    'application/json'
  );
  
  // Generate presigned URL for the image
  const url = await generatePresignedUrl(bucketName, key);
  
  return {
    url,
    key,
    metadataKey,
  };
};