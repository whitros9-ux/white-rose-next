export type Currency = "USD" | "YER" | "SAR";

export const YER_PER_USD = 530;
export const SAR_PER_USD = 3.75;

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function formatYER(usd: number): string {
  return `${formatNumber(usd * YER_PER_USD)} ر.ي`;
}

export function formatUSD(usd: number): string {
  return `$${usd.toFixed(usd < 10 ? 2 : 0)}`;
}

export function formatSAR(usd: number): string {
  return `${formatNumber(usd * SAR_PER_USD)} ر.س`;
}

export function formatCurrency(usd: number, currency: Currency): string {
  switch (currency) {
    case "YER": return formatYER(usd);
    case "SAR": return formatSAR(usd);
    default: return formatUSD(usd);
  }
}
