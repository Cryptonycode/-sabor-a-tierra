import { supabaseAdmin } from '../config/supabase';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export type SupportedMime = 'image/jpeg' | 'image/png' | 'image/webp';

interface UploadImageOptions {
  bucket: string;
  fileBuffer: Buffer;
  originalName: string;
  mimeType: SupportedMime;
  folder?: string;
  convertToWebp?: boolean;
}

export class StorageService {
  static sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-_\.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$|^\.+|\.+$/g, '');
  }

  static async uploadImage(options: UploadImageOptions): Promise<{ path: string; publicUrl?: string }> {
    const { bucket, fileBuffer, originalName, mimeType, folder, convertToWebp = true } = options;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      throw new Error('Tipo de imagen no soportado');
    }

    const id = uuidv4();
    const baseName = this.sanitizeName(originalName.split('.').slice(0, -1).join('.') || 'image');

    // helper para subir con un buffer y extensión
    const doUpload = async (buffer: Buffer, ext: string) => {
      const fileName = `${baseName}-${id}.${ext}`;
      const path = folder ? `${folder}/${fileName}` : fileName;

      const arrBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );

      const { error } = await supabaseAdmin.storage.from(bucket).upload(path, arrBuffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });
      if (error) {
        throw new Error(error.message);
      }
      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
      return { path, publicUrl: data.publicUrl };
    };

    // Intento 1: convertir a webp
    if (convertToWebp) {
      try {
        const webpBuffer = await sharp(fileBuffer).webp({ quality: 85 }).toBuffer();
        return await doUpload(webpBuffer, 'webp');
      } catch (err) {
        console.warn('Fallo al convertir/subir a WebP, probando original:', (err as Error).message);
        // continúa al fallback
      }
    }

    // Intento 2: subir el original con su extensión
    const originalExt = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpeg';
    try {
      return await doUpload(fileBuffer, originalExt);
    } catch (err) {
      throw new Error(`Error subiendo imagen: ${(err as Error).message}`);
    }
  }

  static async moveObject(fromBucket: string, fromPath: string, toBucket: string, toPath: string): Promise<void> {
    // Descargar
    const { data: file, error: downloadError } = await supabaseAdmin.storage.from(fromBucket).download(fromPath);
    if (downloadError) {
      throw new Error(`No se pudo descargar archivo: ${downloadError.message}`);
    }
    const arrayBuffer = await file.arrayBuffer();

    // Subir a destino
    const { error: uploadError } = await supabaseAdmin.storage.from(toBucket).upload(toPath, Buffer.from(arrayBuffer), {
      upsert: true,
    });
    if (uploadError) {
      throw new Error(`No se pudo mover archivo (subir a destino): ${uploadError.message}`);
    }

    // Borrar origen
    const { error: removeError } = await supabaseAdmin.storage.from(fromBucket).remove([fromPath]);
    if (removeError) {
      throw new Error(`No se pudo borrar archivo de origen: ${removeError.message}`);
    }
  }

  static async removeObject(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`No se pudo borrar archivo: ${error.message}`);
    }
  }

  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

export default StorageService;


