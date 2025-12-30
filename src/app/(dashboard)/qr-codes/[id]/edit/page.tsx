import { QRStudio } from '@/components/qr/studio';

interface EditQRCodePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQRCodePage({ params }: EditQRCodePageProps) {
  const { id } = await params;
  return <QRStudio mode="edit" qrCodeId={id} />;
}
