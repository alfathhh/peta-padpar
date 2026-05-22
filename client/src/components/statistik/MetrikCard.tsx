interface MetrikCardProps {
  indikator: string;
  nilai: number;
  satuan?: string;
  tahun: number;
}

export default function MetrikCard({ indikator, nilai, satuan, tahun }: MetrikCardProps) {
  return (
    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {indikator}
      </p>
      <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
        {nilai.toLocaleString('id-ID')}
        {satuan && (
          <span className="text-sm font-normal text-slate-500 ml-1">{satuan}</span>
        )}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">Tahun {tahun}</p>
    </div>
  );
}
