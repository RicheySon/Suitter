import axios from 'axios';

// Working Walrus testnet endpoints - Updated January 2025
// Publisher: Tudor's endpoint with confirmed CORS support
// Aggregator: Multiple fallback options
const WALRUS_PUBLISHER_URL = 'https://publisher.walrus-01.tududes.com';
const WALRUS_AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space';

// Backup endpoints in case primary fails
const BACKUP_AGGREGATOR_URL = 'https://wal-aggregator-testnet.staketab.org';

export interface WalrusUploadResponse {
  newlyCreated?: {
    blobObject: {
      id: string;
      blobId: string;
    };
  };
  alreadyCertified?: {
    blobId: string;
  };
}

export interface WalrusBlob {
  blobId: string;
  walrusUrl: string;
  originalUrl?: string;
}

export class WalrusService {
  /**
   * Upload a file directly to Walrus
   * @param file The file to upload
   * @param userAddress The user's Sui address to own the resulting blob object
   */
  static async uploadFile(file: File, userAddress?: string): Promise<WalrusBlob> {
    try {
      // Convert file to raw binary data
      const fileData = await file.arrayBuffer();
      
      // Construct URL with send_object_to parameter if userAddress is provided
      let uploadUrl = `${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=5`;
      if (userAddress) {
        uploadUrl += `&send_object_to=${userAddress}`;
      }
      
      const response = await axios.put<WalrusUploadResponse>(
        uploadUrl,
        fileData,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          // Add timeout for large files
          timeout: 60000, // 60 seconds
        }
      );

      // Extract blob ID from response
      const blobId = response.data.newlyCreated?.blobObject.blobId || 
                    response.data.alreadyCertified?.blobId;
      
      if (!blobId) {
        throw new Error('Failed to get blob ID from Walrus response');
      }

      return {
        blobId,
        walrusUrl: this.getBlobUrl(blobId),
      };
    } catch (error) {
      console.error('Walrus upload failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 413) {
          throw new Error('File too large for Walrus publisher (HTTP 413). Max ~5 MB. Please compress or choose a smaller file.');
        }
        // Check for specific error types
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          throw new Error('Network error: Unable to connect to Walrus. Please check your internet connection and try again.');
        }
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Upload timeout: The file is too large or the connection is slow. Please try again.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied: CORS or authentication error. Please contact support.');
        }
        if (error.response?.status === 404) {
          throw new Error('Service unavailable: Walrus endpoint not found. The service may be temporarily down.');
        }
        if (error.response && error.response.status >= 500) {
          throw new Error('Server error: Walrus service is experiencing issues. Please try again later.');
        }
        
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to upload to Walrus: ${message}`);
      }
      throw new Error(`Failed to upload to Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch content from URL and upload to Walrus
   * Note: This method may fail due to CORS restrictions when fetching from external URLs
   * @param url The URL to fetch and upload
   * @param userAddress The user's Sui address to own the resulting blob object
   */
  static async uploadFromUrl(url: string, userAddress?: string): Promise<WalrusBlob> {
    try {
      // First, check if this is already a Walrus URL
      if (this.isWalrusUrl(url)) {
        throw new Error('URL is already stored on Walrus. No need to re-upload.');
      }

      // Try to fetch the content from the URL
      // Note: This will fail for most external URLs due to CORS restrictions
      const response = await axios.get(url, {
        responseType: 'arraybuffer', // Get raw binary data
        timeout: 30000, // 30 second timeout
        // Add headers to potentially help with CORS
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Walrus-NFT-App)',
        },
      });

      // Construct URL with send_object_to parameter if userAddress is provided
      let uploadUrl = `${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=5`;
      if (userAddress) {
        uploadUrl += `&send_object_to=${userAddress}`;
      }

      // Upload raw data to Walrus
      const walrusResponse = await axios.put<WalrusUploadResponse>(
        uploadUrl,
        response.data,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          timeout: 60000, // 60 seconds
        }
      );

      // Extract blob ID from response
      const blobId = walrusResponse.data.newlyCreated?.blobObject.blobId || 
                    walrusResponse.data.alreadyCertified?.blobId;
      
      if (!blobId) {
        throw new Error('Failed to get blob ID from Walrus response');
      }

      return {
        blobId,
        walrusUrl: this.getBlobUrl(blobId),
        originalUrl: url,
      };
    } catch (error) {
      console.error('Failed to upload URL to Walrus:', error);
      if (axios.isAxiosError(error)) {
        // Handle specific CORS and network errors
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          throw new Error(
            'CORS Error: Cannot fetch content from this URL due to browser security restrictions. ' +
            'Please either:\n' +
            '1. Download the image and upload it directly as a file, or\n' +
            '2. Use the URL directly without Walrus storage\n' +
            '3. Ensure the URL allows cross-origin requests'
          );
        }
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Timeout: The URL took too long to respond. Please try a different image or upload directly.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied: The URL requires authentication or blocks automated access.');
        }
        if (error.response?.status === 404) {
          throw new Error('Not found: The URL does not exist or the image has been removed.');
        }
        if (error.response && error.response.status >= 500) {
          throw new Error('Server error: The URL\'s server is experiencing issues. Please try again later.');
        }
        
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch and upload URL: ${message}`);
      }
      throw new Error(`Failed to fetch and upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the public URL for a Walrus blob
   */
  static getBlobUrl(blobId: string): string {
    return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
  }

  /**
   * Check if a blob is available (certified) for reading
   */
  static async checkBlobAvailability(blobId: string, maxRetries: number = 3, delayMs: number = 2000): Promise<boolean> {
    const aggregatorUrls = [WALRUS_AGGREGATOR_URL, BACKUP_AGGREGATOR_URL];
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Try both aggregator endpoints
      for (const aggregatorUrl of aggregatorUrls) {
        try {
          const response = await axios.head(`${aggregatorUrl}/v1/blobs/${blobId}`, {
            timeout: 5000,
          });
          if (response.status === 200) {
            return true;
          }
        } catch (error) {
          // Continue to next aggregator or retry
          console.warn(`Failed to check blob availability on ${aggregatorUrl}:`, error);
        }
      }
      
      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    return false;
  }

  /**
   * Wait for blob to become available with progress callback
   */
  static async waitForBlobCertification(
    blobId: string, 
    onProgress?: (message: string) => void,
    maxWaitTimeMs: number = 30000
  ): Promise<boolean> {
    const startTime = Date.now();
    let attempt = 0;
    
    while (Date.now() - startTime < maxWaitTimeMs) {
      attempt++;
      
      if (onProgress) {
        onProgress(`Checking blob certification (attempt ${attempt})...`);
      }
      
      const isAvailable = await this.checkBlobAvailability(blobId, 1);
      if (isAvailable) {
        if (onProgress) {
          onProgress('Blob is now certified and available!');
        }
        return true;
      }
      
      // Wait 3 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    if (onProgress) {
      onProgress('Blob certification is taking longer than expected. The blob should become available soon.');
    }
    return false;
  }

  /**
   * Upload JSON metadata to Walrus
   * @param metadata The metadata object to upload
   * @param userAddress The user's Sui address to own the resulting blob object
   */
  static async uploadMetadata(metadata: any, userAddress?: string): Promise<WalrusBlob> {
    const jsonData = JSON.stringify(metadata, null, 2);
    const encoder = new TextEncoder();
    const binaryData = encoder.encode(jsonData);
    
    try {
      // Construct URL with send_object_to parameter if userAddress is provided
      let uploadUrl = `${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=5`;
      if (userAddress) {
        uploadUrl += `&send_object_to=${userAddress}`;
      }

      const response = await axios.put<WalrusUploadResponse>(
        uploadUrl,
        binaryData,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          timeout: 60000,
        }
      );

      const blobId = response.data.newlyCreated?.blobObject.blobId || 
                    response.data.alreadyCertified?.blobId;
      
      if (!blobId) {
        throw new Error('Failed to get blob ID from Walrus response');
      }

      return {
        blobId,
        walrusUrl: this.getBlobUrl(blobId),
      };
    } catch (error) {
      console.error('Walrus metadata upload failed:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to upload metadata to Walrus: ${message}`);
      }
      throw new Error('Failed to upload metadata to Walrus');
    }
  }

  /**
   * Check if a URL is already a Walrus URL
   */
  static isWalrusUrl(url: string): boolean {
    return url.includes(WALRUS_AGGREGATOR_URL) || url.includes('walrus');
  }

  /**
   * Validate and provide guidance for URL uploads
   * Returns an object with validation result and suggestions
   */
  static validateUrlForUpload(url: string): { isValid: boolean; message: string; suggestions: string[] } {
    try {
      const parsedUrl = new URL(url);
      
      // Check if it's already a Walrus URL
      if (this.isWalrusUrl(url)) {
        return {
          isValid: false,
          message: 'This URL is already stored on Walrus',
          suggestions: ['Use this URL directly without re-uploading to Walrus']
        };
      }

      // Check for common image CDNs that typically support CORS
      const corsKnownDomains = [
        'imgur.com',
        'i.imgur.com',
        'github.com',
        'githubusercontent.com',
        'unsplash.com',
        'images.unsplash.com',
        'pexels.com',
        'images.pexels.com',
        'wikimedia.org',
        'upload.wikimedia.org'
      ];

      const domain = parsedUrl.hostname.toLowerCase();
      const supportsCors = corsKnownDomains.some(knownDomain => 
        domain.includes(knownDomain)
      );

      if (supportsCors) {
        return {
          isValid: true,
          message: 'This URL should work for Walrus upload',
          suggestions: []
        };
      }

      // Check for common domains that typically block CORS
      const blockedDomains = [
        'instagram.com',
        'facebook.com',
        'twitter.com',
        'x.com',
        'tiktok.com',
        'linkedin.com',
        'pinterest.com'
      ];

      const isBlocked = blockedDomains.some(blockedDomain => 
        domain.includes(blockedDomain)
      );

      if (isBlocked) {
        return {
          isValid: false,
          message: 'This domain typically blocks cross-origin requests',
          suggestions: [
            'Right-click the image and "Save image as..." to download it',
            'Then upload the downloaded file directly',
            'Or use the URL directly without Walrus storage'
          ]
        };
      }

      // For unknown domains, provide general guidance
      return {
        isValid: true,
        message: 'URL upload may work but could fail due to CORS restrictions',
        suggestions: [
          'If upload fails, try downloading the image and uploading as a file',
          'Or use the URL directly without Walrus storage'
        ]
      };

    } catch (error) {
      return {
        isValid: false,
        message: 'Invalid URL format',
        suggestions: ['Please enter a valid URL starting with http:// or https://']
      };
    }
  }

  /**
   * Extract filename from URL
   */
  // private static getFilenameFromUrl(url: string): string {
  //   try {
  //     const pathname = new URL(url).pathname;
  //     const filename = pathname.split('/').pop();
  //     return filename || 'file';
  //   } catch {
  //     return 'file';
  //   }
  // }

  /**
   * Check if the Walrus service is available
   */
  static async checkServiceHealth(): Promise<boolean> {
    try {
      await axios.head(WALRUS_PUBLISHER_URL, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
} 