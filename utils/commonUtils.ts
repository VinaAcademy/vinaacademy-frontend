// Format the price with comma separator and currency symbol
export const formatCurrency = (value: number) => {
  if (value == 0) {
    return 'Miễn phí'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
