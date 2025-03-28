
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { MailgunConfig, EmailData, ContactData, ScheduleConfig, SendProgressData } from "@/types/mailgun";
import { MailPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendEmail } from "@/utils/mailgunApi";

interface SendEmailsPanelProps {
  mailgunConfig: MailgunConfig;
  emailData: EmailData;
  contacts: ContactData[];
  scheduleConfig: ScheduleConfig;
}

const SendEmailsPanel = ({
  mailgunConfig,
  emailData,
  contacts,
  scheduleConfig,
}: SendEmailsPanelProps) => {
  const { toast } = useToast();
  const [sendProgress, setSendProgress] = useState<SendProgressData>({
    totalContacts: contacts.length,
    sentEmails: 0,
    failedEmails: 0,
    inProgress: false,
    logs: [],
  });

  const addLog = (message: string, type: 'info' | 'success' | 'error') => {
    setSendProgress((prev) => ({
      ...prev,
      logs: [
        ...prev.logs,
        {
          timestamp: new Date().toLocaleTimeString(),
          message,
          type,
        },
      ],
    }));
  };

  const calculateProgress = () => {
    const { sentEmails, failedEmails, totalContacts } = sendProgress;
    const processed = sentEmails + failedEmails;
    return (processed / totalContacts) * 100;
  };

  const handleSendEmails = () => {
    if (sendProgress.inProgress) return;

    setSendProgress((prev) => ({
      ...prev,
      inProgress: true,
      logs: [],
    }));

    addLog("Iniciando processo de envio de emails", "info");
    addLog(`Configuração: ${scheduleConfig.emailsPerHour} emails/hora, lotes de ${scheduleConfig.batchSize}, intervalos de ${scheduleConfig.intervalBetweenBatches} minutos`, "info");
    
    // Iniciar o envio de emails em lotes
    processBatch(0);
  };

  const processBatch = (startIdx: number) => {
    const { batchSize } = scheduleConfig;
    const endIdx = Math.min(startIdx + batchSize, contacts.length);
    
    if (startIdx >= contacts.length) {
      // Todos os contatos processados
      setSendProgress((prev) => ({ ...prev, inProgress: false }));
      addLog("Processo de envio concluído", "info");
      toast({
        title: "Envio concluído",
        description: `${sendProgress.sentEmails} emails enviados, ${sendProgress.failedEmails} falhas.`,
      });
      return;
    }
    
    const currentBatch = contacts.slice(startIdx, endIdx);
    addLog(`Processando lote ${Math.floor(startIdx / batchSize) + 1}: emails ${startIdx + 1} até ${endIdx}`, "info");
    
    // Calcular intervalo entre emails para respeitar o limite por hora
    const emailIntervalMs = Math.ceil(3600 * 1000 / scheduleConfig.emailsPerHour);
    
    // Processar cada contato no lote
    currentBatch.forEach((contact, idx) => {
      setTimeout(() => {
        sendEmailToContact(contact);
      }, idx * emailIntervalMs);
    });
    
    // Agendar próximo lote
    const nextBatchTime = scheduleConfig.intervalBetweenBatches * 60 * 1000; // converter para ms
    setTimeout(() => {
      processBatch(endIdx);
    }, nextBatchTime);
    
    // Registrar agendamento do próximo lote
    const nextTime = new Date(Date.now() + nextBatchTime);
    addLog(`Próximo lote agendado para ${nextTime.toLocaleTimeString()}`, "info");
  };
  
  const sendEmailToContact = async (contact: ContactData) => {
    try {
      addLog(`Enviando email para ${contact.email}...`, "info");
      
      const result = await sendEmail(mailgunConfig, emailData, contact);
      
      if (result.success) {
        setSendProgress((prev) => ({
          ...prev,
          sentEmails: prev.sentEmails + 1,
        }));
        addLog(`Email enviado com sucesso para ${contact.email}${result.id ? ` (ID: ${result.id})` : ''}`, "success");
      } else {
        setSendProgress((prev) => ({
          ...prev,
          failedEmails: prev.failedEmails + 1,
        }));
        addLog(`Falha ao enviar para ${contact.email}: ${result.message}`, "error");
      }
    } catch (error) {
      setSendProgress((prev) => ({
        ...prev,
        failedEmails: prev.failedEmails + 1,
      }));
      addLog(`Erro ao enviar para ${contact.email}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, "error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MailPlus className="mr-2 h-5 w-5 text-mailgun" />
          Envio de Emails
        </CardTitle>
        <CardDescription>
          Envie seus emails para {contacts.length} contatos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso do Envio</span>
            <span>
              {sendProgress.sentEmails + sendProgress.failedEmails} / {sendProgress.totalContacts}
            </span>
          </div>
          <Progress value={calculateProgress()} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Enviados: {sendProgress.sentEmails}</span>
            <span>Falhas: {sendProgress.failedEmails}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Logs de Envio</h3>
          <ScrollArea className="h-[300px] border rounded-md p-4">
            {sendProgress.logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                O log de envio aparecerá aqui
              </p>
            ) : (
              <div className="space-y-2">
                {sendProgress.logs.map((log, idx) => (
                  <div key={idx} className={`text-sm flex items-start gap-2 ${
                    log.type === 'error' ? 'text-destructive' : 
                    log.type === 'success' ? 'text-green-600' : 
                    'text-muted-foreground'
                  }`}>
                    <span className="text-xs">{log.timestamp}</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <div className="space-y-4">
          <div className="bg-secondary p-4 rounded-md space-y-2">
            <h3 className="font-medium">Resumo</h3>
            <div className="text-sm space-y-1">
              <p><strong>De:</strong> {mailgunConfig.from}</p>
              <p><strong>Assunto:</strong> {emailData.subject}</p>
              <p><strong>Contatos:</strong> {contacts.length}</p>
              <p><strong>Taxa de envio:</strong> {scheduleConfig.emailsPerHour} emails/hora</p>
            </div>
          </div>
          
          <Button
            className="w-full h-12"
            disabled={sendProgress.inProgress}
            onClick={handleSendEmails}
          >
            {sendProgress.inProgress ? (
              "Enviando emails..."
            ) : (
              "Iniciar Envio"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendEmailsPanel;
