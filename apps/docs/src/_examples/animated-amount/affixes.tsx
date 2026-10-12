import { AnimatedAmount } from '@repo/ui/animated-amount';

export default function AnimatedAmountAffixes() {
  return (
    <div className="text-body flex flex-col items-center gap-2">
      <AnimatedAmount value={52_900_000} />
      <AnimatedAmount value={52_900_000} prefix="약 " suffix="원부터" />
      <AnimatedAmount
        value={4.5}
        suffix="%"
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      />
    </div>
  );
}
