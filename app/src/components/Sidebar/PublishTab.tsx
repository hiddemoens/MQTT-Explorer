import React from 'react'

const Publish = React.lazy(() => import('./Publish/Publish'))

export default function PublishTab({ connectionId }: { connectionId?: string }) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Publish connectionId={connectionId} />
    </React.Suspense>
  )
}
