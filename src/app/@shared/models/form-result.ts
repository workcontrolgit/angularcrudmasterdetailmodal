import { Position } from '@shared/models/position';

export interface FormResult {
  position: Position;
  crudType: string;
  status: boolean;
}
