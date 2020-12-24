export enum SwapType {
  Atomic = 'Atomic',
  Direct = 'Direct',
}

export enum DirectSwapStep {
  TakerSendsToMaker = 'TakerSendsToMaker',
  MakerSendsToTaker = 'MakerSendsToTaker',
  Finished = 'Finished',
}
