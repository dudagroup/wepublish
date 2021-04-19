export interface MediaBase {
  id: string
  focalPoint?: {
    x: number
    y: number
  }
  media?: unknown
}

export interface MediaInput extends MediaBase {
  id: string
  file: any
}
