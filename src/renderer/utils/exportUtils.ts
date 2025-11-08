import Papa from 'papaparse';

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (title: string, data: any[], filename: string) => {
  // PDF export temporarily disabled due to Electron compatibility issues
  // Will be re-enabled in a future update
  alert('PDF export is temporarily unavailable. Please use CSV export instead.');
  console.log('PDF export requested for:', title, 'with', data.length, 'rows');
  
  // TODO: Implement PDF export with Electron-compatible library
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const maskValue = (value: string | number, stealthMode: boolean): string => {
  if (!stealthMode) return String(value);
  return '••••••';
};

