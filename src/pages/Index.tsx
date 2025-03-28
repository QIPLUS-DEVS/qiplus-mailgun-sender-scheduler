
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from "lucide-react";
import ApiSettings from "@/components/mailgun/ApiSettings";
import EmailComposer from "@/components/mailgun/EmailComposer";
import ContactList from "@/components/mailgun/ContactList";
import ScheduleSettings from "@/components/mailgun/ScheduleSettings";
import SendEmailsPanel from "@/components/mailgun/SendEmailsPanel";
import { useToast } from "@/components/ui/use-toast";
import { ContactData, MailgunConfig, EmailData, ScheduleConfig } from "@/types/mailgun";

const Index = () => {
  const { toast } = useToast();
  const [mailgunConfig, setMailgunConfig] = useState<MailgunConfig>({
    apiKey: localStorage.getItem("mailgunApiKey") || "",
    domain: localStorage.getItem("mailgunDomain") || "",
    from: localStorage.getItem("mailgunFrom") || "",
  });
  
  const [emailData, setEmailData] = useState<EmailData>({
    subject: "",
    htmlContent: "",
  });
  
  const [contacts, setContacts] = useState<ContactData[]>([]);
  
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    emailsPerHour: 100,
    batchSize: 10,
    intervalBetweenBatches: 5, // minutes
  });
  
  const [activeTab, setActiveTab] = useState("api-settings");
  
  const handleApiSettingsSave = (config: MailgunConfig) => {
    setMailgunConfig(config);
    localStorage.setItem("mailgunApiKey", config.apiKey);
    localStorage.setItem("mailgunDomain", config.domain);
    localStorage.setItem("mailgunFrom", config.from);
    
    toast({
      title: "Configurações salvas",
      description: "Suas configurações de API foram salvas com sucesso.",
    });
    
    setActiveTab("email-composer");
  };

  const isConfigValid = () => {
    return (
      mailgunConfig.apiKey.trim() !== "" && 
      mailgunConfig.domain.trim() !== "" &&
      mailgunConfig.from.trim() !== ""
    );
  };
  
  const isEmailValid = () => {
    return emailData.subject.trim() !== "" && emailData.htmlContent.trim() !== "";
  };
  
  const areContactsValid = () => {
    return contacts.length > 0;
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <Mail className="h-8 w-8 text-mailgun mr-2" />
          <h1 className="text-3xl font-bold">Mailgun Sender</h1>
        </div>
        <p className="text-muted-foreground">Configure, envie e acompanhe seus e-mails via Mailgun</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="api-settings">Configuração API</TabsTrigger>
          <TabsTrigger value="email-composer" disabled={!isConfigValid()}>Composição</TabsTrigger>
          <TabsTrigger value="contacts" disabled={!isConfigValid() || !isEmailValid()}>Contatos</TabsTrigger>
          <TabsTrigger value="schedule" disabled={!isConfigValid() || !isEmailValid() || !areContactsValid()}>Agendamento</TabsTrigger>
          <TabsTrigger value="send" disabled={!isConfigValid() || !isEmailValid() || !areContactsValid()}>Enviar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-settings">
          <ApiSettings 
            initialConfig={mailgunConfig}
            onSave={handleApiSettingsSave}
          />
        </TabsContent>
        
        <TabsContent value="email-composer">
          <EmailComposer 
            emailData={emailData}
            setEmailData={setEmailData}
            onNext={() => setActiveTab("contacts")}
          />
        </TabsContent>
        
        <TabsContent value="contacts">
          <ContactList 
            contacts={contacts}
            setContacts={setContacts}
            onNext={() => setActiveTab("schedule")}
          />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScheduleSettings 
            scheduleConfig={scheduleConfig}
            setScheduleConfig={setScheduleConfig}
            onNext={() => setActiveTab("send")}
          />
        </TabsContent>
        
        <TabsContent value="send">
          <SendEmailsPanel 
            mailgunConfig={mailgunConfig}
            emailData={emailData}
            contacts={contacts}
            scheduleConfig={scheduleConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
