
import { MailgunConfig, ContactData, EmailData } from "@/types/mailgun";

interface MailgunResponse {
  success: boolean;
  message: string;
  id?: string;
}

export async function sendEmail(
  mailgunConfig: MailgunConfig,
  emailData: EmailData,
  recipientData: ContactData
): Promise<MailgunResponse> {
  try {
    const { apiKey, domain, from } = mailgunConfig;
    const { subject, htmlContent } = emailData;
    const { email, name, variables } = recipientData;

    // Preparar as variáveis personalizadas no conteúdo HTML
    let personalizedHtml = htmlContent;
    let personalizedSubject = subject;
    
    if (variables) {
      // Substituir as variáveis no formato %variable_name% pelo valor correspondente
      Object.entries(variables).forEach(([key, value]) => {
        const variablePattern = new RegExp(`%${key}%`, 'g');
        personalizedHtml = personalizedHtml.replace(variablePattern, value);
        personalizedSubject = personalizedSubject.replace(variablePattern, value);
      });
      
      // Adicionar suporte para variáveis especiais de destinatário
      const recipientVariables = {
        'recipient.name': name || '',
        'recipient.email': email
      };
      
      Object.entries(recipientVariables).forEach(([key, value]) => {
        const variablePattern = new RegExp(`%${key}%`, 'g');
        personalizedHtml = personalizedHtml.replace(variablePattern, value);
        personalizedSubject = personalizedSubject.replace(variablePattern, value);
      });
    }

    // Formatar o nome do destinatário (se disponível)
    const to = name ? `${name} <${email}>` : email;

    // Criar o payload para a API do Mailgun
    const formData = new FormData();
    formData.append('from', from);
    formData.append('to', to);
    formData.append('subject', personalizedSubject);
    formData.append('html', personalizedHtml);

    // Configurar autorização e outras opções da requisição
    const auth = btoa(`api:${apiKey}`);

    // Fazer a chamada para a API do Mailgun
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Erro na API do Mailgun:', responseData);
      return { 
        success: false, 
        message: `Erro ${response.status}: ${responseData.message || 'Falha na requisição ao Mailgun'}` 
      };
    }

    return { 
      success: true, 
      message: 'Email enviado com sucesso', 
      id: responseData.id 
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email' 
    };
  }
}
