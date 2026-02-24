import { isNil } from "lodash";

export const isExists = (value: any) => !isNil(value);
export const isDefined = (value: any) => !!value;
