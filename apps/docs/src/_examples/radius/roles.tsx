const ROLES = [
  { className: 'rounded-md', label: 'rounded-md', note: '입력, 셀렉트' },
  { className: 'rounded-lg', label: 'rounded-lg', note: '카드, 다이얼로그' },
  { className: 'rounded-pill', label: 'rounded-pill', note: '버튼' },
];

export default function RadiusRoles() {
  return (
    <>
      {ROLES.map((role) => (
        <div key={role.label} className="flex flex-col items-center gap-2">
          <div className={`bg-muted border-border size-20 border ${role.className}`} />
          <code className="text-xs">{role.label}</code>
          <span className="text-muted-foreground text-caption">{role.note}</span>
        </div>
      ))}
    </>
  );
}
