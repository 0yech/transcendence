import { isPossiblyAnAvatar, sniffImageMimeType } from './avatar.util';

/** Pads a header out past the minimum length the sniffer requires. */
function image(...header: number[]) {
  return Uint8Array.from([...header, ...new Array<number>(16).fill(0)]);
}

describe('sniffImageMimeType', () => {
  it('identifies a PNG', () => {
    expect(
      sniffImageMimeType(image(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)),
    ).toBe('image/png');
  });

  it('identifies a JPEG', () => {
    expect(sniffImageMimeType(image(0xff, 0xd8, 0xff, 0xe0))).toBe(
      'image/jpeg',
    );
  });

  it('identifies both GIF versions', () => {
    // "GIF87a" and "GIF89a".
    expect(sniffImageMimeType(image(0x47, 0x49, 0x46, 0x38, 0x37, 0x61))).toBe(
      'image/gif',
    );
    expect(sniffImageMimeType(image(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe(
      'image/gif',
    );
  });

  it('identifies a WebP, which needs both of its markers', () => {
    const riff = [0x52, 0x49, 0x46, 0x46];
    const size = [0x00, 0x00, 0x00, 0x00];
    const webp = [0x57, 0x45, 0x42, 0x50];

    expect(sniffImageMimeType(image(...riff, ...size, ...webp))).toBe(
      'image/webp',
    );
    // RIFF alone is a container, not necessarily an image.
    expect(
      sniffImageMimeType(image(...riff, ...size, 0x41, 0x56, 0x49, 0x20)),
    ).toBeNull();
  });

  it('rejects a file that only claims to be an image', () => {
    // What a .txt renamed to .png actually contains.
    expect(sniffImageMimeType(Buffer.from('not an image at all, sorry'))).toBe(
      null,
    );
  });

  it('rejects buffers too short to hold a signature', () => {
    expect(sniffImageMimeType(new Uint8Array(0))).toBeNull();
    // A truncated PNG header: correct as far as it goes, but unusable.
    expect(sniffImageMimeType(Uint8Array.from([0x89, 0x50, 0x4e]))).toBeNull();
  });

  it('rejects SVG, which is a document rather than a raster image', () => {
    expect(
      sniffImageMimeType(
        Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">'),
      ),
    ).toBeNull();
  });
});

describe('isPossiblyAnAvatar', () => {
  it('accepts the allowed types', () => {
    expect(isPossiblyAnAvatar('image/png')).toBe(true);
    expect(isPossiblyAnAvatar('image/webp')).toBe(true);
  });

  it('accepts a client that cannot name the type', () => {
    // curl sends this for .webp, as does any file without an extension.
    // Refusing it here would reject valid images before they are ever read.
    expect(isPossiblyAnAvatar('application/octet-stream')).toBe(true);
  });

  it('turns away types that are affirmatively something else', () => {
    expect(isPossiblyAnAvatar('text/plain')).toBe(false);
    expect(isPossiblyAnAvatar('image/svg+xml')).toBe(false);
    expect(isPossiblyAnAvatar('application/pdf')).toBe(false);
  });
});
