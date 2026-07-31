export function LoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-5 px-4 pt-4">
      <div className="skeleton h-14 w-full rounded-2xl" />
      <div className="flex justify-around">
        <div className="skeleton h-10 w-20 rounded-xl" />
        <div className="skeleton h-10 w-20 rounded-xl" />
        <div className="skeleton h-10 w-20 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[0,1,2,3].map((i) => (
          <div key={i} className="skeleton aspect-square w-full rounded-2xl" />
        ))}
      </div>
      <div className="mt-auto skeleton h-14 w-full rounded-2xl" />
    </div>
  )
}
