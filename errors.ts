export enum ErrorKind {
  Uninitialized = 'Uninitialized',
  NoTfcToken = 'NoTfcToken',
  NoHomeDirectory = 'NoHomeDirectory',
  NoConfigDirectory = 'NoConfigDirectory',
  NoCacheDirectory = 'NoCacheDirectory',
}

export class TfzError extends Error {
  kind: ErrorKind

  constructor(kind: ErrorKind) {
    let msg: string
    switch (kind) {
    case ErrorKind.Uninitialized:
      msg = 'tfz has not been initialized. Create ~/.config/tfz/config.json first.'
      break
    case ErrorKind.NoTfcToken:
      msg = 'Could not load tfc token. Try `terraform login`'
      break
    case ErrorKind.NoHomeDirectory:
      msg = 'Could not find home directory.'
      break
    case ErrorKind.NoCacheDirectory:
      msg = 'Could not find cache directory.'
      break
    case ErrorKind.NoConfigDirectory:
      msg = 'Could not find config directory.'
      break
    }
    super(msg)
    this.kind = kind
  }
}
