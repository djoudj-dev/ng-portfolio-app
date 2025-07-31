export const EMAIL_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de réception</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #ffffff;
      color: #2c2c2c;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #2c2c2c;
    }

    .header p {
      margin-top: 8px;
      font-size: 16px;
      color: #5a5a5a;
    }

    .content {
      padding: 30px 0;
      font-size: 16px;
      line-height: 1.6;
    }

    .box {
      background-color: #f9f9f9;
      border-left: 4px solid #e0b84a;
      padding: 16px;
      border-radius: 4px;
      margin: 24px 0;
    }

    .highlight {
      font-weight: bold;
      color: #2c2c2c;
    }

    .signature {
      margin-top: 32px;
      font-style: italic;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #888888;
      border-top: 1px solid #e0e0e0;
      margin-top: 40px;
      padding-top: 20px;
    }

    /* Removed unused btn class */

    @media screen and (max-width: 600px) {
      .container {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
<div class="container">
  <!-- Header -->
  <div class="header">
    <h1>Confirmation de réception</h1>
    <p>Votre message a bien été reçu</p>
  </div>

  <!-- Body -->
  <div class="content">
    <p>Bonjour <span class="highlight">{{name}}</span>,</p>

    <div class="box">
      <p>J'ai bien reçu votre message et vous remercie pour votre prise de contact.</p>
      <p>Je vais examiner votre demande et vous répondre dans les meilleurs délais.</p>
    </div>

    <p>Cordialement,<br />
      <span class="signature">MR. Nédellec Julien</span></p>

    <!--<a href="https://nedellec-julien.fr" class="btn">Accéder à mon compte</a>-->
  </div>

  <!-- Footer -->
  <div class="footer">
    Ce mail a été envoyé automatiquement. Merci de ne pas y répondre.
  </div>
</div>
</body>
</html>
`;
