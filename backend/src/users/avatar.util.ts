/**
 * @brief Upper bound on a stored avatar, in bytes.
 *
 * Enforced by multer before the buffer is ever assembled. Keep it in sync with
 * `client_max_body_size` in `frontend/nginx.conf.template`, which has to be a
 * little larger to leave room for multipart boundaries and the other fields.
 */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/**
 * @brief Image formats an avatar may be in.
 *
 * SVG is deliberately absent: it is a document that can carry script, and we
 * serve these bytes back from our own origin.
 */
export const allowedAvatarMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

/** Smallest prefix every signature below can be decided on. */
const signatureLength = 12;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

/**
 * @brief Identifies an image by its magic bytes, ignoring whatever the client
 * claimed the type was.
 *
 * A browser's `Content-Type` on a multipart part is derived from the file
 * extension, so it is a claim and not a fact; anything that decides what we
 * later serve back has to come from the bytes themselves.
 *
 * @returns The MIME type, or null if it is not an allowed image.
 */
export function sniffImageMimeType(bytes: Uint8Array): string | null {
  if (bytes.length < signatureLength) {
    return null;
  }

  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  // "GIF87a" or "GIF89a".
  if (
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38]) &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return 'image/gif';
  }

  // "RIFF", then a four-byte length we don't care about, then "WEBP".
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }

  return null;
}

/**
 * @brief Whether a client-declared content type is worth buffering.
 *
 * Deliberately looser than {@link sniffImageMimeType}, which is the real
 * check. A client that can't name the type sends `application/octet-stream` —
 * curl does this for `.webp`, and so does any upload of a file with no
 * extension — and rejecting that here would refuse valid images for no gain.
 * This only turns away uploads that are affirmatively something else.
 */
export function isPossiblyAnAvatar(mimeType: string) {
  return (
    allowedAvatarMimeTypes.includes(mimeType) ||
    mimeType === 'application/octet-stream'
  );
}
