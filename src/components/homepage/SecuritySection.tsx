import { SecurityCard } from './ui';
import { ShieldCheckIcon, LockIcon, ClockIcon, UsersIcon } from '@/components/icons';

export function SecuritySection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Enterprise-grade <span className="gradient-text">security</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Your data is protected with industry-leading security practices
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SecurityCard
            icon={<ShieldCheckIcon />}
            title="TLS 1.3 Encryption"
            description="Data encrypted in transit"
          />
          <SecurityCard
            icon={<LockIcon />}
            title="Encrypted at Rest"
            description="AES-256 encryption"
          />
          <SecurityCard
            icon={<ClockIcon />}
            title="99.9% Uptime SLA"
            description="Enterprise reliability"
          />
          <SecurityCard
            icon={<UsersIcon />}
            title="Privacy First"
            description="We never sell your data"
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            GDPR compliant • SOC 2 Type II • Anonymous scan tracking only
          </p>
        </div>
      </div>
    </section>
  );
}
