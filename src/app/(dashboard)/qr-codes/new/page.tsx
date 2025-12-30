import { redirect } from 'next/navigation';

export default function NewQRCodePage() {
  redirect('/qr-codes/create');
}
