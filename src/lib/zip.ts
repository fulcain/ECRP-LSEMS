/**
 * A minimal ZIP writer - store method (no compression), no dependencies.
 *
 * It exists for exactly one job: handing the `extension/` folder to a member as
 * a download, always built from the files on disk so the archive can never be
 * staler than the source. Committing a pre-built zip would be the other way, and
 * the one thing guaranteed about it is that the next extension edit forgets it.
 *
 * A reader needs three structures and nothing else: a local header per file
 * followed by its bytes, one central-directory record per file, and the end
 * record that points at the directory.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc = CRC_TABLE[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export type ZipEntry = {
  /** Path inside the archive, e.g. `folder/manifest.json`. */
  name: string;
  data: Uint8Array;
};

/** Fixed date stamps keep the archive byte-identical between downloads. */
const DOS_TIME = 0;
const DOS_DATE = ((2000 - 1980) << 9) | (1 << 5) | 1;

function u16(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function u32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
  return bytes;
}

export function createZip(entries: readonly ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const directory: Uint8Array[] = [];
  let offset = 0;
  let size = 0;

  const push = (bytes: Uint8Array) => {
    parts.push(bytes);
    size += bytes.length;
  };

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const checksum = crc32(entry.data);
    const headerOffset = offset;

    const header = [
      u32(0x04034b50), // local file header
      u16(20), // version needed
      u16(0x0800), // UTF-8 file names
      u16(0), // method: store
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(checksum),
      u32(entry.data.length),
      u32(entry.data.length),
      u16(name.length),
      u16(0), // extra field
    ];
    for (const piece of header) push(piece);
    push(name);
    push(entry.data);

    offset = size;

    const record = [
      u32(0x02014b50), // central directory header
      u16(20), // version made by
      u16(20), // version needed
      u16(0x0800),
      u16(0),
      u16(DOS_TIME),
      u16(DOS_DATE),
      u32(checksum),
      u32(entry.data.length),
      u32(entry.data.length),
      u16(name.length),
      u16(0), // extra field
      u16(0), // comment
      u16(0), // disk number
      u16(0), // internal attributes
      u32(0), // external attributes
      u32(headerOffset),
    ];
    const recordBytes = [...record, name];
    for (const piece of recordBytes) directory.push(piece);
  }

  const directorySize = directory.reduce((total, part) => total + part.length, 0);
  const directoryOffset = size;
  for (const part of directory) push(part);

  for (const piece of [
    u32(0x06054b50), // end of central directory
    u16(0), // this disk
    u16(0), // disk with the directory
    u16(entries.length),
    u16(entries.length),
    u32(directorySize),
    u32(directoryOffset),
    u16(0), // comment
  ]) {
    push(piece);
  }

  const archive = new Uint8Array(size);
  let cursor = 0;
  for (const part of parts) {
    archive.set(part, cursor);
    cursor += part.length;
  }
  return archive;
}
