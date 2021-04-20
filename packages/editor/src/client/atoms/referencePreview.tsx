import React from 'react'
import {Tag, TagGroup} from 'rsuite'
import {useContentGetQuery} from '../api'
import {Reference} from '../interfaces/referenceType'
import {ContentEditRoute, Link} from '../route'
import {RecordPreview} from './recordPreview'

export function ReferencePreview({
  reference,
  onClose
}: {
  readonly reference?: Reference | null
  readonly onClose: (event: React.MouseEvent<HTMLElement>) => void
}) {
  if (!reference) return null

  const {data} = useContentGetQuery({
    variables: {
      id: reference.recordId
    }
  })

  let revSummary = <>{`Type: ${reference.contentType} Id: ${reference.recordId}`}</>
  if (data?.content._all.read.title) {
    revSummary = <RecordPreview record={data.content._all.read} />
  }
  return (
    <TagGroup>
      <Tag closable onClose={onClose}>
        <Link
          route={ContentEditRoute.create({type: reference.contentType, id: reference.recordId})}>
          {revSummary}
        </Link>
      </Tag>
    </TagGroup>
  )
}
