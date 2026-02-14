export interface IntegrationStack {
  id: string;
  name: string;
  description: string;
  /** Code snippet for installing or setting up the client. */
  install?: string;
  /** Example of making an authenticated request. */
  example: string;
  /** Optional extra notes. */
  notes?: string;
}

export const INTEGRATION_STACKS: IntegrationStack[] = [
  {
    id: "node",
    name: "Node.js",
    description: "Use fetch or axios with your secret key in the Authorization header.",
    install: "npm install node-fetch  # or use built-in fetch in Node 18+",
    example: `const res = await fetch('https://your-app.com/api/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.KICKPAY_SECRET_KEY,
  },
  body: JSON.stringify({ amount: 10000, currency: 'NGN' }),
});
const data = await res.json();`,
    notes: "Store your secret key in environment variables (e.g. KICKPAY_SECRET_KEY).",
  },
  {
    id: "php",
    name: "PHP",
    description: "Use cURL or Guzzle to send requests with your secret key.",
    install: "composer require guzzlehttp/guzzle  # optional",
    example: `$ch = curl_init('https://your-app.com/api/payments');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode(['amount' => 10000, 'currency' => 'NGN']),
  CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    'Authorization: Bearer ' . getenv('KICKPAY_SECRET_KEY'),
  ],
  CURLOPT_RETURNTRANSFER => true,
]);
$response = curl_exec($ch);
$data = json_decode($response, true);`,
    notes: "Never commit your secret key. Use environment variables or a secrets manager.",
  },
  {
    id: "python",
    name: "Python",
    description: "Use requests or httpx with your secret key in the Authorization header.",
    install: "pip install requests",
    example: `import os
import requests

url = "https://your-app.com/api/payments"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {os.environ['KICKPAY_SECRET_KEY']}",
}
payload = {"amount": 10000, "currency": "NGN"}
response = requests.post(url, json=payload, headers=headers)
data = response.json()`,
    notes: "Use python-dotenv or your deployment env for KICKPAY_SECRET_KEY.",
  },
  {
    id: "curl",
    name: "cURL",
    description: "Call the API from the command line or scripts.",
    example: `curl -X POST 'https://your-app.com/api/payments' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \\
  -d '{"amount": 10000, "currency": "NGN"}'`,
    notes: "Replace YOUR_SECRET_KEY with your test or live secret key.",
  },
];

export function getIntegrationBySlug(slug: string): IntegrationStack | undefined {
  return INTEGRATION_STACKS.find((s) => s.id === slug);
}
