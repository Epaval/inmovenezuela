import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'dummy_public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'dummy_private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy',
});

export async function uploadImage(
  file: string,
  fileName: string,
  folder = '/inmovenezuela'
): Promise<{ url: string; publicId: string; fileId: string }> {
  // Si no hay claves reales, devolvemos una URL falsa para que el desarrollo no se detenga
  if (!process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY === '') {
    console.warn('⚠️ ImageKit no configurado. Usando URL de prueba.');
    return {
      url: `https://ejemplo.com/${fileName}`,
      publicId: `/inmovenezuela/${fileName}`,
      fileId: 'file_dummy_id',
    };
  }

  const response = await imagekit.upload({
    file,
    fileName,
    folder,
    useUniqueFileName: true,
    responseFields: ['url', 'fileId'],
  });

  return {
    url: response.url,
    publicId: response.filePath,
    fileId: response.fileId,
  };
}

export async function deleteImage(fileId: string): Promise<void> {
  if (!process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY === '') return;
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('Error al eliminar imagen de ImageKit:', error);
  }
}