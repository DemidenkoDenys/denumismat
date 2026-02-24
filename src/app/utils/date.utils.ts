export const getDayDiff = (iso: string) => {
  const msInDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const target = new Date(iso);

  return Math.round((target.getTime() - today.getTime()) / msInDay);
};
