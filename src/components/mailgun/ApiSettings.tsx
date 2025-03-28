
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailgunConfig } from "@/types/mailgun";
import { Mail } from "lucide-react";

interface ApiSettingsProps {
  initialConfig: MailgunConfig;
  onSave: (config: MailgunConfig) => void;
}

const ApiSettings = ({ initialConfig, onSave }: ApiSettingsProps) => {
  const [config, setConfig] = useState<MailgunConfig>(initialConfig);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5 text-mailgun" />
          Configurações da API Mailgun
        </CardTitle>
        <CardDescription>
          Configure suas credenciais do Mailgun para começar a enviar emails
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API (Private API Key)</Label>
            <Input
              id="apiKey"
              name="apiKey"
              placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.apiKey}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              Você pode encontrar sua chave de API privada no dashboard do Mailgun
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="domain">Domínio</Label>
            <Input
              id="domain"
              name="domain"
              placeholder="mg.seudominio.com"
              value={config.domain}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              O domínio que você configurou no Mailgun
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from">Email de Origem</Label>
            <Input
              id="from"
              name="from"
              placeholder="seu-nome@seudominio.com"
              value={config.from}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              O endereço de email que aparecerá como remetente
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!config.apiKey || !config.domain || !config.from}
          >
            Salvar e Continuar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiSettings;
