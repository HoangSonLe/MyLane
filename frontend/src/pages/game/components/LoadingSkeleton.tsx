import { SkeletonTile } from './SkeletonTile'

export function LoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4">
      <div className="flex items-center justify-between pt-2">
        <div className="skeleton h-8 w-8 rounded-xl" />
        <div className="skeleton h-5 w-32 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-xl" />
      </div>
      <div className="skeleton mx-auto h-14 w-48 rounded-2xl" />
      <div className="flex flex-col items-center gap-2">
        <div className="skeleton h-7 w-40 rounded-lg" />
        <div className="skeleton h-4 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-4 px-2">
        {[0, 1, 2, 3].map((i) => <SkeletonTile key={i} />)}
      </div>
      <div className="skeleton mt-auto h-14 w-full rounded-2xl" />
    </div>
  )
}
