import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { promises as fs, createReadStream, createWriteStream } from 'fs';
import { dirname, join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const LOCAL_UPLOAD_PREFIX = '/objects/uploads/';

type LocalObject = {
  objectId: string;
  filePath: string;
};

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private localRoot(): string {
    return process.env.MEDIA_STORAGE_DIR || join(process.cwd(), 'data', 'uploads');
  }

  private localPath(objectId: string): string {
    if (!/^[a-zA-Z0-9-]+$/.test(objectId)) {
      throw new ObjectNotFoundError();
    }
    return join(this.localRoot(), objectId);
  }

  private tokenFor(objectId: string, size: number, contentType: string): string {
    return createHmac('sha256', process.env.SESSION_SECRET || 'tqp-local-storage')
      .update(`${objectId}:${size}:${contentType}`)
      .digest('hex');
  }

  private verifyToken(
    objectId: string,
    size: number,
    contentType: string,
    token: string,
  ): boolean {
    const expected = Buffer.from(this.tokenFor(objectId, size, contentType));
    const actual = Buffer.from(token);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  async createUpload(
    size: number,
    contentType: string,
  ): Promise<{ uploadURL: string; objectPath: string }> {
    const objectId = randomUUID();
    const token = this.tokenFor(objectId, size, contentType);
    return {
      uploadURL: `/api/storage/uploads/direct/${objectId}?token=${token}&size=${size}&contentType=${encodeURIComponent(contentType)}`,
      objectPath: `${LOCAL_UPLOAD_PREFIX}${objectId}`,
    };
  }

  async saveLocalUpload(
    objectId: string,
    size: number,
    contentType: string,
    token: string,
    request: NodeJS.ReadableStream,
  ): Promise<void> {
    if (!this.verifyToken(objectId, size, contentType, token)) {
      throw new Error('Invalid upload request');
    }

    const filePath = this.localPath(objectId);
    await fs.mkdir(dirname(filePath), { recursive: true });
    let bytes = 0;
    request.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
    });

    try {
      await pipeline(request, createWriteStream(filePath, { flags: 'wx' }));
      if (bytes !== size) {
        await fs.unlink(filePath).catch(() => undefined);
        throw new Error('Uploaded file size does not match the requested size');
      }
      await fs.writeFile(
        `${filePath}.json`,
        JSON.stringify({ contentType, size }),
        'utf8',
      );
    } catch (error) {
      await fs.unlink(filePath).catch(() => undefined);
      throw error;
    }
  }

  async searchPublicObject(filePath: string): Promise<LocalObject | null> {
    try {
      return await this.getObjectEntityFile(`/objects/${filePath}`);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) return null;
      throw error;
    }
  }

  async getObjectEntityFile(objectPath: string): Promise<LocalObject> {
    if (!objectPath.startsWith('/objects/')) {
      throw new ObjectNotFoundError();
    }
    const objectId = objectPath.slice('/objects/'.length).split('/').pop();
    if (!objectId) throw new ObjectNotFoundError();

    const filePath = this.localPath(objectId);
    await fs.access(filePath).catch(() => {
      throw new ObjectNotFoundError();
    });
    return { objectId, filePath };
  }

  async downloadObject(
    object: LocalObject,
    cacheTtlSec = 3600,
  ): Promise<Response> {
    const metadata = JSON.parse(
      await fs.readFile(`${object.filePath}.json`, 'utf8').catch(() => '{}'),
    ) as { contentType?: string; size?: number };
    const headers: Record<string, string> = {
      'Content-Type': metadata.contentType || 'application/octet-stream',
      'Cache-Control': `public, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) headers['Content-Length'] = String(metadata.size);
    return new Response(
      Readable.toWeb(createReadStream(object.filePath)) as ReadableStream,
      { headers },
    );
  }

  /**
   * Delete an uploaded object by its normalized path (e.g. /objects/uploads/<uuid>).
   * Silently succeeds if the object does not exist.
   */
  async deleteObjectEntity(normalizedPath: string): Promise<void> {
    if (!normalizedPath.startsWith('/objects/')) {
      return;
    }

    try {
      const object = await this.getObjectEntityFile(normalizedPath);
      await fs.unlink(object.filePath).catch(() => undefined);
      await fs.unlink(`${object.filePath}.json`).catch(() => undefined);
    } catch (error) {
      if (!(error instanceof ObjectNotFoundError)) {
        console.warn(`[objectStorage] Failed to delete object at ${normalizedPath}`, error);
      }
    }
  }
}
