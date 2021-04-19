export interface MediaMedia {
  createdAt: Date
  modifiedAt: Date
  filename: string
  fileSize: number
  extension: string
  mimeType: string
  image?: {
    width: number
    height: number
    format: string
  }
  url: string
}
export interface Media {
  id: string
  file: File
  focalPoint: {
    x: number
    y: number
  }
  media?: MediaMedia
}
