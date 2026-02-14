/**
 * API endpoints for docs reference and Try-it.
 * Base URL is relative to the app origin when trying from the dashboard.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ExampleResponse {
  status: number;
  body: string;
}

export interface DocEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  /** Optional request body sample for Try-it (JSON string or undefined for GET). */
  bodySample?: string;
  /** Path/query params that can be edited in Try-it, e.g. ["id"] for /payments/:id */
  pathParams?: string[];
  /** Example success response (status + JSON string). */
  exampleSuccess: ExampleResponse;
  /** Example error response (status + JSON string). */
  exampleError: ExampleResponse;
  /** Per-stack code snippets for this endpoint (Node, PHP, Python, cURL). */
  snippets: {
    node: string;
    php: string;
    python: string;
    curl: string;
  };
}

const ME_SUCCESS: ExampleResponse = {
  status: 200,
  body: JSON.stringify(
    {
      id: "clxx...",
      email: "billing@company.com",
      displayName: "Acme Inc",
      accountStatus: "pending",
      testSecretPrefix: "sk_test_abc12...",
    },
    null,
    2
  ),
};

const ME_ERROR: ExampleResponse = {
  status: 401,
  body: JSON.stringify({ error: "Unauthorized" }, null, 2),
};

const PAYMENT_SUCCESS: ExampleResponse = {
  status: 201,
  body: JSON.stringify(
    {
      id: "pay_123",
      amount: 10000,
      currency: "NGN",
      status: "pending",
      reference: "ref_123",
    },
    null,
    2
  ),
};

const PAYMENT_ERROR: ExampleResponse = {
  status: 400,
  body: JSON.stringify(
    { error: "Invalid amount. Must be a positive integer." },
    null,
    2
  ),
};

const PAYMENT_GET_ERROR: ExampleResponse = {
  status: 404,
  body: JSON.stringify({ error: "Payment not found" }, null, 2),
};

const RECIPIENTS_LIST_SUCCESS: ExampleResponse = {
  status: 200,
  body: JSON.stringify(
    {
      recipients: [
        {
          id: "rec_abc",
          fullName: "Zhang Wei",
          bankName: "ICBC",
          accountNumber: "62****1234",
          bankCode: "102",
          currency: "CNY",
          countryCode: "CN",
          email: null,
          phone: null,
          createdAt: "2025-02-14T12:00:00.000Z",
        },
      ],
    },
    null,
    2
  ),
};

const RECIPIENT_CREATE_SUCCESS: ExampleResponse = {
  status: 201,
  body: JSON.stringify(
    {
      id: "rec_abc",
      fullName: "Zhang Wei",
      bankName: "ICBC",
      accountNumber: "62****1234",
      bankCode: "102",
      currency: "CNY",
      countryCode: "CN",
      createdAt: "2025-02-14T12:00:00.000Z",
    },
    null,
    2
  ),
};

const TRANSFERS_LIST_SUCCESS: ExampleResponse = {
  status: 200,
  body: JSON.stringify(
    {
      transfers: [
        {
          id: "tr_xyz",
          amountNgn: 250000,
          amountGbp: "100.0000",
          fxRate: "0.000400",
          status: "payment_received",
          paymentReference: "KP-ABC123",
          paidAt: "2025-02-14T12:00:00.000Z",
          recipient: { id: "rec_abc", fullName: "Zhang Wei", currency: "CNY" },
          createdAt: "2025-02-14T11:00:00.000Z",
        },
      ],
    },
    null,
    2
  ),
};

const TRANSFER_CREATE_SUCCESS: ExampleResponse = {
  status: 201,
  body: JSON.stringify(
    {
      id: "tr_xyz",
      recipientId: "rec_abc",
      amountNgn: 250000,
      status: "pending_payment",
      paymentReference: "KP-ABC123",
      message: "Pay NGN using the payment endpoint with this reference.",
    },
    null,
    2
  ),
};

const FX_RATES_SUCCESS: ExampleResponse = {
  status: 200,
  body: JSON.stringify(
    { ngnPerGbp: 2500, gbpPerNgn: 0.0004, updatedAt: "2025-02-14T12:00:00.000Z" },
    null,
    2
  ),
};

const FX_QUOTE_SUCCESS: ExampleResponse = {
  status: 200,
  body: JSON.stringify(
    {
      amountNgn: 250000,
      amountGbp: "100.00",
      rate: "0.0004",
      expiresAt: "2025-02-14T12:15:00.000Z",
    },
    null,
    2
  ),
};

const PAYMENT_INIT_SUCCESS: ExampleResponse = {
  status: 200,
  body: JSON.stringify(
    {
      authorizationUrl: "https://checkout.paystack.com/xxx",
      reference: "KP-ABC123",
      transferId: "tr_xyz",
    },
    null,
    2
  ),
};

const BAD_REQUEST: ExampleResponse = {
  status: 400,
  body: JSON.stringify({ error: "Validation error", details: [] }, null, 2),
};

export const DOC_ENDPOINTS: DocEndpoint[] = [
  {
    id: "auth-me",
    method: "GET",
    path: "/api/auth/me",
    title: "Get current user",
    description: "Returns the authenticated user profile and key prefixes. Requires session cookie.",
    exampleSuccess: ME_SUCCESS,
    exampleError: ME_ERROR,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/auth/me', {
  credentials: 'include',
  headers: {
    'Authorization': 'Bearer ' + process.env.KICKPAY_SECRET_KEY,
  },
});
const data = await res.json();`,
      php: `$ch = curl_init('https://your-app.com/api/auth/me');
curl_setopt_array($ch, [
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer ' . getenv('KICKPAY_SECRET_KEY'),
  ],
  CURLOPT_RETURNTRANSFER => true,
]);
$response = curl_exec($ch);
$data = json_decode($response, true);`,
      python: `import os
import requests

url = "https://your-app.com/api/auth/me"
headers = {"Authorization": f"Bearer {os.environ['KICKPAY_SECRET_KEY']}"}
response = requests.get(url, headers=headers, cookies=...)  # or use session
data = response.json()`,
      curl: `curl -X GET 'https://your-app.com/api/auth/me' \\
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \\
  --cookie 'kickpay_session=...'`,
    },
  },
  {
    id: "recipients-list",
    method: "GET",
    path: "/api/recipients",
    title: "List recipients",
    description: "List all recipients (China payees) for the current user. Session auth.",
    exampleSuccess: RECIPIENTS_LIST_SUCCESS,
    exampleError: ME_ERROR,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/recipients', { credentials: 'include' });
const data = await res.json();`,
      php: `$ch = curl_init('https://your-app.com/api/recipients');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIE, 'kickpay_session=...');
$response = curl_exec($ch);
$data = json_decode($response, true);`,
      python: `import requests
url = "https://your-app.com/api/recipients"
response = requests.get(url, cookies=...)  # session
data = response.json()`,
      curl: `curl -X GET 'https://your-app.com/api/recipients' --cookie 'kickpay_session=...'`,
    },
  },
  {
    id: "recipients-create",
    method: "POST",
    path: "/api/recipients",
    title: "Create recipient",
    description: "Create a recipient (person in China). Body: fullName, accountNumber; optional bankName, bankCode, currency (default CNY), countryCode (default CN), email, phone.",
    bodySample: JSON.stringify(
      { fullName: "Zhang Wei", accountNumber: "6217001234567890", bankName: "ICBC", currency: "CNY", countryCode: "CN" },
      null,
      2
    ),
    exampleSuccess: RECIPIENT_CREATE_SUCCESS,
    exampleError: BAD_REQUEST,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/recipients', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Zhang Wei',
    accountNumber: '6217001234567890',
    bankName: 'ICBC',
    currency: 'CNY',
    countryCode: 'CN',
  }),
});
const data = await res.json();`,
      php: `$ch = curl_init('https://your-app.com/api/recipients');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode([
    'fullName' => 'Zhang Wei',
    'accountNumber' => '6217001234567890',
    'bankName' => 'ICBC',
    'currency' => 'CNY',
  ]),
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_COOKIE => 'kickpay_session=...',
]);
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
url = "https://your-app.com/api/recipients"
payload = {"fullName": "Zhang Wei", "accountNumber": "6217001234567890", "bankName": "ICBC", "currency": "CNY"}
response = requests.post(url, json=payload, cookies=...)
data = response.json()`,
      curl: `curl -X POST 'https://your-app.com/api/recipients' \\
  -H 'Content-Type: application/json' --cookie 'kickpay_session=...' \\
  -d '{"fullName":"Zhang Wei","accountNumber":"6217001234567890","bankName":"ICBC","currency":"CNY"}'`,
    },
  },
  {
    id: "recipients-get",
    method: "GET",
    path: "/api/recipients/:id",
    title: "Get recipient",
    description: "Get a single recipient by ID. Session auth; scoped to current user.",
    pathParams: ["id"],
    exampleSuccess: { status: 200, body: RECIPIENT_CREATE_SUCCESS.body },
    exampleError: PAYMENT_GET_ERROR,
    snippets: {
      node: `const id = 'rec_abc';
const res = await fetch('https://your-app.com/api/recipients/' + id, { credentials: 'include' });
const data = await res.json();`,
      php: `$id = 'rec_abc';
$ch = curl_init('https://your-app.com/api/recipients/' . $id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIE, 'kickpay_session=...');
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
rid = "rec_abc"
url = f"https://your-app.com/api/recipients/{rid}"
response = requests.get(url, cookies=...)
data = response.json()`,
      curl: `curl -X GET 'https://your-app.com/api/recipients/rec_abc' --cookie 'kickpay_session=...'`,
    },
  },
  {
    id: "transfers-list",
    method: "GET",
    path: "/api/transfers",
    title: "List transfers",
    description: "List the current user's transfers. Query: status?, limit? (default 20). Session auth.",
    exampleSuccess: TRANSFERS_LIST_SUCCESS,
    exampleError: ME_ERROR,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/transfers?status=payment_received&limit=20', { credentials: 'include' });
const data = await res.json();`,
      php: `$ch = curl_init('https://your-app.com/api/transfers?limit=20');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIE, 'kickpay_session=...');
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
url = "https://your-app.com/api/transfers"
params = {"status": "payment_received", "limit": 20}
response = requests.get(url, params=params, cookies=...)
data = response.json()`,
      curl: `curl -X GET 'https://your-app.com/api/transfers?limit=20' --cookie 'kickpay_session=...'`,
    },
  },
  {
    id: "transfers-create",
    method: "POST",
    path: "/api/transfers",
    title: "Create transfer",
    description: "Create a transfer. Body: recipientId, amountNgn (kobo). Returns paymentReference; use payments/initialize to get Paystack checkout URL.",
    bodySample: JSON.stringify({ recipientId: "rec_abc", amountNgn: 250000 }, null, 2),
    exampleSuccess: TRANSFER_CREATE_SUCCESS,
    exampleError: BAD_REQUEST,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/transfers', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recipientId: 'rec_abc', amountNgn: 250000 }),
});
const data = await res.json();`,
      php: `$ch = curl_init('https://your-app.com/api/transfers');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode(['recipientId' => 'rec_abc', 'amountNgn' => 250000]),
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_COOKIE => 'kickpay_session=...',
]);
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
url = "https://your-app.com/api/transfers"
payload = {"recipientId": "rec_abc", "amountNgn": 250000}
response = requests.post(url, json=payload, cookies=...)
data = response.json()`,
      curl: `curl -X POST 'https://your-app.com/api/transfers' \\
  -H 'Content-Type: application/json' --cookie 'kickpay_session=...' \\
  -d '{"recipientId":"rec_abc","amountNgn":250000}'`,
    },
  },
  {
    id: "transfers-get",
    method: "GET",
    path: "/api/transfers/:id",
    title: "Get transfer",
    description: "Get a single transfer by ID with recipient details. Session auth; scoped to current user.",
    pathParams: ["id"],
    exampleSuccess: { status: 200, body: JSON.stringify({ id: "tr_xyz", amountNgn: 250000, amountGbp: "100.00", status: "payment_received", recipient: { fullName: "Zhang Wei", currency: "CNY" } }, null, 2) },
    exampleError: PAYMENT_GET_ERROR,
    snippets: {
      node: `const id = 'tr_xyz';
const res = await fetch('https://your-app.com/api/transfers/' + id, { credentials: 'include' });
const data = await res.json();`,
      php: `$id = 'tr_xyz';
$ch = curl_init('https://your-app.com/api/transfers/' . $id);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIE, 'kickpay_session=...');
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
tid = "tr_xyz"
url = f"https://your-app.com/api/transfers/{tid}"
response = requests.get(url, cookies=...)
data = response.json()`,
      curl: `curl -X GET 'https://your-app.com/api/transfers/tr_xyz' --cookie 'kickpay_session=...'`,
    },
  },
  {
    id: "fx-rates",
    method: "GET",
    path: "/api/fx/rates",
    title: "Get FX rates",
    description: "Get current NGN→GBP rate for display. Replace with real FX engine / Haystack.",
    exampleSuccess: FX_RATES_SUCCESS,
    exampleError: ME_ERROR,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/fx/rates', { credentials: 'include' });
const data = await res.json();`,
      php: `$ch = curl_init('https://your-app.com/api/fx/rates');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIE, 'kickpay_session=...');
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
response = requests.get("https://your-app.com/api/fx/rates", cookies=...)
data = response.json()`,
      curl: `curl -X GET 'https://your-app.com/api/fx/rates' --cookie 'kickpay_session=...'`,
    },
  },
  {
    id: "fx-quote",
    method: "POST",
    path: "/api/fx/quote",
    title: "Get FX quote",
    description: "Get a quote for NGN→GBP. Body: amountNgn (kobo). Returns amountGbp, rate, expiresAt.",
    bodySample: JSON.stringify({ amountNgn: 250000 }, null, 2),
    exampleSuccess: FX_QUOTE_SUCCESS,
    exampleError: BAD_REQUEST,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/fx/quote', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amountNgn: 250000 }),
});
const data = await res.json();`,
      php: `$ch = curl_init('https://your-app.com/api/fx/quote');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode(['amountNgn' => 250000]),
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_COOKIE => 'kickpay_session=...',
]);
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
url = "https://your-app.com/api/fx/quote"
response = requests.post(url, json={"amountNgn": 250000}, cookies=...)
data = response.json()`,
      curl: `curl -X POST 'https://your-app.com/api/fx/quote' \\
  -H 'Content-Type: application/json' --cookie 'kickpay_session=...' \\
  -d '{"amountNgn":250000}'`,
    },
  },
  {
    id: "payments-initialize",
    method: "POST",
    path: "/api/payments/initialize",
    title: "Initialize payment",
    description: "Initialize NGN payment for a transfer. Body: transferId or paymentReference. Returns authorizationUrl (redirect user to Paystack) and reference.",
    bodySample: JSON.stringify({ transferId: "tr_xyz" }, null, 2),
    exampleSuccess: PAYMENT_INIT_SUCCESS,
    exampleError: BAD_REQUEST,
    snippets: {
      node: `const res = await fetch('https://your-app.com/api/payments/initialize', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transferId: 'tr_xyz' }),
});
const data = await res.json();
// Redirect user to data.authorizationUrl`,
      php: `$ch = curl_init('https://your-app.com/api/payments/initialize');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode(['transferId' => 'tr_xyz']),
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_COOKIE => 'kickpay_session=...',
]);
$data = json_decode(curl_exec($ch), true);`,
      python: `import requests
url = "https://your-app.com/api/payments/initialize"
response = requests.post(url, json={"transferId": "tr_xyz"}, cookies=...)
data = response.json()
# Redirect user to data["authorizationUrl"]`,
      curl: `curl -X POST 'https://your-app.com/api/payments/initialize' \\
  -H 'Content-Type: application/json' --cookie 'kickpay_session=...' \\
  -d '{"transferId":"tr_xyz"}'`,
    },
  },
];

export function getEndpointBySlug(slug: string): DocEndpoint | undefined {
  return DOC_ENDPOINTS.find((e) => e.id === slug);
}
