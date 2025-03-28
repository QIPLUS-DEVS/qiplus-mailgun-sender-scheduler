
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScheduleConfig } from "@/types/mailgun";
import { MailMinus } from "lucide-react";

interface ScheduleSettingsProps {
  scheduleConfig: ScheduleConfig;
  setScheduleConfig: React.Dispatch<React.SetStateAction<ScheduleConfig>>;
  onNext: () => void;
}

const ScheduleSettings = ({ 
  scheduleConfig, 
  setScheduleConfig, 
  onNext 
}: ScheduleSettingsProps) => {
  
  const handleSliderChange = (name: keyof ScheduleConfig, value: number[]) => {
    setScheduleConfig(prev => ({ ...prev, [name]: value[0] }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue) && numValue > 0) {
      setScheduleConfig(prev => ({ ...prev, [name]: numValue }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MailMinus className="mr-2 h-5 w-5 text-mailgun" />
          Configurações de Envio
        </CardTitle>
        <CardDescription>
          Defina os parâmetros de envio para controlar a taxa de entrega dos emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="emailsPerHour">Emails por Hora</Label>
              <span className="text-sm font-medium">
                {scheduleConfig.emailsPerHour} emails/hora
              </span>
            </div>
            <Slider
              id="emailsPerHour"
              min={10}
              max={1000}
              step={10}
              value={[scheduleConfig.emailsPerHour]}
              onValueChange={(value) => handleSliderChange("emailsPerHour", value)}
              className="mb-2"
            />
            <div className="grid grid-cols-3 text-xs text-muted-foreground">
              <div>Lento (10)</div>
              <div className="text-center">Moderado (500)</div>
              <div className="text-right">Rápido (1000)</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Controle a quantidade de emails enviados por hora para evitar limitações do serviço
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="batchSize">Tamanho do Lote</Label>
              <span className="text-sm font-medium">
                {scheduleConfig.batchSize} emails/lote
              </span>
            </div>
            <Slider
              id="batchSize"
              min={1}
              max={100}
              step={1}
              value={[scheduleConfig.batchSize]}
              onValueChange={(value) => handleSliderChange("batchSize", value)}
              className="mb-2"
            />
            <div className="grid grid-cols-3 text-xs text-muted-foreground">
              <div>1 email</div>
              <div className="text-center">50 emails</div>
              <div className="text-right">100 emails</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Defina quantos emails serão enviados em cada lote de processamento
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="intervalBetweenBatches">Intervalo entre Lotes (minutos)</Label>
              <span className="text-sm font-medium">
                {scheduleConfig.intervalBetweenBatches} minutos
              </span>
            </div>
            <Slider
              id="intervalBetweenBatches"
              min={1}
              max={60}
              step={1}
              value={[scheduleConfig.intervalBetweenBatches]}
              onValueChange={(value) => handleSliderChange("intervalBetweenBatches", value)}
              className="mb-2"
            />
            <div className="grid grid-cols-3 text-xs text-muted-foreground">
              <div>1 min</div>
              <div className="text-center">30 min</div>
              <div className="text-right">60 min</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Tempo de espera entre o envio de cada lote de emails
          </p>
        </div>
        
        <div className="p-4 bg-secondary rounded-lg">
          <h3 className="font-medium mb-2">Resumo da Configuração</h3>
          <p className="text-sm mb-1">
            Enviando <strong>{scheduleConfig.emailsPerHour}</strong> emails por hora, em lotes 
            de <strong>{scheduleConfig.batchSize}</strong>, com intervalos 
            de <strong>{scheduleConfig.intervalBetweenBatches}</strong> minutos entre os lotes.
          </p>
          <p className="text-sm text-muted-foreground">
            Tempo estimado de envio para 1000 contatos: {Math.ceil(1000 / scheduleConfig.emailsPerHour)} horas
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={onNext}
        >
          Continuar para Envio
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScheduleSettings;
