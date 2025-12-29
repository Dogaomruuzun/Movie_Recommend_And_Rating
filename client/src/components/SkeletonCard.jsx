
//This component is a skeleton loader component used to display a placeholder animation while content is loading.
export default function SkeletonCard({ lines = 2 }) {
  return (
    <div className="card skeleton">
      <div className="poster shimmer" />
      <div className="card-body">
        <div className="line shimmer" style={{ width: '70%' }} />
        <div className="line shimmer" style={{ width: '40%', marginTop: 8 }} />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="line shimmer" style={{ width: `${80 - i * 10}%`, marginTop: 8 }} />
        ))}
      </div>
    </div>
  )
}



