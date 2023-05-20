import { init, xd3_encode_memory, xd3_decode_memory, xd3_smatch_cfg, WASI_ERRNO } from '../dist/index';

const source = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
const input = new Uint8Array([4, 5, 6, 7, 8, 1, 2, 3, 4, 5]);
const expectedOutput = new Uint8Array([
  214, 195, 196, 0, 0, 0, 16, 10,
    0,  10,   1, 0, 4, 5,  6,  7,
    8,   1,   2, 3, 4, 5, 11
]);
const smatch_cfg = xd3_smatch_cfg.DEFAULT;

describe('xd3', () => {
  it('inits', async () => {
    await init();
  });
  it('encodes', async () => {
    const { ret, str, output } = xd3_encode_memory(input, source, 100, smatch_cfg);
    expect(ret).toBe(0);
    expect(str).toBe("SUCCESS");
    expect(output).toEqual(expectedOutput);
  });
  it('decodes', async () => {
    const { ret, str, output } = xd3_decode_memory(expectedOutput, source, 100);
    expect(ret).toBe(0);
    expect(str).toBe("SUCCESS");
    expect(output).toEqual(input);
  });
  it('encodes and decodes', async () => {
    const { ret, str, output } = xd3_encode_memory(input, source, 100, smatch_cfg);
    expect(ret).toBe(0);
    expect(str).toBe("SUCCESS");

    const { ret: ret2, str: str2, output: output2 } = xd3_decode_memory(output, source, 100);
    expect(ret2).toBe(0);
    expect(str2).toBe("SUCCESS");
    expect(output2).toEqual(input);
  });
  it('errors on too big output', async () => {
    const { ret, str, output } = xd3_encode_memory(input, source, 10, smatch_cfg);
    expect(ret).toBe(WASI_ERRNO.ENOSPC);
    expect(str).toBe("ENOSPC");
    expect(output).toEqual(new Uint8Array([]));
  });
});