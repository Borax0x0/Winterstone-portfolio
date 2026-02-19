import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadToS3(file: File, folder: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique key (filename)
    // Sanitize filename
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // ACL: 'public-read', // Note: Modern S3 buckets block public ACLs by default. 
                               // We rely on Bucket Policy or CloudFront for public access.
    });

    await s3Client.send(command);

    // Return the URL
    // Standard S3 URL format: https://BUCKET.s3.REGION.amazonaws.com/KEY
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(imageUrl: string): Promise<void> {
    try {
        // Extract Key from URL
        // URL: https://BUCKET.s3.REGION.amazonaws.com/folder/filename.jpg
        const urlParts = imageUrl.split('.amazonaws.com/');
        if (urlParts.length !== 2) return; // Not an S3 URL
        
        const key = urlParts[1];

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error("Error deleting from S3:", error);
        // We suppress the error because if the file isn't found, it's already "deleted"
    }
}
