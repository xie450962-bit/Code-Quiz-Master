type ApiBinding = {
  fetch(request: Request): Promise<Response>;
};

export const onRequest = ({ request, env }: { request: Request; env: { API: ApiBinding } }) =>
  env.API.fetch(request);
