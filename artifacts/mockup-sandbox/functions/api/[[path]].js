export function onRequest({ request, env }) {
  return env.API.fetch(request);
}
