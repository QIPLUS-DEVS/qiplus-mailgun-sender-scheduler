
import * as XLSX from 'xlsx';

export const generateSampleSpreadsheet = () => {
  // Create a workbook
  const workbook = XLSX.utils.book_new();
  
  // Sample data with headers and a few example rows
  const sampleData = [
    { email: "exemplo1@dominio.com", name: "Nome Completo 1", cidade: "São Paulo", empresa: "Empresa ABC" },
    { email: "exemplo2@dominio.com", name: "Nome Completo 2", idade: "35", profissao: "Desenvolvedor" },
    { email: "exemplo3@dominio.com", name: "Nome Completo 3", data_nascimento: "1990-01-01", interesse: "Marketing" }
  ];
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos");
  
  // Generate binary string from workbook
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create Blob and download link
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  
  // Create download link and click it
  const link = document.createElement('a');
  link.href = url;
  link.download = "contatos_exemplo.xlsx";
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
};
