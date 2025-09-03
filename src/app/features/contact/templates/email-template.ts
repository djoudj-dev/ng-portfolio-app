export const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message de contact</title>
  <style>
    :root {
      --color-text: #4b3c7d;
      --color-background: #ffffff;
      --color-primary: #6c5ba7;
      --color-secondary: #8a7eb5;
      --color-accent: #d9b053;
    }

    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: var(--color-text);
      background-color: var(--color-background);
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid var(--color-primary);
    }

    .content {
      padding: 20px 0;
    }

    .message-box {
      background-color: #f5f5f5;
      border-left: 4px solid var(--color-accent);
      padding: 15px;
      margin: 20px 0;
    }

    .contact-info {
      background-color: #f0f0f0;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }

    .contact-info p {
      margin: 5px 0;
    }

    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid var(--color-secondary);
      font-size: 0.8em;
      color: var(--color-secondary);
    }

    h1 {
      color: var(--color-primary);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nouveau message de contact</h1>
    </div>
    <div class="content">
      <div class="contact-info">
        <p><strong>Nom:</strong> {{name}}</p>
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Sujet:</strong> {{subject}}</p>
      </div>

      <h2>Message:</h2>
      <div class="message-box">
        <p>{{message}}</p>
      </div>

      <p>Vous pouvez répondre directement à cet email pour contacter l'expéditeur.</p>
    </div>
    <div class="footer">
      <p>Ce message a été envoyé depuis le formulaire de contact du site.</p>
    </div>
  </div>
</body>
</html>`;
