export type PaginationParams = {offset?: string; limit: number};
export interface ListItems<T, U> {
  items: T[];
  offset?: U | undefined;
}
