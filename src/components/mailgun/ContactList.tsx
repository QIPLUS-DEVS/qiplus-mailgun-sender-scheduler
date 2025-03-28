
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { ContactData } from "@/types/mailgun";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { generateSampleSpreadsheet } from "@/utils/excelUtils";

interface ContactListProps {
  contacts: ContactData[];
  setContacts: React.Dispatch<React.SetStateAction<ContactData[]>>;
  onNext: () => void;
}

const ContactList = ({ contacts, setContacts, onNext }: ContactListProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume the first sheet contains contacts
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        if (jsonData.length === 0) {
          toast({
            title: "Erro na importação",
            description: "A planilha está vazia ou não possui dados válidos.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
        
        // Check if the file has the required email column
        if (!jsonData[0].email && !jsonData[0].Email) {
          toast({
            title: "Formato inválido",
            description: "A planilha deve ter uma coluna 'email' ou 'Email'.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
        
        // Process the data
        const processedContacts: ContactData[] = jsonData.map((row) => {
          const email = row.email || row.Email || "";
          const name = row.name || row.Name || "";
          
          // Extract other columns as variables
          const variables: Record<string, string> = {};
          Object.keys(row).forEach((key) => {
            if (key.toLowerCase() !== "email" && key.toLowerCase() !== "name") {
              variables[key] = String(row[key]);
            }
          });
          
          return { email, name, variables };
        });
        
        setContacts(processedContacts);
        
        toast({
          title: "Importação concluída",
          description: `${processedContacts.length} contatos importados com sucesso.`,
        });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Erro na importação",
          description: "Ocorreu um erro ao processar o arquivo. Verifique o formato.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadSample = () => {
    generateSampleSpreadsheet();
    toast({
      title: "Download iniciado",
      description: "O download da planilha de exemplo foi iniciado."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5 text-mailgun" />
          Lista de Contatos
        </CardTitle>
        <CardDescription>
          Importe sua lista de contatos de uma planilha XLSX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar planilha de exemplo
          </Button>
        </div>
        
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium">Arraste um arquivo ou clique para fazer upload</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Compatível com arquivos .xlsx
            </p>
            <Button 
              variant="outline" 
              className="relative" 
              disabled={isUploading}
            >
              {isUploading ? "Processando..." : "Selecionar arquivo"}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".xlsx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </Button>
          </div>
        </div>
        
        {contacts.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Variáveis</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.slice(0, 10).map((contact, index) => (
                  <TableRow key={index}>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.name || '-'}</TableCell>
                    <TableCell>
                      {contact.variables ? 
                        Object.keys(contact.variables).length : 
                        0} variáveis
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContact(index)}
                        className="h-8 px-2"
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {contacts.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      + {contacts.length - 10} contatos adicionais
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          disabled={contacts.length === 0}
          onClick={onNext}
        >
          Continuar para Agendamento ({contacts.length} contatos)
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContactList;
