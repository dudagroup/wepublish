export interface MediaBase {
  focalPoint?: {
    x: number
    y: number
  }
}

export interface MediaInput extends MediaBase {
  file: any
  media?: unknown
}

export interface MediaDetail {
  id: string
  createdAt: Date
  modifiedAt: Date
  filename: string
  fileSize: number
  extension: string
  mimeType: string
  image: {
    format: string
    width: number
    height: number
  } | null
}

export type MediaPersisted = MediaBase & MediaDetail

export interface MediaOutput extends MediaBase {
  media?: MediaDetail & {transformURL: string}
}
