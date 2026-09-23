export type T_ApiEntityId = string | number;

export type T_DeleteResult<TId extends T_ApiEntityId = T_ApiEntityId> = {
  id: TId;
};

export type T_EntityApiContract<
  TEntity,
  TId extends T_ApiEntityId,
  TCreateDto,
  TUpdateDto,
  TListParams = undefined,
> = {
  list: (params?: TListParams) => Promise<TEntity[]>;
  getById: (id: TId) => Promise<TEntity>;
  create: (input: TCreateDto) => Promise<TEntity>;
  update: (input: TUpdateDto) => Promise<TEntity>;
  remove: (id: TId) => Promise<TId>;
};

export class ApiError<TCode extends string = string> extends Error {
  constructor(
    public readonly code: TCode,
    message: string = code,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}

export const isApiError = <TCode extends string>(
  error: unknown,
  code?: TCode,
): error is ApiError<TCode> =>
  error instanceof ApiError && (code === undefined || error.code === code);
