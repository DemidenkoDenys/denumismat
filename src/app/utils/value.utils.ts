import { isNil } from "lodash-es";

export const isExists = (value: any) => !isNil(value);
export const isDefined = (value: any) => !!value;
