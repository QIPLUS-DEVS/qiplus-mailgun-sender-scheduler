
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { SentEmail } from "@/types/mailgun";
import { FileSpreadsheet, Download, Check, X } from "lucide-react";
import * as XLSX from 'xlsx';

interface SentEmailsPanelProps {
  sentEmails: SentEmail[];
}

const SentEmailsPanel = ({ sentEmails }: SentEmailsPanelProps) => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');

  const exportToFile = () => {
    // Create a worksheet with the sent emails data
    const worksheet = XLSX.utils.json_to_sheet(
      sentEmails.map(email => ({
        Email: email.email,
        Nome: email.name || '',
        Data: email.timestamp,
        Status: email.status === 'success' ? 'Sucesso' : 'Falha',
        Erro: email.errorMessage || ''
      }))
    );

    // Create a workbook with the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Emails Enviados");

    // Generate the file based on the selected format
    const fileName = `emails_enviados_${new Date().toISOString().split('T')[0]}`;
    
    if (exportFormat === 'csv') {
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.csv`;
      link.click();
    } else {
      // Export as XLSX
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }

    toast({
      title: "Exportação concluída",
      description: `Os dados foram exportados como ${exportFormat === 'csv' ? 'CSV' : 'Excel'}.`
    });
  };

  const successCount = sentEmails.filter(email => email.status === 'success').length;
  const failureCount = sentEmails.filter(email => email.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5 text-mailgun" />
          Emails Enviados
        </CardTitle>
        <CardDescription>
          Registro de todos os emails enviados e seus status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-2 flex items-center">
            <span className="text-sm font-medium">Exportar como:</span>
            <Button 
              variant={exportFormat === 'xlsx' ? "default" : "outline"} 
              size="sm"
              onClick={() => setExportFormat('xlsx')}
            >
              Excel
            </Button>
            <Button 
              variant={exportFormat === 'csv' ? "default" : "outline"} 
              size="sm"
              onClick={() => setExportFormat('csv')}
            >
              CSV
            </Button>
          </div>
          <Button 
            onClick={exportToFile} 
            disabled={sentEmails.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-100 rounded-md p-4 text-center">
            <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-800">Enviados com Sucesso</h4>
            <p className="text-2xl font-bold text-green-700">{successCount}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-md p-4 text-center">
            <X className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <h4 className="font-medium text-red-800">Falhas no Envio</h4>
            <p className="text-2xl font-bold text-red-700">{failureCount}</p>
          </div>
        </div>

        {sentEmails.length > 0 ? (
          <ScrollArea className="h-[400px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentEmails.map((email, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {email.status === 'success' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Sucesso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <X className="h-3 w-3 mr-1" />
                          Falha
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{email.email}</TableCell>
                    <TableCell>{email.name || '-'}</TableCell>
                    <TableCell>{email.timestamp}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {email.status === 'failed' ? email.errorMessage : (email.id ? `ID: ${email.id}` : '-')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 border rounded-md bg-secondary/20">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">Nenhum email enviado</h3>
            <p className="text-muted-foreground">
              Os emails enviados aparecerão aqui após o processamento de envios.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentEmailsPanel;
