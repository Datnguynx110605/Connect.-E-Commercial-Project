export const formatROM = (rom: number): string => {
  if (rom >= 1000) {
    return `${Math.floor(rom / 1000)}TB`;
  }
  return `${rom}GB`;
};
