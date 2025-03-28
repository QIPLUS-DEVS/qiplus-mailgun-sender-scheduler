
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailData } from "@/types/mailgun";
import { FileText } from "lucide-react";

interface EmailComposerProps {
  emailData: EmailData;
  setEmailData: React.Dispatch<React.SetStateAction<EmailData>>;
  onNext: () => void;
}

const EmailComposer = ({ emailData, setEmailData, onNext }: EmailComposerProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-mailgun" />
          Composição do Email
        </CardTitle>
        <CardDescription>
          Crie o conteúdo do seu email. Você pode usar HTML diretamente.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Digite o assunto do email"
              value={emailData.subject}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="htmlContent">Conteúdo HTML</Label>
            <Textarea
              id="htmlContent"
              name="htmlContent"
              placeholder="Cole ou escreva seu HTML aqui"
              className="min-h-[300px] font-mono"
              value={emailData.htmlContent}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              Cole seu HTML completo aqui. Você pode usar variáveis como %recipient.name%, %recipient.email%, etc.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!emailData.subject || !emailData.htmlContent}
          >
            Continuar para Contatos
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmailComposer;
