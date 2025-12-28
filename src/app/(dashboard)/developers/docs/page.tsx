'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ENDPOINTS = [
  {
    id: 'auth',
    label: 'Authentication',
    icon: KeyIcon,
  },
  {
    id: 'list',
    label: 'List QR Codes',
    method: 'GET',
    path: '/qr-codes',
    icon: ListIcon,
  },
  {
    id: 'create',
    label: 'Create QR Code',
    method: 'POST',
    path: '/qr-codes',
    icon: PlusIcon,
  },
  {
    id: 'get',
    label: 'Get QR Code',
    method: 'GET',
    path: '/qr-codes/:id',
    icon: SearchIcon,
  },
  {
    id: 'update',
    label: 'Update QR Code',
    method: 'PATCH',
    path: '/qr-codes/:id',
    icon: EditIcon,
  },
  {
    id: 'delete',
    label: 'Delete QR Code',
    method: 'DELETE',
    path: '/qr-codes/:id',
    icon: TrashIcon,
  },
  {
    id: 'image',
    label: 'Get QR Image',
    method: 'GET',
    path: '/qr-codes/:id/image',
    icon: ImageIcon,
  },
];

export default function APIDocsPage() {
  const [activeSection, setActiveSection] = useState('auth');
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'javascript' | 'python'>('curl');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/developers"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to API
          </Link>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Complete reference for the QRWolf REST API
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {ENDPOINTS.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setActiveSection(endpoint.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                  activeSection === endpoint.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <endpoint.icon className="w-4 h-4" />
                {endpoint.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Authentication */}
          {activeSection === 'auth' && (
            <div className="space-y-6">
              <Card className="p-6 glass">
                <h2 className="text-xl font-semibold mb-4">Authentication</h2>
                <p className="text-muted-foreground mb-4">
                  All API requests require authentication using an API key. Include your key in the
                  <code className="mx-1 px-1.5 py-0.5 bg-secondary rounded text-sm">Authorization</code>
                  header.
                </p>
                <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
                  Authorization: Bearer your_api_key
                </div>
              </Card>

              <Card className="p-6 glass">
                <h3 className="font-semibold mb-3">Base URL</h3>
                <code className="block bg-secondary/50 rounded-lg p-4 text-sm">
                  https://qrwolf.com/api/v1
                </code>
              </Card>

              <Card className="p-6 glass">
                <h3 className="font-semibold mb-3">Rate Limits</h3>
                <p className="text-muted-foreground text-sm">
                  Business tier accounts are limited to <strong>10,000 requests per month</strong>.
                  Rate limit information is included in response headers.
                </p>
              </Card>

              <Card className="p-6 glass">
                <h3 className="font-semibold mb-3">Error Responses</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  All errors return a JSON object with an <code className="px-1 bg-secondary rounded">error</code> field.
                </p>
                <pre className="bg-secondary/50 rounded-lg p-4 text-sm overflow-x-auto">
{`{
  "error": "Invalid or missing API key"
}`}
                </pre>
              </Card>
            </div>
          )}

          {/* List QR Codes */}
          {activeSection === 'list' && (
            <EndpointDoc
              method="GET"
              path="/qr-codes"
              description="Retrieve a paginated list of all QR codes belonging to the authenticated user."
              queryParams={[
                { name: 'limit', type: 'number', description: 'Max results to return (1-100, default: 50)' },
                { name: 'offset', type: 'number', description: 'Number of results to skip (default: 0)' },
                { name: 'type', type: 'string', description: 'Filter by type: "static" or "dynamic"' },
              ]}
              responseExample={`{
  "data": {
    "qr_codes": [
      {
        "id": "uuid-here",
        "name": "My QR Code",
        "type": "dynamic",
        "content_type": "url",
        "short_code": "abc1234",
        "scan_count": 42,
        "created_at": "2025-01-15T10:30:00Z",
        "redirect_url": "https://qrwolf.com/r/abc1234",
        "image_url": "https://qrwolf.com/api/v1/qr-codes/uuid-here/image",
        "image_url_svg": "https://qrwolf.com/api/v1/qr-codes/uuid-here/image?format=svg"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}`}
              codeExamples={{
                curl: `curl -X GET "https://qrwolf.com/api/v1/qr-codes?limit=10" \\
  -H "Authorization: Bearer your_api_key"`,
                javascript: `const response = await fetch('https://qrwolf.com/api/v1/qr-codes?limit=10', {
  headers: {
    'Authorization': 'Bearer your_api_key'
  }
});
const { data } = await response.json();
console.log(data.qr_codes);`,
                python: `import requests

response = requests.get(
    'https://qrwolf.com/api/v1/qr-codes',
    params={'limit': 10},
    headers={'Authorization': 'Bearer your_api_key'}
)
data = response.json()['data']
print(data['qr_codes'])`
              }}
              activeCodeTab={activeCodeTab}
              setActiveCodeTab={setActiveCodeTab}
            />
          )}

          {/* Create QR Code */}
          {activeSection === 'create' && (
            <EndpointDoc
              method="POST"
              path="/qr-codes"
              description="Create a new QR code with optional styling."
              bodyParams={[
                { name: 'name', type: 'string', required: true, description: 'Display name for the QR code' },
                { name: 'type', type: 'string', description: '"static" or "dynamic" (default: "dynamic")' },
                { name: 'content_type', type: 'string', description: 'Content type (default: "url")' },
                { name: 'content', type: 'object', required: true, description: 'Content data (e.g., { "type": "url", "url": "https://example.com" })' },
                { name: 'style', type: 'object', description: 'Style options (foregroundColor, backgroundColor, errorCorrectionLevel, margin)' },
                { name: 'expires_at', type: 'string', description: 'ISO date string for expiration' },
                { name: 'active_from', type: 'string', description: 'ISO date string for scheduled activation' },
                { name: 'active_until', type: 'string', description: 'ISO date string for scheduled deactivation' },
              ]}
              responseExample={`{
  "data": {
    "id": "uuid-here",
    "name": "Product QR",
    "type": "dynamic",
    "content_type": "url",
    "short_code": "xyz7890",
    "scan_count": 0,
    "created_at": "2025-01-15T10:30:00Z",
    "style": {
      "foregroundColor": "#1a365d",
      "backgroundColor": "#ffffff",
      "errorCorrectionLevel": "M",
      "margin": 2
    },
    "redirect_url": "https://qrwolf.com/r/xyz7890",
    "image_url": "https://qrwolf.com/api/v1/qr-codes/uuid-here/image",
    "image_url_svg": "https://qrwolf.com/api/v1/qr-codes/uuid-here/image?format=svg"
  }
}`}
              codeExamples={{
                curl: `curl -X POST "https://qrwolf.com/api/v1/qr-codes" \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Product QR",
    "content": {
      "type": "url",
      "url": "https://example.com/product"
    },
    "style": {
      "foregroundColor": "#1a365d",
      "backgroundColor": "#ffffff"
    }
  }'`,
                javascript: `const response = await fetch('https://qrwolf.com/api/v1/qr-codes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Product QR',
    content: {
      type: 'url',
      url: 'https://example.com/product'
    },
    style: {
      foregroundColor: '#1a365d',
      backgroundColor: '#ffffff'
    }
  })
});
const { data } = await response.json();
console.log(data.image_url);`,
                python: `import requests

response = requests.post(
    'https://qrwolf.com/api/v1/qr-codes',
    headers={
        'Authorization': 'Bearer your_api_key',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'Product QR',
        'content': {
            'type': 'url',
            'url': 'https://example.com/product'
        },
        'style': {
            'foregroundColor': '#1a365d',
            'backgroundColor': '#ffffff'
        }
    }
)
data = response.json()['data']
print(data['image_url'])`
              }}
              activeCodeTab={activeCodeTab}
              setActiveCodeTab={setActiveCodeTab}
            />
          )}

          {/* Get QR Code */}
          {activeSection === 'get' && (
            <EndpointDoc
              method="GET"
              path="/qr-codes/:id"
              description="Retrieve details of a specific QR code."
              pathParams={[
                { name: 'id', type: 'string', required: true, description: 'The UUID of the QR code' },
              ]}
              responseExample={`{
  "data": {
    "id": "uuid-here",
    "name": "My QR Code",
    "type": "dynamic",
    "content_type": "url",
    "content": {
      "type": "url",
      "url": "https://example.com"
    },
    "short_code": "abc1234",
    "destination_url": "https://example.com",
    "scan_count": 42,
    "created_at": "2025-01-15T10:30:00Z",
    "style": {
      "foregroundColor": "#000000",
      "backgroundColor": "#ffffff",
      "errorCorrectionLevel": "M",
      "margin": 2
    },
    "redirect_url": "https://qrwolf.com/r/abc1234",
    "image_url": "https://qrwolf.com/api/v1/qr-codes/uuid-here/image",
    "image_url_svg": "https://qrwolf.com/api/v1/qr-codes/uuid-here/image?format=svg"
  }
}`}
              codeExamples={{
                curl: `curl -X GET "https://qrwolf.com/api/v1/qr-codes/uuid-here" \\
  -H "Authorization: Bearer your_api_key"`,
                javascript: `const qrCodeId = 'uuid-here';
const response = await fetch(\`https://qrwolf.com/api/v1/qr-codes/\${qrCodeId}\`, {
  headers: {
    'Authorization': 'Bearer your_api_key'
  }
});
const { data } = await response.json();
console.log(data);`,
                python: `import requests

qr_code_id = 'uuid-here'
response = requests.get(
    f'https://qrwolf.com/api/v1/qr-codes/{qr_code_id}',
    headers={'Authorization': 'Bearer your_api_key'}
)
data = response.json()['data']
print(data)`
              }}
              activeCodeTab={activeCodeTab}
              setActiveCodeTab={setActiveCodeTab}
            />
          )}

          {/* Update QR Code */}
          {activeSection === 'update' && (
            <EndpointDoc
              method="PATCH"
              path="/qr-codes/:id"
              description="Update an existing QR code's properties."
              pathParams={[
                { name: 'id', type: 'string', required: true, description: 'The UUID of the QR code' },
              ]}
              bodyParams={[
                { name: 'name', type: 'string', description: 'New display name' },
                { name: 'content', type: 'object', description: 'Updated content data' },
                { name: 'destination_url', type: 'string', description: 'New destination URL (dynamic QR only)' },
                { name: 'style', type: 'object', description: 'Updated style options' },
                { name: 'expires_at', type: 'string', description: 'ISO date string for expiration' },
              ]}
              responseExample={`{
  "data": {
    "id": "uuid-here",
    "name": "Updated QR Name",
    "type": "dynamic",
    "destination_url": "https://newsite.com",
    "scan_count": 42,
    "image_url": "https://qrwolf.com/api/v1/qr-codes/uuid-here/image"
  }
}`}
              codeExamples={{
                curl: `curl -X PATCH "https://qrwolf.com/api/v1/qr-codes/uuid-here" \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated QR Name",
    "destination_url": "https://newsite.com",
    "style": {
      "foregroundColor": "#ff0000"
    }
  }'`,
                javascript: `const qrCodeId = 'uuid-here';
const response = await fetch(\`https://qrwolf.com/api/v1/qr-codes/\${qrCodeId}\`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated QR Name',
    destination_url: 'https://newsite.com',
    style: { foregroundColor: '#ff0000' }
  })
});
const { data } = await response.json();`,
                python: `import requests

qr_code_id = 'uuid-here'
response = requests.patch(
    f'https://qrwolf.com/api/v1/qr-codes/{qr_code_id}',
    headers={
        'Authorization': 'Bearer your_api_key',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'Updated QR Name',
        'destination_url': 'https://newsite.com',
        'style': {'foregroundColor': '#ff0000'}
    }
)
data = response.json()['data']`
              }}
              activeCodeTab={activeCodeTab}
              setActiveCodeTab={setActiveCodeTab}
            />
          )}

          {/* Delete QR Code */}
          {activeSection === 'delete' && (
            <EndpointDoc
              method="DELETE"
              path="/qr-codes/:id"
              description="Permanently delete a QR code. This action cannot be undone."
              pathParams={[
                { name: 'id', type: 'string', required: true, description: 'The UUID of the QR code to delete' },
              ]}
              responseExample="No content (204 status code)"
              codeExamples={{
                curl: `curl -X DELETE "https://qrwolf.com/api/v1/qr-codes/uuid-here" \\
  -H "Authorization: Bearer your_api_key"`,
                javascript: `const qrCodeId = 'uuid-here';
const response = await fetch(\`https://qrwolf.com/api/v1/qr-codes/\${qrCodeId}\`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer your_api_key'
  }
});
if (response.status === 204) {
  console.log('QR code deleted');
}`,
                python: `import requests

qr_code_id = 'uuid-here'
response = requests.delete(
    f'https://qrwolf.com/api/v1/qr-codes/{qr_code_id}',
    headers={'Authorization': 'Bearer your_api_key'}
)
if response.status_code == 204:
    print('QR code deleted')`
              }}
              activeCodeTab={activeCodeTab}
              setActiveCodeTab={setActiveCodeTab}
            />
          )}

          {/* Get QR Image */}
          {activeSection === 'image' && (
            <EndpointDoc
              method="GET"
              path="/qr-codes/:id/image"
              description="Generate and return the QR code as an image. Returns binary image data (PNG or SVG)."
              pathParams={[
                { name: 'id', type: 'string', required: true, description: 'The UUID of the QR code' },
              ]}
              queryParams={[
                { name: 'format', type: 'string', description: '"png" or "svg" (default: "png")' },
                { name: 'size', type: 'number', description: 'Image size in pixels: 128-2048 (default: 512)' },
                { name: 'download', type: 'boolean', description: 'Set to "true" to trigger file download' },
              ]}
              responseExample={`Binary image data with Content-Type:
- image/png for PNG format
- image/svg+xml for SVG format

Use directly in <img> tags or save to file.`}
              codeExamples={{
                curl: `# Get PNG image
curl -X GET "https://qrwolf.com/api/v1/qr-codes/uuid-here/image?size=256" \\
  -H "Authorization: Bearer your_api_key" \\
  --output qrcode.png

# Get SVG image
curl -X GET "https://qrwolf.com/api/v1/qr-codes/uuid-here/image?format=svg" \\
  -H "Authorization: Bearer your_api_key" \\
  --output qrcode.svg`,
                javascript: `// Get image as blob
const qrCodeId = 'uuid-here';
const response = await fetch(
  \`https://qrwolf.com/api/v1/qr-codes/\${qrCodeId}/image?size=512\`,
  {
    headers: {
      'Authorization': 'Bearer your_api_key'
    }
  }
);
const blob = await response.blob();

// Create URL for display
const imageUrl = URL.createObjectURL(blob);
document.getElementById('qr-image').src = imageUrl;

// Or embed in HTML directly (with API key in header)
// <img src="https://qrwolf.com/api/v1/qr-codes/uuid/image" />`,
                python: `import requests

qr_code_id = 'uuid-here'

# Get PNG
response = requests.get(
    f'https://qrwolf.com/api/v1/qr-codes/{qr_code_id}/image',
    params={'size': 512, 'format': 'png'},
    headers={'Authorization': 'Bearer your_api_key'}
)

with open('qrcode.png', 'wb') as f:
    f.write(response.content)

# Get SVG
response = requests.get(
    f'https://qrwolf.com/api/v1/qr-codes/{qr_code_id}/image',
    params={'format': 'svg'},
    headers={'Authorization': 'Bearer your_api_key'}
)

with open('qrcode.svg', 'w') as f:
    f.write(response.text)`
              }}
              activeCodeTab={activeCodeTab}
              setActiveCodeTab={setActiveCodeTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface Param {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

interface EndpointDocProps {
  method: string;
  path: string;
  description: string;
  pathParams?: Param[];
  queryParams?: Param[];
  bodyParams?: Param[];
  responseExample: string;
  codeExamples: {
    curl: string;
    javascript: string;
    python: string;
  };
  activeCodeTab: 'curl' | 'javascript' | 'python';
  setActiveCodeTab: (tab: 'curl' | 'javascript' | 'python') => void;
}

function EndpointDoc({
  method,
  path,
  description,
  pathParams,
  queryParams,
  bodyParams,
  responseExample,
  codeExamples,
  activeCodeTab,
  setActiveCodeTab,
}: EndpointDocProps) {
  const methodColors: Record<string, string> = {
    GET: 'bg-emerald-500/20 text-emerald-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PATCH: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 glass">
        <div className="flex items-center gap-3 mb-3">
          <span className={cn('px-2 py-1 rounded text-xs font-mono font-bold', methodColors[method])}>
            {method}
          </span>
          <code className="text-lg">/api/v1{path}</code>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </Card>

      {/* Parameters */}
      {(pathParams || queryParams || bodyParams) && (
        <Card className="p-6 glass">
          <h3 className="font-semibold mb-4">Parameters</h3>
          <div className="space-y-4">
            {pathParams && pathParams.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Path Parameters</h4>
                <ParamsTable params={pathParams} />
              </div>
            )}
            {queryParams && queryParams.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Query Parameters</h4>
                <ParamsTable params={queryParams} />
              </div>
            )}
            {bodyParams && bodyParams.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Request Body</h4>
                <ParamsTable params={bodyParams} />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Code Examples */}
      <Card className="p-6 glass">
        <h3 className="font-semibold mb-4">Code Examples</h3>
        <div className="flex gap-2 mb-3">
          {(['curl', 'javascript', 'python'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeCodeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCodeTab(tab)}
            >
              {tab === 'curl' ? 'cURL' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
        <pre className="bg-secondary/50 rounded-lg p-4 text-sm overflow-x-auto">
          {codeExamples[activeCodeTab]}
        </pre>
      </Card>

      {/* Response */}
      <Card className="p-6 glass">
        <h3 className="font-semibold mb-4">Response</h3>
        <pre className="bg-secondary/50 rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap">
          {responseExample}
        </pre>
      </Card>
    </div>
  );
}

function ParamsTable({ params }: { params: Param[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/30">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Name</th>
            <th className="px-4 py-2 text-left font-medium">Type</th>
            <th className="px-4 py-2 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.name} className="border-t border-border">
              <td className="px-4 py-2">
                <code className="text-primary">{param.name}</code>
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </td>
              <td className="px-4 py-2 text-muted-foreground">{param.type}</td>
              <td className="px-4 py-2 text-muted-foreground">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Icons
function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
