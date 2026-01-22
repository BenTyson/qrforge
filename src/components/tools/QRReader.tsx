'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import jsQR from 'jsqr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Camera,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  Mail,
  Phone,
  Wifi,
  User,
  FileText,
  ArrowRight,
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface DecodedResult {
  data: string;
  type: string;
  typeIcon: React.ReactNode;
  typeLabel: string;
}

function detectQRType(data: string): { type: string; icon: React.ReactNode; label: string } {
  // URL
  if (/^https?:\/\//i.test(data)) {
    return { type: 'url', icon: <LinkIcon className="w-5 h-5" />, label: 'URL' };
  }
  // Email
  if (/^mailto:/i.test(data) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
    return { type: 'email', icon: <Mail className="w-5 h-5" />, label: 'Email' };
  }
  // Phone
  if (/^tel:/i.test(data) || /^\+?[\d\s\-()]{7,}$/.test(data)) {
    return { type: 'phone', icon: <Phone className="w-5 h-5" />, label: 'Phone' };
  }
  // WiFi
  if (/^WIFI:/i.test(data)) {
    return { type: 'wifi', icon: <Wifi className="w-5 h-5" />, label: 'WiFi Network' };
  }
  // vCard
  if (/^BEGIN:VCARD/i.test(data)) {
    return { type: 'vcard', icon: <User className="w-5 h-5" />, label: 'Contact Card' };
  }
  // SMS
  if (/^sms:/i.test(data) || /^smsto:/i.test(data)) {
    return { type: 'sms', icon: <FileText className="w-5 h-5" />, label: 'SMS' };
  }
  // Default to text
  return { type: 'text', icon: <FileText className="w-5 h-5" />, label: 'Text' };
}

function parseWiFi(data: string): { ssid?: string; password?: string; type?: string } | null {
  if (!/^WIFI:/i.test(data)) return null;
  const ssidMatch = data.match(/S:([^;]*)/);
  const passMatch = data.match(/P:([^;]*)/);
  const typeMatch = data.match(/T:([^;]*)/);
  return {
    ssid: ssidMatch?.[1],
    password: passMatch?.[1],
    type: typeMatch?.[1],
  };
}

export function QRReader() {
  const [result, setResult] = useState<DecodedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((imageData: ImageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      const typeInfo = detectQRType(code.data);
      setResult({
        data: code.data,
        type: typeInfo.type,
        typeIcon: typeInfo.icon,
        typeLabel: typeInfo.label,
      });
      setError(null);
    } else {
      setResult(null);
      setError('No QR code found in image. Make sure the QR code is clear and well-lit.');
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        processImage(imageData);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setIsProcessing(false);
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const wifiInfo = result?.type === 'wifi' ? parseWiFi(result.data) : null;

  return (
    <div className="space-y-6" onPaste={handlePaste}>
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Upload Card */}
      <Card
        className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up"
        style={{ animationDelay: '80ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isProcessing
                ? 'border-primary/50 bg-primary/5'
                : 'border-slate-600 hover:border-primary/50 hover:bg-slate-700/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Uploaded QR code"
                  className="max-w-[200px] max-h-[200px] mx-auto rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="mx-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Upload Different Image
                </Button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-primary" />
                  )}
                </div>
                <p className="text-lg font-medium mb-2">
                  {isProcessing ? 'Processing...' : 'Drop image here or click to upload'}
                </p>
                <p className="text-sm text-slate-400">
                  Supports PNG, JPG, GIF, WebP
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  You can also paste an image from clipboard (Ctrl+V / Cmd+V)
                </p>
              </>
            )}
          </div>

          {/* Camera Button (Mobile) */}
          <div className="mt-4 text-center md:hidden">
            <Button
              variant="outline"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                  fileInputRef.current.removeAttribute('capture');
                }
              }}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card
          className="bg-red-500/10 backdrop-blur-xl border-red-500/30 animate-slide-up"
          style={{ animationDelay: '160ms' }}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-400">Could not decode QR code</p>
                <p className="text-sm text-slate-400 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Card */}
      {result && (
        <Card
          className="bg-slate-800/50 backdrop-blur-xl border-primary/30 glow animate-slide-up"
          style={{ animationDelay: '160ms' }}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary">QR Code Decoded Successfully</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400">{result.typeIcon}</span>
                  <span className="text-sm text-slate-400">{result.typeLabel}</span>
                </div>
              </div>
            </div>

            {/* Content Display */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-mono break-all text-slate-200">
                  {result.data}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* WiFi Details */}
            {wifiInfo && (
              <div className="bg-slate-900/50 rounded-lg p-4 mb-4 space-y-2">
                <p className="text-sm font-medium text-slate-300">WiFi Network Details</p>
                {wifiInfo.ssid && (
                  <p className="text-sm text-slate-400">
                    <span className="text-slate-500">Network:</span> {wifiInfo.ssid}
                  </p>
                )}
                {wifiInfo.password && (
                  <p className="text-sm text-slate-400">
                    <span className="text-slate-500">Password:</span> {wifiInfo.password}
                  </p>
                )}
                {wifiInfo.type && (
                  <p className="text-sm text-slate-400">
                    <span className="text-slate-500">Security:</span> {wifiInfo.type}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {result.type === 'url' && (
                <a href={result.data} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open URL
                  </Button>
                </a>
              )}
              {result.type === 'email' && (
                <a href={result.data.startsWith('mailto:') ? result.data : `mailto:${result.data}`}>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </a>
              )}
              {result.type === 'phone' && (
                <a href={result.data.startsWith('tel:') ? result.data : `tel:${result.data}`}>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Number
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card
        className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up"
        style={{ animationDelay: '240ms' }}
      >
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Tips for Best Results</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Ensure the QR code is well-lit and in focus</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>The QR code should take up most of the image</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Avoid glare, shadows, or obstructions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Higher resolution images decode more reliably</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div
        className="text-center pt-4 animate-slide-up"
        style={{ animationDelay: '320ms' }}
      >
        <p className="text-slate-400 mb-4">
          Need to create your own QR code?
        </p>
        <Link href="/qr-codes/new">
          <Button size="lg" className="glow-hover group">
            Create QR Code Free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
